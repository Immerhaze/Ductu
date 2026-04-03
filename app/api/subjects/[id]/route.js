// app/api/admin/subjects/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function PATCH(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;
    const { name, code, isActive } = await req.json();

    const subject = await prisma.subject.findFirst({
      where: { id, institutionId: appUser.institutionId },
    });
    if (!subject) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(code !== undefined ? { code: code?.trim() || null } : {}),
        ...(typeof isActive === "boolean" ? { isActive } : {}),
      },
    });
    return NextResponse.json({ subject: updated });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;

    const subject = await prisma.subject.findFirst({
      where: { id, institutionId: appUser.institutionId },
    });
    if (!subject) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    // Soft delete — desactivar en lugar de borrar
    await prisma.subject.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}