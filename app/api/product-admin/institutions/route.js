import { NextResponse } from "next/server";
import { requireProductAdmin } from "@/lib/productAdmin";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await requireProductAdmin();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const institutions = await prisma.institution.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      _count: { select: { appUsers: true } },
    },
  });

  return NextResponse.json(institutions);
}
