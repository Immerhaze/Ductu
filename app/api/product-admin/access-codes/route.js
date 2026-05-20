import { NextResponse } from "next/server";
import { requireProductAdmin } from "@/lib/productAdmin";
import prisma from "@/lib/prisma";

function generateCode() {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DUCTU-${year}-${random}`;
}

export async function GET() {
  try {
    await requireProductAdmin();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const codes = await prisma.accessCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { usedByInstitution: { select: { name: true } } },
  });

  return NextResponse.json(codes);
}

export async function POST(request) {
  try {
    await requireProductAdmin();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  let description, expiresAt;
  try {
    ({ description, expiresAt } = await request.json());
  } catch {
    description = undefined;
    expiresAt = undefined;
  }

  let code;
  let attempts = 0;
  do {
    code = generateCode();
    attempts++;
    const existing = await prisma.accessCode.findUnique({ where: { code } });
    if (!existing) break;
  } while (attempts < 10);

  const record = await prisma.accessCode.create({
    data: {
      code,
      description: description?.trim() || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
