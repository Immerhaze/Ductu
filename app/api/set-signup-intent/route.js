import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const intent = body?.intent;

  if (!intent || !["institution", "invited"].includes(intent)) {
    return NextResponse.json(
      { ok: false, error: "INVALID_INTENT" },
      { status: 400 }
    );
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set("signup_intent", intent, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("signup_intent", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}