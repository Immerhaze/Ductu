// app/api/admin/periods/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function POST(req) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { academicYearId, name, periodNumber, startDate, endDate } = await req.json();
    const { institutionId } = appUser;

    if (!academicYearId || !name?.trim() || !periodNumber) {
      return NextResponse.json({ error: "academicYearId, name y periodNumber son requeridos" }, { status: 400 });
    }

    const period = await prisma.academicPeriod.create({
      data: {
        institutionId,
        academicYearId,
        name: name.trim(),
        periodNumber: Number(periodNumber),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: false,
      },
    });
    return NextResponse.json({ period });
  } catch (e) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe un período con ese número en este año" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}