import { NextResponse } from "next/server";
import { requireProductAdmin } from "@/lib/productAdmin";
import prisma from "@/lib/prisma";

export async function DELETE(_request, { params }) {
  try {
    await requireProductAdmin();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.accessCode.update({
      where: { id },
      data: { isActive: false },
    });
  } catch {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
