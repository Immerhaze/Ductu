// app/api/grades/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function PATCH(request, { params }) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { institutionId, id: teacherId } = appUser;
    const body = await request.json();
    const { value, title, weight, category, comment } = body;

    const grade = await prisma.grade.findFirst({
      where: { id, institutionId },
      select: {
        id: true,
        teachingAssignment: { select: { teacherId: true } },
      },
    });

    if (!grade) return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    if (grade.teachingAssignment.teacherId !== teacherId) {
      return NextResponse.json({ error: "Solo puedes editar tus propias notas" }, { status: 403 });
    }

    const updated = await prisma.grade.update({
      where: { id },
      data: {
        ...(value !== undefined ? { value } : {}),
        ...(title !== undefined ? { title: title?.trim() || null } : {}),
        ...(weight !== undefined ? { weight } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(comment !== undefined ? { comment: comment?.trim() || null } : {}),
      },
    });

    return NextResponse.json({ grade: updated });
  } catch (e) {
    console.error("[api/grades PATCH]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { institutionId, id: teacherId } = appUser;

    const grade = await prisma.grade.findFirst({
      where: { id, institutionId },
      select: {
        id: true,
        teachingAssignment: { select: { teacherId: true } },
      },
    });

    if (!grade) return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    if (grade.teachingAssignment.teacherId !== teacherId) {
      return NextResponse.json({ error: "Solo puedes eliminar tus propias notas" }, { status: 403 });
    }

    await prisma.grade.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/grades DELETE]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}