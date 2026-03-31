// app/api/admin/invitations/bulk/route.js
import "server-only";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";
import { createInviteToken } from "@/lib/invitations";
import { findCourseByUserInput } from "@/lib/courses/courseKey";
import { sendInvitationEmail } from "@/lib/email/sendInvitationEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { appUser: requester } = await requireAppUser({
      roles: ["ADMINISTRATIVE"],
      requireProfileCompleted: true,
    });

    const institutionId = requester.institutionId;
    const body = await req.json().catch(() => null);

    if (!body?.rows || !Array.isArray(body.rows) || !body.rows.length) {
      return NextResponse.json({ message: "Body inválido: rows[] requerido." }, { status: 400 });
    }

    // Filtrar filas que no quieren invitación
    const rowsToProcess = body.rows.filter((r) => r.sendInvite !== false);

    if (!rowsToProcess.length) {
      return NextResponse.json({ ok: true, created: 0, skipped: body.rows.length, errors: [] });
    }

    // Batch: traer emails existentes de usuarios e invitaciones activas de una sola vez
    const emails = rowsToProcess.map((r) => String(r.email).trim().toLowerCase());

    const [existingUsers, existingInvites] = await Promise.all([
      prisma.appUser.findMany({
        where: { institutionId, email: { in: emails } },
        select: { email: true },
      }),
      prisma.invitation.findMany({
        where: {
          institutionId,
          email: { in: emails },
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { email: true },
      }),
    ]);

    const existingEmailSet = new Set([
      ...existingUsers.map((u) => u.email),
      ...existingInvites.map((i) => i.email),
    ]);

    // Resolver todos los nombres de cursos únicos de una sola vez
    const allCourseNames = new Set();
    rowsToProcess.forEach((r) => {
      if (r.studentCourseName) allCourseNames.add(r.studentCourseName);
      if (r.teacherCourseNames) r.teacherCourseNames.forEach((c) => allCourseNames.add(c));
      if (r.teacherChiefCourseName) allCourseNames.add(r.teacherChiefCourseName);
    });

    const courseCache = {};
    await Promise.all(
      [...allCourseNames].map(async (name) => {
        const course = await findCourseByUserInput(prisma, institutionId, name);
        courseCache[name] = course ?? null;
      })
    );

    // Obtener institución para el email
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { name: true },
    });

    const result = { created: 0, skipped: 0, errors: [] };
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 días

    for (const r of rowsToProcess) {
      const email = String(r.email).trim().toLowerCase();

      try {
        // Skip si ya existe
        if (existingEmailSet.has(email)) {
          result.skipped++;
          continue;
        }

        const role = String(r.role).trim();
        let studentCourseId = null;
        let teacherAssignments = [];

        // Resolver cursos
        if (role === "STUDENT") {
          const course = courseCache[r.studentCourseName];
          if (!course) throw new Error(`Curso no encontrado: "${r.studentCourseName}"`);
          studentCourseId = course.id;
        }

        if (role === "TEACHER") {
          const resolved = r.teacherCourseNames.map((name) => {
            const course = courseCache[name];
            if (!course) throw new Error(`Curso no encontrado: "${name}"`);
            return course;
          });

          let chiefCourseId = null;
          if (r.teacherChiefCourseName) {
            const chief = courseCache[r.teacherChiefCourseName];
            if (!chief) throw new Error(`Curso jefe no encontrado: "${r.teacherChiefCourseName}"`);
            chiefCourseId = chief.id;
          }

          teacherAssignments = resolved.map((c) => ({
            courseId: c.id,
            isChief: chiefCourseId ? c.id === chiefCourseId : false,
          }));
        }

        if (role === "ADMINISTRATIVE" && !r.positionTitle?.trim()) {
          throw new Error("Cargo requerido para Administrativo");
        }

        // Crear invitación en transacción
        const { token, tokenHash } = createInviteToken();

        const inv = await prisma.$transaction(async (tx) => {
          const created = await tx.invitation.create({
            data: {
              institutionId,
              email,
              role,
              positionTitle: role === "ADMINISTRATIVE" ? r.positionTitle.trim() : null,
              courseId: role === "STUDENT" ? studentCourseId : null,
              tokenHash,
              expiresAt,
              createdByAppUserId: requester.id,
            },
            select: { id: true },
          });

          if (role === "TEACHER" && teacherAssignments.length) {
            await tx.invitationCourseAssignment.createMany({
              data: teacherAssignments.map((a) => ({
                invitationId: created.id,
                institutionId,
                courseId: a.courseId,
                isChief: a.isChief,
              })),
              skipDuplicates: true,
            });
          }

          return created;
        });

        // Enviar email
        await sendInvitationEmail({
          to: email,
          token,
          institutionName: institution?.name ?? "tu institución",
          role,
          expiresAt,
        });

        result.created++;
      } catch (e) {
        result.errors.push({
          row: r.row ?? null,
          email,
          message: e?.message ?? "Error desconocido",
        });
      }
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error("[bulk invitations]", e?.message);
    const code = e?.message;
    if (code === "FORBIDDEN") return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}