// app/api/students/[id]/improvement-plans/route.js
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
    const { goal, description, dueDate } = body;

    if (!goal?.trim()) {
      return NextResponse.json({ error: "El objetivo es requerido" }, { status: 400 });
    }

    const student = await prisma.appUser.findFirst({
      where: { id: studentId, institutionId, role: "STUDENT" },
      select: { id: true },
    });
    if (!student) return NextResponse.json({ error: "Alumno no encontrado" }, { status: 404 });

    const plan = await prisma.studentImprovementPlan.create({
      data: {
        institutionId,
        studentId,
        authorId,
        goal: goal.trim(),
        description: description?.trim() || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      select: {
        id: true, goal: true, description: true,
        dueDate: true, isCompleted: true, completedAt: true,
        author: { select: { fullName: true } },
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (e) {
    console.error("[api/students/improvement-plans POST]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}