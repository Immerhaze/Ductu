// app/api/grades/template/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";
import * as XLSX from "xlsx";

export async function GET(req) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");

    if (!assignmentId) {
      return NextResponse.json({ error: "assignmentId requerido" }, { status: 400 });
    }

    // Verificar que la asignación pertenece al docente
    const assignment = await prisma.teachingAssignment.findFirst({
      where: {
        id: assignmentId,
        teacherId: appUser.id,
        institutionId: appUser.institutionId,
        isActive: true,
      },
      select: {
        id: true,
        course: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Asignación no válida" }, { status: 403 });
    }

    // Alumnos del curso
    const students = await prisma.appUser.findMany({
      where: {
        courseId: assignment.course.id,
        institutionId: appUser.institutionId,
        role: "STUDENT",
        isActive: true,
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });

    // Política
    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId: appUser.institutionId },
      select: { gradingScaleMin: true, gradingScaleMax: true },
    });

    const scaleMin = Number(policy?.gradingScaleMin ?? 1.0);
    const scaleMax = Number(policy?.gradingScaleMax ?? 7.0);

    // Construir Excel
    const wb = XLSX.utils.book_new();

    // Hoja de notas
    const headers = ["email", "titulo", "nota", "categoria", "ponderacion", "comentario"];
    const hints   = [
      "(no editar)",
      "Nombre de la evaluación",
      `Número entre ${scaleMin} y ${scaleMax}`,
      "EXAM | HOMEWORK | PROJECT | PARTICIPATION | OTHER",
      "Ponderación (opcional, default 1.0)",
      "Comentario (opcional)",
    ];

    const rows = [
      headers,
      hints,
      ...students.map((s) => [s.email, "", "", "OTHER", "1.0", ""]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Anchos de columna
    ws["!cols"] = [
      { wch: 32 }, // email
      { wch: 28 }, // titulo
      { wch: 10 }, // nota
      { wch: 18 }, // categoria
      { wch: 14 }, // ponderacion
      { wch: 28 }, // comentario
    ];

    XLSX.utils.book_append_sheet(wb, ws, "notas");

    // Hoja de info
    const wsInfo = XLSX.utils.aoa_to_sheet([
      ["Información del template"],
      [""],
      ["Curso",      assignment.course.name],
      ["Asignatura", assignment.subject.name],
      ["Escala",     `${scaleMin} – ${scaleMax}`],
      [""],
      ["Instrucciones"],
      ["1. NO modifiques la columna email"],
      ["2. Llena la columna 'titulo' con el nombre de la evaluación"],
      ["3. Llena la columna 'nota' con el valor numérico"],
      ["4. La columna 'categoria' es opcional (default: OTHER)"],
      ["5. Guarda el archivo y súbelo en DUCTU"],
    ]);

    wsInfo["!cols"] = [{ wch: 20 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, "info");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const filename = `notas_${assignment.course.name}_${assignment.subject.name}.xlsx`
      .replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("[api/grades/template]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}