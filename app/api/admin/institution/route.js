// app/api/admin/institution/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function PATCH(req) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

    await prisma.institution.update({
      where: { id: appUser.institutionId },
      data: { name: name.trim() },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}