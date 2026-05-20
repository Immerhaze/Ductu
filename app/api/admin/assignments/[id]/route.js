// app/api/admin/assignments/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function DELETE(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;

    const assignment = await prisma.teachingAssignment.findFirst({
      where: { id, institutionId: appUser.institutionId },
    });
    if (!assignment) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    await prisma.teachingAssignment.delete({ where: { id } });

    // Si el docente ya no tiene ninguna asignación activa en ese curso, eliminar TeacherCourse
    const remaining = await prisma.teachingAssignment.count({
      where: { teacherId: assignment.teacherId, courseId: assignment.courseId, isActive: true },
    });
    if (remaining === 0) {
      await prisma.teacherCourse.deleteMany({
        where: { teacherId: assignment.teacherId, courseId: assignment.courseId },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}