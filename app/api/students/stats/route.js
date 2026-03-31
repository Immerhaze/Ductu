// app/api/students/stats/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const institutionId = appUser.institutionId;
    const studentId = appUser.id;

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { passingGrade: true, activeAcademicYearId: true },
    });

    const passingGrade = policy ? Number(policy.passingGrade) : 4.0;
    const activeAcademicYearId = policy?.activeAcademicYearId;

    // Todas las notas del estudiante en el año activo
    const grades = await prisma.grade.findMany({
      where: {
        studentId,
        institutionId,
        teachingAssignment: {
          isActive: true,
          ...(activeAcademicYearId ? { academicYearId: activeAcademicYearId } : {}),
        },
      },
      select: {
        id: true,
        value: true,
        title: true,
        weight: true,
        createdAt: true,
        teachingAssignment: {
          select: {
            subject: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Agrupar notas por asignatura
    const subjectMap = {};
    grades.forEach((g) => {
      const subj = g.teachingAssignment.subject;
      if (!subjectMap[subj.id]) {
        subjectMap[subj.id] = {
          id: subj.id,
          name: subj.name,
          grades: [],
          sum: 0,
          count: 0,
        };
      }
      subjectMap[subj.id].grades.push({
        id: g.id,
        title: g.title ?? "Sin título",
        value: Number(g.value),
        weight: Number(g.weight),
        date: g.createdAt,
      });
      subjectMap[subj.id].sum += Number(g.value);
      subjectMap[subj.id].count += 1;
    });

    // Construir resumen por asignatura
    const subjectSummaries = Object.values(subjectMap).map((s) => {
      const avg = s.count > 0 ? Math.round((s.sum / s.count) * 10) / 10 : 0;
      return {
        id: s.id,
        name: s.name,
        avgGrade: avg,
        passing: avg >= passingGrade,
        atRisk: avg < passingGrade,
        gradesCount: s.count,
        grades: s.grades,
      };
    });

    // KPIs generales
    const totalSubjects = subjectSummaries.length;
    const passingSubjects = subjectSummaries.filter((s) => s.passing).length;
    const atRiskSubjects = subjectSummaries.filter((s) => s.atRisk);
    const overallAvg =
      subjectSummaries.length > 0
        ? Math.round(
            (subjectSummaries.reduce((acc, s) => acc + s.avgGrade, 0) /
              subjectSummaries.length) *
              10
          ) / 10
        : 0;

    // Historial cronológico de todas las notas (para el gráfico de línea)
    const gradeHistory = grades.map((g) => ({
      id: g.id,
      title: g.title ?? "Sin título",
      subject: g.teachingAssignment.subject.name,
      value: Number(g.value),
      date: g.createdAt,
    }));

    return NextResponse.json({
      kpis: {
        overallAvg,
        totalSubjects,
        passingSubjects,
        failingSubjects: totalSubjects - passingSubjects,
        atRiskCount: atRiskSubjects.length,
      },
      subjectSummaries,
      atRiskSubjects: atRiskSubjects.map((s) => ({ id: s.id, name: s.name, avgGrade: s.avgGrade })),
      gradeHistory,
      passingGrade,
    });
  } catch (e) {
    console.error("[api/student/stats]", e?.message, e);
    const code = e?.message;
    if (code === "APP_USER_NOT_FOUND")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (code === "PROFILE_INCOMPLETE")
      return NextResponse.json({ error: "Profile incomplete" }, { status: 403 });
    if (code === "NO_INSTITUTION")
      return NextResponse.json({ error: "No institution" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}