// app/api/grades/my-assignments/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { institutionId, id: teacherId } = appUser;

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { activeAcademicYearId: true },
    });

    const assignments = await prisma.teachingAssignment.findMany({
      where: {
        teacherId,
        institutionId,
        isActive: true,
        ...(policy?.activeAcademicYearId
          ? { academicYearId: policy.activeAcademicYearId }
          : {}),
      },
      select: {
        id: true,
        course: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
        academicYear: { select: { id: true, name: true, year: true } },
      },
      orderBy: [{ course: { name: "asc" } }, { subject: { name: "asc" } }],
    });

    // Traer períodos del año activo
    const periods = policy?.activeAcademicYearId
      ? await prisma.academicPeriod.findMany({
          where: {
            academicYearId: policy.activeAcademicYearId,
            institutionId,
          },
          select: { id: true, name: true, periodNumber: true, isActive: true },
          orderBy: { periodNumber: "asc" },
        })
      : [];

    return NextResponse.json({ assignments, periods });
  } catch (e) {
    console.error("[api/grades/my-assignments]", e?.message);
    const code = e?.message;
    if (code === "APP_USER_NOT_FOUND") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (code === "NO_INSTITUTION") return NextResponse.json({ error: "No institution" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}