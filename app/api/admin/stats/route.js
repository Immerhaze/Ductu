// app/api/admin/stats/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "ADMINISTRATIVE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const institutionId = appUser.institutionId;

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { passingGrade: true },
    });

    const passingGrade = policy ? Number(policy.passingGrade) : 4.0;

    const allGrades = await prisma.grade.findMany({
      where: { institutionId },
      select: {
        value: true,
        studentId: true,
        teachingAssignment: {
          select: {
            subjectId: true,
            teacherId: true,
            subject: { select: { id: true, name: true } },
            teacher: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    const studentAverages = Object.values(
      allGrades.reduce((acc, g) => {
        const sid = g.studentId;
        if (!acc[sid]) acc[sid] = { sum: 0, count: 0 };
        acc[sid].sum += Number(g.value);
        acc[sid].count += 1;
        return acc;
      }, {})
    );

    const total = studentAverages.length;
    const passing = studentAverages.filter(
      (s) => s.count > 0 && s.sum / s.count >= passingGrade
    ).length;
    const failing = total - passing;

    const subjectMap = allGrades.reduce((acc, g) => {
      const subj = g.teachingAssignment.subject;
      if (!subj) return acc;
      if (!acc[subj.id]) acc[subj.id] = { id: subj.id, name: subj.name, sum: 0, count: 0 };
      acc[subj.id].sum += Number(g.value);
      acc[subj.id].count += 1;
      return acc;
    }, {});

    const subjectAverages = Object.values(subjectMap).map((s) => ({
      id: s.id,
      name: s.name,
      avgGrade: s.count > 0 ? Math.round((s.sum / s.count) * 10) / 10 : 0,
    }));

    const teacherMap = allGrades.reduce((acc, g) => {
      const teacher = g.teachingAssignment.teacher;
      if (!teacher) return acc;
      if (!acc[teacher.id])
        acc[teacher.id] = { id: teacher.id, name: teacher.fullName ?? "Sin nombre", sum: 0, count: 0 };
      acc[teacher.id].sum += Number(g.value);
      acc[teacher.id].count += 1;
      return acc;
    }, {});

    const teacherAverages = Object.values(teacherMap).map((t) => ({
      id: t.id,
      name: t.name,
      avgGrade: t.count > 0 ? Math.round((t.sum / t.count) * 10) / 10 : 0,
    }));

    return NextResponse.json({
      passFailCounts: { total, passing, failing },
      subjectAverages,
      teacherAverages,
    });
  } catch (e) {
    console.error("[api/admin/stats] ERROR:", e?.message, e);

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