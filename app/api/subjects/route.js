// app/api/admin/subjects/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const subjects = await prisma.subject.findMany({
      where: { institutionId: appUser.institutionId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ subjects });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { name, code } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

    const subject = await prisma.subject.create({
      data: {
        institutionId: appUser.institutionId,
        name: name.trim(),
        code: code?.trim() || null,
        isActive: true,
      },
    });
    return NextResponse.json({ subject });
  } catch (e) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe una asignatura con ese nombre o código" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}