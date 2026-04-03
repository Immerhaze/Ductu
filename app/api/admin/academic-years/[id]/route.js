// app/api/admin/academic-years/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function PATCH(req, { params }) {
  try {
    const { appUser } = await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });
    const { id } = await params;
    const { setActive, name } = await req.json();
    const { institutionId } = appUser;

    const year = await prisma.academicYear.findFirst({
      where: { id, institutionId },
    });
    if (!year) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      if (setActive) {
        // Activar este año y actualizar la política
        await tx.academicYear.update({ where: { id }, data: { isActive: true } });
        await tx.institutionAcademicPolicy.update({
          where: { institutionId },
          data: { activeAcademicYearId: id },
        });
      }
      if (name) {
        await tx.academicYear.update({ where: { id }, data: { name: name.trim() } });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}