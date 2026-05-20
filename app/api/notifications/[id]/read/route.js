// app/api/notifications/[id]/read/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

// Marcar una como leída
export async function POST(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const { id } = await params;

    await prisma.notification.updateMany({
      where: { id, userId: appUser.id },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}