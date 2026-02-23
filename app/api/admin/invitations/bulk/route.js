// app/api/admin/invitations/bulk/route.js
import "server-only";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";
import { createInviteToken } from "@/lib/invitations";
import { findCourseByUserInput } from "@/lib/courses/courseKey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

export async function POST(req) {
  const { appUser: requester } = await requireAppUser({
    roles: ["ADMINISTRATIVE"],
    requireProfileCompleted: true,
  });

  const institutionId = requester.institutionId;

  const body = await req.json().catch(() => null);
  if (!body?.rows || !Array.isArray(body.rows)) {
    return json("Body inválido: rows[] requerido.", 400);
  }

  const rows = body.rows;

  const result = {
    created: 0,
    skipped: 0,
    errors: [],
  };

  // Procesar fila a fila (seguro). Luego optimizamos a batch si quieres.
  for (const r of rows) {
    try {
      const email = String(r.email || "").trim().toLowerCase();
      const role = String(r.role || "").trim();

      if (!email) throw new Error("Email requerido");
      if (!role) throw new Error("Rol requerido");

      // ✅ 0) filtro opcional desde excel: "S/N"
      // si viene false, saltamos silenciosamente
      if (r.sendInvite !== undefined) {
        const v = String(r.sendInvite || "").trim().toLowerCase();
        if (["n", "no", "0", "false"].includes(v)) {
          result.skipped++;
          continue;
        }
      }

      // 1) si existe usuario en institución => skip
      const exists = await prisma.appUser.findFirst({
        where: { institutionId, email },
        select: { id: true },
      });
      if (exists) {
        result.skipped++;
        continue;
      }

      // 2) si existe invitación activa => skip
      const activeInvite = await prisma.invitation.findFirst({
        where: {
          institutionId,
          email,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });
      if (activeInvite) {
        result.skipped++;
        continue;
      }

      // 3) resolver cursos según rol
      let studentCourseId = null;

      /** @type {{courseId:string,isChief:boolean}[]} */
      let teacherAssignments = [];

      if (role === "STUDENT") {
        const rawCourse = String(r.studentCourseName || "").trim();
        if (!rawCourse) throw new Error("STUDENT requiere curso");

        const course = await findCourseByUserInput(prisma, institutionId, rawCourse);
        if (!course) {
          throw new Error(
            `Curso no existe o formato inválido: "${rawCourse}". Ej: 7B, 1MA, 2MB`
          );
        }
        studentCourseId = course.id;
      }

      if (role === "TEACHER") {
        const names = Array.isArray(r.teacherCourseNames) ? r.teacherCourseNames : [];
        if (!names.length) throw new Error("TEACHER requiere teacherCourseNames (>=1)");

        // resolver todos los cursos del docente
        const resolved = [];
        for (const name of names) {
          const raw = String(name || "").trim();
          if (!raw) continue;

          const c = await findCourseByUserInput(prisma, institutionId, raw);
          if (!c) {
            throw new Error(
              `Curso no existe o formato inválido: "${raw}". Ej: 7B, 1MA, 2MB`
            );
          }
          resolved.push(c);
        }

        if (!resolved.length) throw new Error("TEACHER requiere al menos 1 curso válido.");

        // resolver curso jefe (opcional)
        const chiefRaw = String(r.teacherChiefCourseName || "").trim();
        let chiefCourseId = null;

        if (chiefRaw) {
          const chiefCourse = await findCourseByUserInput(prisma, institutionId, chiefRaw);
          if (!chiefCourse) {
            throw new Error(
              `Curso jefe no existe o formato inválido: "${chiefRaw}". Ej: 7B, 1MA`
            );
          }
          chiefCourseId = chiefCourse.id;

          // asegurar que esté dentro de los cursos seleccionados
          const isInTeacherList = resolved.some((c) => c.id === chiefCourseId);
          if (!isInTeacherList) {
            throw new Error("Curso jefe debe estar dentro de los cursos del docente");
          }
        }

        teacherAssignments = resolved.map((c) => ({
          courseId: c.id,
          isChief: chiefCourseId ? c.id === chiefCourseId : false,
        }));
      }

      if (role === "ADMINISTRATIVE") {
        const pos = String(r.positionTitle || "").trim();
        if (!pos) throw new Error("Cargo requerido para ADMINISTRATIVE");
      }

      // 4) crear invitación + asignaciones (transacción)
      const { tokenHash } = createInviteToken();

      await prisma.$transaction(async (tx) => {
        const inv = await tx.invitation.create({
          data: {
            institutionId,
            email,
            role,
            positionTitle:
              role === "ADMINISTRATIVE" ? String(r.positionTitle || "").trim() : null,
            courseId: role === "STUDENT" ? studentCourseId : null,
            tokenHash,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            createdByAppUserId: requester.id,
          },
          select: { id: true },
        });

        if (role === "TEACHER") {
          await tx.invitationCourseAssignment.createMany({
            data: teacherAssignments.map((a) => ({
              invitationId: inv.id,
              institutionId,
              courseId: a.courseId,
              isChief: a.isChief,
            })),
            skipDuplicates: true,
          });
        }
      });

      result.created++;
    } catch (e) {
      result.errors.push({
        row: r.row ?? null,
        email: r.email ?? null,
        message: e?.message || "Error desconocido",
      });
    }
  }

  return NextResponse.json({ ok: true, ...result });
}