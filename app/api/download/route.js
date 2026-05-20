// app/api/download/route.js
import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/authz";

export async function GET(req) {
  try {
    await requireAppUser({ requireProfileCompleted: true });

    const { searchParams } = new URL(req.url);
    const url  = searchParams.get("url");
    const name = searchParams.get("name");

    if (!url || !name) {
      return NextResponse.json({ error: "url y name son requeridos" }, { status: 400 });
    }

    // Solo permitir URLs de Vercel Blob
    if (!url.includes("vercel-storage.com") && !url.includes("public.blob.vercel-storage.com")) {
      return NextResponse.json({ error: "URL no permitida" }, { status: 403 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json({ error: "No se pudo obtener el archivo" }, { status: 502 });
    }

    const blob = await response.blob();
    const contentType = response.headers.get("content-type") ?? "application/octet-stream";

    return new NextResponse(blob, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Error descargando archivo" }, { status: 500 });
  }
}