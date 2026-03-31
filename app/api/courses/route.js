// app/api/courses/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { institutionId, role, id: userId } = appUser;

    let courses;

    if (role === "ADMINISTRATIVE") {
      courses = await prisma.course.findMany({
        where: { institutionId, isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      });
    } else {
      // Teacher: solo sus cursos asignados
      const teacherCourses = await prisma.teacherCourse.findMany({
        where: { teacherId: userId, institutionId },
        select: { course: { select: { id: true, name: true } } },
      });
      courses = teacherCourses.map((tc) => tc.course);
    }

    return NextResponse.json({ courses });
  } catch (e) {
    console.error("[api/courses]", e?.message);
    const code = e?.message;
    if (code === "APP_USER_NOT_FOUND") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}