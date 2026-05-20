// app/api/upload/route.js
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAppUser } from "@/lib/authz";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(req) {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role === "STUDENT") {
      return NextResponse.json({ error: "Estudiantes no pueden subir archivos" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: "Tipo de archivo no permitido. Solo PDF, Word, Excel, PowerPoint e imágenes.",
      }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({
        error: `El archivo supera el límite de ${MAX_SIZE_MB}MB`,
      }, { status: 400 });
    }

    // Construir nombre seguro
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
   // Por esto — conserva el nombre original pero agrega timestamp para evitar colisiones:
const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
const safeName = `${appUser.institutionId}/${Date.now()}-${originalName}`;

  const blob = await put(safeName, file, {
  access: "public",
  contentType: file.type,
  token: process.env.BLOB_READ_WRITE_TOKEN,
});

    return NextResponse.json({
      url:      blob.url,
      name:     file.name,
      mimeType: file.type,
      size:     file.size,
    });
  } catch (e) {
    console.error("[api/upload]", e?.message);
    return NextResponse.json({ error: "Error subiendo archivo" }, { status: 500 });
  }
}