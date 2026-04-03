// app/api/schedule/blocks/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    const blocks = await prisma.scheduleBlock.findMany({
      where: { institutionId: appUser.institutionId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ blocks });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { name, startTime, endTime, isBreak } = await req.json();

    if (!name?.trim() || !startTime || !endTime) {
      return NextResponse.json({ error: "name, startTime y endTime son requeridos" }, { status: 400 });
    }

    const lastBlock = await prisma.scheduleBlock.findFirst({
      where: { institutionId: appUser.institutionId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const block = await prisma.scheduleBlock.create({
      data: {
        institutionId: appUser.institutionId,
        name: name.trim(),
        startTime,
        endTime,
        isBreak: isBreak ?? false,
        order: (lastBlock?.order ?? 0) + 1,
      },
    });

    return NextResponse.json({ block });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}