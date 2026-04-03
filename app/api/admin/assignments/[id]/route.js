// app/api/admin/assignments/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function DELETE(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;

    const assignment = await prisma.teachingAssignment.findFirst({
      where: { id, institutionId: appUser.institutionId },
    });
    if (!assignment) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

    await prisma.teachingAssignment.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}