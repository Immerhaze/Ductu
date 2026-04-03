// app/api/schedule/course/[courseId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { courseId } = await params;
    const { institutionId } = appUser;

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { activeAcademicYearId: true },
    });

    if (!policy?.activeAcademicYearId) {
      return NextResponse.json({ schedule: null, slots: [], blocks: [] });
    }

    const blocks = await prisma.scheduleBlock.findMany({
      where: { institutionId },
      orderBy: { order: "asc" },
    });

    let schedule = await prisma.courseSchedule.findUnique({
      where: {
        institutionId_courseId_academicYearId: {
          institutionId,
          courseId,
          academicYearId: policy.activeAcademicYearId,
        },
      },
      include: {
        slots: {
          include: {
            subject: { select: { id: true, name: true } },
            teacher: { select: { id: true, fullName: true } },
            block: true,
          },
        },
      },
    });

    return NextResponse.json({
      schedule,
      slots: schedule?.slots ?? [],
      blocks,
    });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}