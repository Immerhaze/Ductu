import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req, context) {
  const { token } = await context.params;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const cookieStore = await cookies();
  cookieStore.set("invite_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutes (adjust)
  });

  return NextResponse.redirect(new URL("/auth/invite", req.url));
}
