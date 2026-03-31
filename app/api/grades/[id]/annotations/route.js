// app/api/students/[id]/annotations/route.js
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
    const { type, title, description, courseId, date } = body;

    if (!type || !title?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "type, title y description son requeridos" }, { status: 400 });
    }

    const student = await prisma.appUser.findFirst({
      where: { id: studentId, institutionId, role: "STUDENT" },
      select: { id: true },
    });
    if (!student) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

    const annotation = await prisma.studentAnnotation.create({
      data: {
        institutionId,
        studentId,
        authorId,
        courseId: courseId || null,
        type,
        title: title.trim(),
        description: description.trim(),
        date: date ? new Date(date) : new Date(),
      },
      select: {
        id: true, type: true, title: true, description: true, date: true,
        author: { select: { fullName: true } },
        course: { select: { name: true } },
      },
    });

    return NextResponse.json({ annotation }, { status: 201 });
  } catch (e) {
    console.error("[api/students/annotations POST]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}