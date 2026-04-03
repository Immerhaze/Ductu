// app/api/schedule/slot/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function POST(req) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { courseId, blockId, dayOfWeek, subjectId, teacherId, room } = await req.json();
    const { institutionId } = appUser;

    if (!courseId || !blockId || !dayOfWeek) {
      return NextResponse.json({ error: "courseId, blockId y dayOfWeek son requeridos" }, { status: 400 });
    }

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { activeAcademicYearId: true },
    });

    if (!policy?.activeAcademicYearId) {
      return NextResponse.json({ error: "No hay año académico activo" }, { status: 400 });
    }

    // Crear o encontrar el CourseSchedule
    let schedule = await prisma.courseSchedule.findUnique({
      where: {
        institutionId_courseId_academicYearId: {
          institutionId,
          courseId,
          academicYearId: policy.activeAcademicYearId,
        },
      },
    });

    if (!schedule) {
      schedule = await prisma.courseSchedule.create({
        data: {
          institutionId,
          courseId,
          academicYearId: policy.activeAcademicYearId,
        },
      });
    }

    // Upsert del slot
    const slot = await prisma.scheduleSlot.upsert({
      where: {
        courseScheduleId_blockId_dayOfWeek: {
          courseScheduleId: schedule.id,
          blockId,
          dayOfWeek,
        },
      },
      update: {
        subjectId: subjectId || null,
        teacherId: teacherId || null,
        room: room || null,
      },
      create: {
        institutionId,
        courseScheduleId: schedule.id,
        blockId,
        dayOfWeek,
        subjectId: subjectId || null,
        teacherId: teacherId || null,
        room: room || null,
      },
      include: {
        subject: { select: { id: true, name: true } },
        teacher: { select: { id: true, fullName: true } },
        block: true,
      },
    });

    return NextResponse.json({ slot });
  } catch (e) {
    console.error("[api/schedule/slot POST]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}