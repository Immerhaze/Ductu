// app/api/schedule/slot/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function DELETE(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;

    const slot = await prisma.scheduleSlot.findFirst({
      where: { id, institutionId: appUser.institutionId },
    });
    if (!slot) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    await prisma.scheduleSlot.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}