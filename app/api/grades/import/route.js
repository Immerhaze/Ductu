// app/api/grades/import/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";
import { parseGradesExcel } from "@/lib/import/gradesParser";

export async function POST(req) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { institutionId, id: teacherId } = appUser;

    const formData      = await req.formData();
    const file          = formData.get("file");
    const assignmentId  = formData.get("assignmentId");
    const periodId      = formData.get("periodId");

    if (!file || !assignmentId || !periodId) {
      return NextResponse.json({ error: "file, assignmentId y periodId son requeridos" }, { status: 400 });
    }

    // Verificar asignación pertenece al docente
    const assignment = await prisma.teachingAssignment.findFirst({
      where: { id: assignmentId, teacherId, institutionId, isActive: true },
      select: {
        id: true,
        courseId: true,
        course:  { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });
    if (!assignment) {
      return NextResponse.json({ error: "Asignación no válida" }, { status: 403 });
    }

    // Verificar período
    const period = await prisma.academicPeriod.findFirst({
      where: { id: periodId, institutionId },
      select: { id: true },
    });
    if (!period) {
      return NextResponse.json({ error: "Período no válido" }, { status: 400 });
    }

    // Política
    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { gradingScaleMin: true, gradingScaleMax: true },
    });

    const scaleMin = Number(policy?.gradingScaleMin ?? 1.0);
    const scaleMax = Number(policy?.gradingScaleMax ?? 7.0);

    // Parsear Excel
    const parsed = await parseGradesExcel(file, { scaleMin, scaleMax });

    if (parsed.errors.length > 0 && parsed.validRows.length === 0) {
      return NextResponse.json({ errors: parsed.errors, imported: 0 }, { status: 422 });
    }

    // Obtener alumnos del curso indexados por email
    const students = await prisma.appUser.findMany({
      where: { courseId: assignment.courseId, institutionId, role: "STUDENT", isActive: true },
      select: { id: true, email: true, fullName: true },
    });
    const studentByEmail = Object.fromEntries(students.map((s) => [s.email.toLowerCase(), s]));

    // Procesar filas válidas
    const rowErrors   = [...parsed.errors];
    const toCreate    = [];
    const skipped     = [];

    for (const row of parsed.validRows) {
      const student = studentByEmail[row.email.toLowerCase()];
      if (!student) {
        rowErrors.push({ row: row.row, email: row.email, message: "Alumno no encontrado en este curso" });
        continue;
      }

      // Verificar si ya existe una nota con el mismo título para este alumno en este período
      const exists = await prisma.grade.findFirst({
        where: {
          teachingAssignmentId: assignmentId,
          academicPeriodId: periodId,
          studentId: student.id,
          title: row.titulo,
        },
        select: { id: true },
      });

      if (exists) {
        skipped.push({ row: row.row, email: row.email, message: `Ya existe una nota "${row.titulo}" para este alumno` });
        continue;
      }

      toCreate.push({
        institutionId,
        studentId:            student.id,
        teachingAssignmentId: assignmentId,
        academicPeriodId:     periodId,
        value:                row.nota,
        title:                row.titulo,
        weight:               row.ponderacion,
        category:             row.categoria,
        comment:              row.comentario,
      });
    }

    // Crear notas en batch
    let imported = 0;
    if (toCreate.length > 0) {
      await prisma.grade.createMany({ data: toCreate });
      imported = toCreate.length;

      // Notificar a los alumnos
      try {
        const { createNotifications } = await import("@/lib/notifications");
        const recipientIds = [...new Set(toCreate.map((g) => g.studentId))];
        const recipients   = students.filter((s) => recipientIds.includes(s.id));

        if (recipients.length > 0) {
          await createNotifications(
            recipients.map((s) => ({ userId: s.id, email: s.email, fullName: s.fullName })),
            {
              type:  "NEW_GRADE",
              title: "Nueva nota registrada",
              body:  `Se han registrado nuevas notas de ${assignment.subject.name} en tu perfil académico.`,
              link:  "/dashboard/my-profile",
            }
          );
        }
      } catch (e) {
        console.error("[notifications] import grades error:", e?.message);
      }
    }

    return NextResponse.json({
      imported,
      skipped:  skipped.length,
      errors:   rowErrors,
      skippedDetails: skipped,
    });
  } catch (e) {
    console.error("[api/grades/import]", e?.message);
    if (e?.message?.includes("No se encontraron")) {
      return NextResponse.json({ error: e.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}