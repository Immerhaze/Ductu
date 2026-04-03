// app/api/schedule/my/route.js  — horario personal del teacher o student
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { institutionId, role, id: userId } = appUser;

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { activeAcademicYearId: true },
    });

    if (!policy?.activeAcademicYearId) {
      return NextResponse.json({ slots: [], blocks: [] });
    }

    const blocks = await prisma.scheduleBlock.findMany({
      where: { institutionId },
      orderBy: { order: "asc" },
    });

    let slots = [];

    if (role === "STUDENT") {
      const student = await prisma.appUser.findUnique({
        where: { id: userId },
        select: { courseId: true },
      });

      if (student?.courseId) {
        const schedule = await prisma.courseSchedule.findUnique({
          where: {
            institutionId_courseId_academicYearId: {
              institutionId,
              courseId: student.courseId,
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
        slots = schedule?.slots ?? [];
      }
    }

    if (role === "TEACHER") {
      slots = await prisma.scheduleSlot.findMany({
        where: {
          teacherId: userId,
          institutionId,
          courseSchedule: {
            academicYearId: policy.activeAcademicYearId,
          },
        },
        include: {
          subject: { select: { id: true, name: true } },
          teacher: { select: { id: true, fullName: true } },
          block: true,
          courseSchedule: {
            include: {
              course: { select: { id: true, name: true } },
            },
          },
        },
      });
    }

    return NextResponse.json({ slots, blocks });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}