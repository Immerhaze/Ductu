// app/api/admin/users/export/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { appUser } = await requireAppUser({
      roles: ["ADMINISTRATIVE"],
      requireProfileCompleted: true,
    });

    const users = await prisma.appUser.findMany({
      where: { institutionId: appUser.institutionId },
      orderBy: { fullName: "asc" },
      select: {
        fullName: true,
        email: true,
        role: true,
        positionTitle: true,
        isActive: true,
        course: { select: { name: true } },
        teacherCourses: {
          select: {
            isChief: true,
            course: { select: { name: true } },
          },
        },
      },
    });

    const headers = ["nombre", "email", "rol", "cargo", "curso", "estado"];

    const rows = users.map((u) => {
      let curso = "";
      if (u.role === "STUDENT" && u.course?.name) {
        curso = u.course.name;
      } else if (u.role === "TEACHER" && u.teacherCourses?.length) {
        curso = u.teacherCourses
          .map((tc) => (tc.isChief ? `${tc.course.name} (Jefe)` : tc.course.name))
          .join(", ");
      }

      return [
        u.fullName || "-",
        u.email,
        u.role,
        u.positionTitle || "-",
        curso || "-",
        u.isActive ? "Activo" : "Inactivo",
      ];
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    ws["!cols"] = [
      { wch: 28 }, // nombre
      { wch: 32 }, // email
      { wch: 16 }, // rol
      { wch: 20 }, // cargo
      { wch: 24 }, // curso
      { wch: 10 }, // estado
    ];

    XLSX.utils.book_append_sheet(wb, ws, "usuarios");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="lista_usuarios.xlsx"`,
      },
    });
  } catch (e) {
    console.error("[api/admin/users/export]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
