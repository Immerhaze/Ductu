// app/api/notifications/read/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

// Marcar todas como leídas
export async function POST() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    await prisma.notification.updateMany({
      where: { userId: appUser.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}