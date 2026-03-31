// app/api/students/[id]/improvement-plans/[planId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";

export async function PATCH(request, { params }) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role === "STUDENT") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { planId } = await params;
    const { institutionId } = appUser;

    const plan = await prisma.studentImprovementPlan.findFirst({
      where: { id: planId, institutionId },
      select: { id: true },
    });
    if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

    const updated = await prisma.studentImprovementPlan.update({
      where: { id: planId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
      select: {
        id: true, goal: true, isCompleted: true, completedAt: true,
      },
    });

    return NextResponse.json({ plan: updated });
  } catch (e) {
    console.error("[api/students/improvement-plans PATCH]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}