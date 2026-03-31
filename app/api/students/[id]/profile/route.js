// app/api/students/[id]/profile/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET(request, { params }) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { id: studentId } = await params;
    const { institutionId } = appUser;

    // Estudiante solo puede ver su propio perfil
    if (appUser.role === "STUDENT" && appUser.id !== studentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const student = await prisma.appUser.findFirst({
      where: { id: studentId, institutionId, role: "STUDENT" },
      select: {
        id: true,
        fullName: true,
        email: true,
        positionTitle: true,
        isActive: true,
        createdAt: true,
        course: { select: { id: true, name: true } },
      },
    });

    if (!student) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { passingGrade: true, activeAcademicYearId: true },
    });

    const passingGrade = Number(policy?.passingGrade ?? 4.0);

    const grades = await prisma.grade.findMany({
      where: {
        studentId,
        institutionId,
        teachingAssignment: {
          isActive: true,
          ...(policy?.activeAcademicYearId
            ? { academicYearId: policy.activeAcademicYearId }
            : {}),
        },
      },
      select: {
        id: true,
        value: true,
        title: true,
        weight: true,
        category: true,
        comment: true,
        createdAt: true,
        academicPeriod: { select: { id: true, name: true } },
        teachingAssignment: {
          select: {
            subject: { select: { id: true, name: true } },
            teacher: { select: { id: true, fullName: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const subjectMap = {};
    grades.forEach((g) => {
      const subj = g.teachingAssignment.subject;
      if (!subjectMap[subj.id]) {
        subjectMap[subj.id] = {
          id: subj.id,
          name: subj.name,
          teacher: g.teachingAssignment.teacher?.fullName ?? "—",
          grades: [],
          sum: 0,
          count: 0,
        };
      }
      subjectMap[subj.id].grades.push({
        id: g.id,
        value: Number(g.value),
        title: g.title,
        weight: Number(g.weight),
        category: g.category,
        comment: g.comment,
        period: g.academicPeriod.name,
        date: g.createdAt,
      });
      subjectMap[subj.id].sum += Number(g.value);
      subjectMap[subj.id].count += 1;
    });

    const subjectSummaries = Object.values(subjectMap).map((s) => ({
      ...s,
      avgGrade: s.count > 0 ? Math.round((s.sum / s.count) * 10) / 10 : 0,
      passing: s.count > 0 ? s.sum / s.count >= passingGrade : null,
    }));

    const overallAvg =
      subjectSummaries.length > 0
        ? Math.round(
            (subjectSummaries.reduce((a, s) => a + s.avgGrade, 0) / subjectSummaries.length) * 10
          ) / 10
        : 0;

    const annotations = await prisma.studentAnnotation.findMany({
      where: { studentId, institutionId },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        date: true,
        course: { select: { name: true } },
        author: { select: { fullName: true } },
      },
      orderBy: { date: "desc" },
    });

    const achievements = await prisma.studentAchievement.findMany({
      where: { studentId, institutionId },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        author: { select: { fullName: true } },
      },
      orderBy: { date: "desc" },
    });

    const improvementPlans = await prisma.studentImprovementPlan.findMany({
      where: { studentId, institutionId },
      select: {
        id: true,
        goal: true,
        description: true,
        dueDate: true,
        isCompleted: true,
        completedAt: true,
        author: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      student,
      academic: {
        overallAvg,
        passingGrade,
        subjectSummaries,
        atRisk: subjectSummaries.filter((s) => s.passing === false),
      },
      annotations,
      achievements,
      improvementPlans,
    });
  } catch (e) {
    console.error("[api/students/profile GET]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}