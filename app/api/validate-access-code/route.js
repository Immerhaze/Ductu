import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  let code;
  try {
    ({ code } = await request.json());
  } catch {
    return NextResponse.json({ valid: false, reason: "Solicitud inválida" }, { status: 400 });
  }

  if (!code || typeof code !== "string") {
    return NextResponse.json({ valid: false, reason: "Código requerido" });
  }

  const record = await prisma.accessCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!record) {
    return NextResponse.json({ valid: false, reason: "Código no encontrado" });
  }
  if (!record.isActive) {
    return NextResponse.json({ valid: false, reason: "Código inactivo" });
  }
  if (record.usedAt) {
    return NextResponse.json({ valid: false, reason: "Código ya utilizado" });
  }
  if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
    return NextResponse.json({ valid: false, reason: "Código expirado" });
  }

  return NextResponse.json({ valid: true });
}
