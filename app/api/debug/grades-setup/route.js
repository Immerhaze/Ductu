// app/api/debug/grades-setup/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { institutionId, id: userId, role } = appUser;

    const [
      academicYears,
      periods,
      subjects,
      courses,
      teachingAssignments,
      policy,
    ] = await Promise.all([
      prisma.academicYear.findMany({
        where: { institutionId },
        select: { id: true, name: true, year: true, isActive: true },
      }),
      prisma.academicPeriod.findMany({
        where: { institutionId },
        select: { id: true, name: true, isActive: true, academicYearId: true },
      }),
      prisma.subject.findMany({
        where: { institutionId },
        select: { id: true, name: true, isActive: true },
      }),
      prisma.course.findMany({
        where: { institutionId, isActive: true },
        select: { id: true, name: true },
      }),
      prisma.teachingAssignment.findMany({
        where: { institutionId, teacherId: userId },
        select: {
          id: true, isActive: true,
          course: { select: { name: true } },
          subject: { select: { name: true } },
          academicYear: { select: { name: true, isActive: true } },
        },
      }),
      prisma.institutionAcademicPolicy.findUnique({
        where: { institutionId },
        select: { activeAcademicYearId: true, passingGrade: true, academicRegime: true },
      }),
    ]);

    return NextResponse.json({
      role,
      policy,
      academicYears,
      periods,
      subjects,
      courses,
      teachingAssignments,
      missing: {
        noActiveYear: !academicYears.some((y) => y.isActive),
        noActivePeriod: !periods.some((p) => p.isActive),
        noSubjects: subjects.length === 0,
        noCourses: courses.length === 0,
        noAssignments: teachingAssignments.length === 0,
        noPolicySet: !policy,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
// ```

// Luego abre en el browser:
// ```
// http://localhost:3000/api/debug/grades-setup