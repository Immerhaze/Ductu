// app/api/schedule/blocks/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function PATCH(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;
    const body = await req.json();

    const block = await prisma.scheduleBlock.findFirst({
      where: { id, institutionId: appUser.institutionId },
    });
    if (!block) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const updated = await prisma.scheduleBlock.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.startTime ? { startTime: body.startTime } : {}),
        ...(body.endTime ? { endTime: body.endTime } : {}),
        ...(typeof body.isBreak === "boolean" ? { isBreak: body.isBreak } : {}),
        ...(typeof body.order === "number" ? { order: body.order } : {}),
      },
    });

    return NextResponse.json({ block: updated });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;

    const block = await prisma.scheduleBlock.findFirst({
      where: { id, institutionId: appUser.institutionId },
    });
    if (!block) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    await prisma.scheduleBlock.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}