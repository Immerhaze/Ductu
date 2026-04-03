// app/api/admin/assignments/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { institutionId } = appUser;

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { activeAcademicYearId: true },
    });

    if (!policy?.activeAcademicYearId) {
      return NextResponse.json({ assignments: [] });
    }

    const assignments = await prisma.teachingAssignment.findMany({
      where: { institutionId, academicYearId: policy.activeAcademicYearId },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
      orderBy: [{ course: { name: "asc" } }, { subject: { name: "asc" } }],
    });

    return NextResponse.json({ assignments });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { teacherId, courseId, subjectId } = await req.json();
    const { institutionId } = appUser;

    if (!teacherId || !courseId || !subjectId) {
      return NextResponse.json({ error: "teacherId, courseId y subjectId son requeridos" }, { status: 400 });
    }

    const policy = await prisma.institutionAcademicPolicy.findUnique({
      where: { institutionId },
      select: { activeAcademicYearId: true },
    });

    if (!policy?.activeAcademicYearId) {
      return NextResponse.json({ error: "No hay año académico activo" }, { status: 400 });
    }

    const assignment = await prisma.teachingAssignment.create({
      data: {
        institutionId,
        academicYearId: policy.activeAcademicYearId,
        teacherId,
        courseId,
        subjectId,
        isActive: true,
      },
      include: {
        teacher: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ assignment });
  } catch (e) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe esta asignación" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}