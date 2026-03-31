// app/api/students/[id]/achievements/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function POST(request, { params }) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: studentId } = await params;
    const { institutionId, id: authorId } = appUser;
    const body = await request.json();
    const { title, description, date } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    }

    const student = await prisma.appUser.findFirst({
      where: { id: studentId, institutionId, role: "STUDENT" },
      select: { id: true },
    });
    if (!student) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

    const achievement = await prisma.studentAchievement.create({
      data: {
        institutionId,
        studentId,
        authorId,
        title: title.trim(),
        description: description?.trim() || null,
        date: date ? new Date(date) : new Date(),
      },
      select: {
        id: true, title: true, description: true, date: true,
        author: { select: { fullName: true } },
      },
    });

    return NextResponse.json({ achievement }, { status: 201 });
  } catch (e) {
    console.error("[api/students/achievements POST]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}