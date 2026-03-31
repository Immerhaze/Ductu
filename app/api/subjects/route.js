// app/api/subjects/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    const subjects = await prisma.subject.findMany({
      where: { institutionId: appUser.institutionId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ subjects });
  } catch (e) {
    console.error("[api/subjects]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}