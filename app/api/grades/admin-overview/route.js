// app/api/grades/admin-overview/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "ADMINISTRATIVE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { institutionId } = appUser;

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { activeAcademicYearId: true },
    });

    // Todas las asignaciones activas de la institución
    const assignments = await prisma.teachingAssignment.findMany({
      where: {
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
        teacher: { select: { id: true, fullName: true } },
        academicYear: { select: { id: true, name: true, year: true } },
      },
      orderBy: [{ course: { name: "asc" } }, { subject: { name: "asc" } }],
    });

    const periods = policy?.activeAcademicYearId
      ? await prisma.academicPeriod.findMany({
          where: { academicYearId: policy.activeAcademicYearId, institutionId },
          select: { id: true, name: true, periodNumber: true, isActive: true },
          orderBy: { periodNumber: "asc" },
        })
      : [];

    return NextResponse.json({ assignments, periods });
  } catch (e) {
    console.error("[api/grades/admin-overview]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}