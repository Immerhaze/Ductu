// app/api/calendar/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { institutionId, role, id: userId, courseId } = appUser;

    let events;

    if (role === "ADMINISTRATIVE") {
      // Admin ve todos los eventos de la institución
      events = await prisma.calendarEvent.findMany({
        where: { institutionId },
        include: {
          targets: { include: { course: { select: { id: true, name: true } } } },
          createdBy: { select: { id: true, fullName: true, role: true } },
        },
        orderBy: { date: "asc" },
      });
    } else if (role === "TEACHER") {
      // Teacher ve eventos ALL + eventos de sus cursos
      const teacherCourses = await prisma.teacherCourse.findMany({
        where: { teacherId: userId, institutionId },
        select: { courseId: true },
      });
      const teacherCourseIds = teacherCourses.map((c) => c.courseId);

      events = await prisma.calendarEvent.findMany({
        where: {
          institutionId,
          targets: {
            some: {
              OR: [
                { type: "ALL" },
                { type: "ROLE", role: "TEACHER" },
                { type: "COURSE", courseId: { in: teacherCourseIds } },
              ],
            },
          },
        },
        include: {
          targets: { include: { course: { select: { id: true, name: true } } } },
          createdBy: { select: { id: true, fullName: true, role: true } },
        },
        orderBy: { date: "asc" },
      });
    } else {
      // Student ve eventos ALL + eventos de su curso
      events = await prisma.calendarEvent.findMany({
        where: {
          institutionId,
          targets: {
            some: {
              OR: [
                { type: "ALL" },
                ...(courseId ? [{ type: "COURSE", courseId }] : []),
              ],
            },
          },
        },
        include: {
          targets: { include: { course: { select: { id: true, name: true } } } },
          createdBy: { select: { id: true, fullName: true, role: true } },
        },
        orderBy: { date: "asc" },
      });
    }

    return NextResponse.json({ events });
  } catch (e) {
    console.error("[api/calendar GET]", e?.message);
    const code = e?.message;
    if (code === "APP_USER_NOT_FOUND") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (code === "PROFILE_INCOMPLETE") return NextResponse.json({ error: "Profile incomplete" }, { status: 403 });
    if (code === "NO_INSTITUTION") return NextResponse.json({ error: "No institution" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { institutionId, id: userId } = appUser;
    const body = await request.json();
    const { title, description, type, date, endDate, targets } = body;

    if (!title?.trim()) return NextResponse.json({ error: "El título es requerido" }, { status: 400 });
    if (!date) return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 });
    if (!targets?.length) return NextResponse.json({ error: "Debes seleccionar al menos un destinatario" }, { status: 400 });

    const event = await prisma.calendarEvent.create({
      data: {
        institutionId,
        createdByUserId: userId,
        title: title.trim(),
        description: description?.trim() || null,
        type: type || "GENERAL",
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        targets: {
          create: targets.map((t) => ({
            type: t.type,
            role: t.role ?? null,
            courseId: t.courseId ?? null,
          })),
        },
      },
      include: {
        targets: { include: { course: { select: { id: true, name: true } } } },
        createdBy: { select: { id: true, fullName: true, role: true } },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (e) {
    console.error("[api/calendar POST]", e?.message);
    const code = e?.message;
    if (code === "APP_USER_NOT_FOUND") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (code === "PROFILE_INCOMPLETE") return NextResponse.json({ error: "Profile incomplete" }, { status: 403 });
    if (code === "NO_INSTITUTION") return NextResponse.json({ error: "No institution" }, { status: 403 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}