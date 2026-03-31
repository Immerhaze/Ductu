// app/api/calendar/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function DELETE(request, { params }) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { id: eventId } = await params;

    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId },
      select: { id: true, createdByUserId: true, institutionId: true },
    });

    if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    if (event.institutionId !== appUser.institutionId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const canDelete =
      appUser.role === "ADMINISTRATIVE" || event.createdByUserId === appUser.id;

    if (!canDelete) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.calendarEvent.delete({ where: { id: eventId } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/calendar DELETE]", e?.message);
    const code = e?.message;
    if (code === "APP_USER_NOT_FOUND") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}