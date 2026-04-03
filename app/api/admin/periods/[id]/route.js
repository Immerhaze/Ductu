// app/api/admin/periods/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function PATCH(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;
    const body = await req.json();
    const { institutionId } = appUser;

    const period = await prisma.academicPeriod.findFirst({
      where: { id, institutionId },
    });
    if (!period) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const updated = await prisma.academicPeriod.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
        ...(body.startDate !== undefined ? { startDate: body.startDate ? new Date(body.startDate) : null } : {}),
        ...(body.endDate !== undefined ? { endDate: body.endDate ? new Date(body.endDate) : null } : {}),
      },
    });
    return NextResponse.json({ period: updated });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;

    const period = await prisma.academicPeriod.findFirst({
      where: { id, institutionId: appUser.institutionId },
    });
    if (!period) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    await prisma.academicPeriod.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}