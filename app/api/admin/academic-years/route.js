// app/api/admin/academic-years/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { institutionId } = appUser;

    const [years, policy] = await Promise.all([
      prisma.academicYear.findMany({
        where: { institutionId },
        orderBy: { year: "desc" },
        include: {
          periods: { orderBy: { periodNumber: "asc" } },
        },
      }),
      prisma.institutionAcademicPolicy.findUnique({
        where: { institutionId },
        select: { activeAcademicYearId: true, passingGrade: true, scaleMin: true, scaleMax: true },
      }),
    ]);

    return NextResponse.json({ years, policy });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { year, name } = await req.json();
    if (!year) return NextResponse.json({ error: "Año requerido" }, { status: 400 });

    const academicYear = await prisma.academicYear.create({
      data: {
        institutionId: appUser.institutionId,
        year: Number(year),
        name: name?.trim() || `Año ${year}`,
        isActive: false,
      },
    });
    return NextResponse.json({ academicYear });
  } catch (e) {
    if (e?.code === "P2002") return NextResponse.json({ error: "Ya existe un año académico con ese número" }, { status: 400 });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}