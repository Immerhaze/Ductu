// app/api/schedule/template/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";
import * as XLSX from "xlsx";

const DAYS = [
  { num: 1, label: "Lunes" },
  { num: 2, label: "Martes" },
  { num: 3, label: "Miércoles" },
  { num: 4, label: "Jueves" },
  { num: 5, label: "Viernes" },
];

export async function GET() {
  try {
    const { appUser } = await requireAppUser({
      roles: ["ADMINISTRATIVE"],
      requireProfileCompleted: true,
    });

    const { institutionId } = appUser;

    const [institution, policy, courses, blocks, subjects, teachers] = await Promise.all([
      prisma.institution.findUnique({
        where: { id: institutionId },
        select: { name: true },
      }),
      prisma.institutionAcademicPolicy.findUnique({
        where: { institutionId },
        select: { activeAcademicYearId: true },
      }),
      prisma.course.findMany({
        where: { institutionId, isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.scheduleBlock.findMany({
        where: { institutionId },
        orderBy: { order: "asc" },
      }),
      prisma.subject.findMany({
        where: { institutionId, isActive: true },
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.appUser.findMany({
        where: { institutionId, role: "TEACHER", isActive: true },
        select: { fullName: true },
        orderBy: { fullName: "asc" },
      }),
    ]);

    if (!policy?.activeAcademicYearId) {
      return NextResponse.json(
        { error: "No hay año académico activo. Configura uno antes de descargar el template." },
        { status: 400 }
      );
    }

    // Cargar slots existentes para pre-rellenar el template
    const existingSlots = await prisma.scheduleSlot.findMany({
      where: {
        institutionId,
        courseSchedule: { academicYearId: policy.activeAcademicYearId },
      },
      select: {
        dayOfWeek: true,
        blockId: true,
        room: true,
        courseSchedule: { select: { courseId: true } },
        subject: { select: { name: true } },
        teacher: { select: { fullName: true } },
      },
    });

    // Índice: "courseId-blockId-dayOfWeek" → slot
    const slotIndex = {};
    for (const s of existingSlots) {
      const key = `${s.courseSchedule.courseId}-${s.blockId}-${s.dayOfWeek}`;
      slotIndex[key] = s;
    }

    const wb = XLSX.utils.book_new();

    // ── Hoja principal: "horario" ──────────────────────────────────────
    const headers = ["curso", "dia", "bloque", "hora_inicio", "hora_fin", "asignatura", "docente", "sala"];
    const hints   = [
      "(no editar)", "(no editar)", "(no editar)", "(no editar)", "(no editar)",
      "Nombre de la asignatura",
      "Nombre completo del docente (opcional)",
      "Sala o aula (opcional)",
    ];

    const dataRows = [];
    const classBlocks = blocks.filter((b) => !b.isBreak);

    for (const course of courses) {
      for (const day of DAYS) {
        for (const block of classBlocks) {
          const key  = `${course.id}-${block.id}-${day.num}`;
          const slot = slotIndex[key];
          dataRows.push([
            course.name,
            day.label,
            block.name,
            block.startTime,
            block.endTime,
            slot?.subject?.name  ?? "",
            slot?.teacher?.fullName ?? "",
            slot?.room ?? "",
          ]);
        }
      }
    }

    const ws = XLSX.utils.aoa_to_sheet([headers, hints, ...dataRows]);

    ws["!cols"] = [
      { wch: 14 }, // curso
      { wch: 12 }, // dia
      { wch: 14 }, // bloque
      { wch: 11 }, // hora_inicio
      { wch: 11 }, // hora_fin
      { wch: 22 }, // asignatura
      { wch: 26 }, // docente
      { wch: 12 }, // sala
    ];

    // Congelar las primeras 2 filas (encabezados + hints)
    ws["!freeze"] = { xSplit: 0, ySplit: 2 };

    XLSX.utils.book_append_sheet(wb, ws, "horario");

    // ── Hoja de referencia ────────────────────────────────────────────
    const refRows = [
      ["=== VALORES VÁLIDOS ===", "", "", ""],
      [""],
      ["CURSOS", "ASIGNATURAS", "DOCENTES", "DÍAS"],
      ...Array.from({ length: Math.max(courses.length, subjects.length, teachers.length, DAYS.length) }, (_, i) => [
        courses[i]?.name    ?? "",
        subjects[i]?.name   ?? "",
        teachers[i]?.fullName ?? "",
        DAYS[i]?.label      ?? "",
      ]),
    ];

    const wsRef = XLSX.utils.aoa_to_sheet(refRows);
    wsRef["!cols"] = [{ wch: 14 }, { wch: 22 }, { wch: 26 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsRef, "referencia");

    // ── Hoja de instrucciones ─────────────────────────────────────────
    const wsInfo = XLSX.utils.aoa_to_sheet([
      ["Instrucciones de importación de horarios"],
      [""],
      ["Institución", institution?.name ?? ""],
      [""],
      ["PASOS"],
      ["1. Ve a la hoja 'horario'"],
      ["2. Las columnas curso, dia, bloque, hora_inicio y hora_fin NO deben modificarse"],
      ["3. Llena la columna 'asignatura' con el nombre exacto de la asignatura (ver hoja 'referencia')"],
      ["4. Llena la columna 'docente' con el nombre completo del docente (opcional)"],
      ["5. Llena la columna 'sala' con el nombre del aula (opcional)"],
      ["6. Las filas donde 'asignatura' quede vacía serán ignoradas"],
      ["7. Si una celda ya tiene una clase asignada, será reemplazada"],
      ["8. Guarda el archivo y súbelo en DUCTU → Horarios → Importar horarios"],
      [""],
      ["NOTAS"],
      ["- Los nombres de asignatura y docente deben coincidir exactamente con los de la plataforma"],
      ["- Puedes consultar la hoja 'referencia' para ver los valores válidos"],
      ["- Los bloques marcados como recreo no aparecen en el template"],
    ]);
    wsInfo["!cols"] = [{ wch: 14 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, wsInfo, "instrucciones");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const filename = `horarios_${institution?.name ?? "institucion"}.xlsx`.replace(/[^a-zA-Z0-9._-]/g, "_");

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("[api/schedule/template]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
