// app/api/invite/[token]/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, context) {
  const { token } = await context.params;

  if (!token) {
    return NextResponse.redirect(new URL("/auth/invite/invalid", req.url));
  }

  const res = NextResponse.redirect(new URL("/auth/invite", req.url));

  res.cookies.set("invite_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });

  return res;
}