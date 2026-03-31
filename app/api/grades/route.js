// app/api/grades/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET(request) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { institutionId, id: teacherId } = appUser;

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("assignmentId");
    const periodId = searchParams.get("periodId");

    if (!assignmentId || !periodId) {
      return NextResponse.json({ error: "assignmentId y periodId son requeridos" }, { status: 400 });
    }

    // Verificar que la asignación pertenece al profesor
    const assignment = await prisma.teachingAssignment.findFirst({
      where: {
        id: assignmentId,
        institutionId,
        ...(appUser.role === "TEACHER" ? { teacherId } : {}),
      },
      select: {
        id: true,
        course: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 });
    }

    // Alumnos del curso
    const students = await prisma.appUser.findMany({
      where: {
        courseId: assignment.course.id,
        institutionId,
        role: "STUDENT",
        isActive: true,
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: "asc" },
    });

    // Notas del período para esta asignación
    const grades = await prisma.grade.findMany({
      where: {
        teachingAssignmentId: assignmentId,
        academicPeriodId: periodId,
        institutionId,
      },
      select: {
        id: true,
        studentId: true,
        value: true,
        title: true,
        weight: true,
        category: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Política para nota mínima
    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { passingGrade: true, gradingScaleMin: true, gradingScaleMax: true },
    });

    return NextResponse.json({
      assignment,
      students,
      grades,
      policy: {
        passingGrade: Number(policy?.passingGrade ?? 4.0),
        scaleMin: Number(policy?.gradingScaleMin ?? 1.0),
        scaleMax: Number(policy?.gradingScaleMax ?? 7.0),
      },
    });
  } catch (e) {
    console.error("[api/grades GET]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { institutionId, id: teacherId } = appUser;
    const body = await request.json();
    const { teachingAssignmentId, academicPeriodId, studentId, value, title, weight, category, comment } = body;

    if (!teachingAssignmentId || !academicPeriodId || !studentId || value === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    // Verificar que la asignación pertenece al profesor
    const assignment = await prisma.teachingAssignment.findFirst({
      where: { id: teachingAssignmentId, teacherId, institutionId, isActive: true },
      select: { id: true, courseId: true },
    });
    if (!assignment) return NextResponse.json({ error: "Asignación no válida" }, { status: 403 });

    // Verificar que el alumno pertenece al curso
    const student = await prisma.appUser.findFirst({
      where: { id: studentId, courseId: assignment.courseId, institutionId, role: "STUDENT" },
      select: { id: true },
    });
    if (!student) return NextResponse.json({ error: "Alumno no pertenece al curso" }, { status: 403 });

    // Verificar período
    const period = await prisma.academicPeriod.findFirst({
      where: { id: academicPeriodId, institutionId },
      select: { id: true },
    });
    if (!period) return NextResponse.json({ error: "Período no válido" }, { status: 400 });

    const grade = await prisma.grade.create({
      data: {
        institutionId,
        studentId,
        teachingAssignmentId,
        academicPeriodId,
        value,
        title: title?.trim() || null,
        weight: weight ?? 1.0,
        category: category ?? "OTHER",
        comment: comment?.trim() || null,
      },
    });

    return NextResponse.json({ grade }, { status: 201 });
  } catch (e) {
    console.error("[api/grades POST]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}