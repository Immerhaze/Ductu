import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const cookieStore = await cookies();
  cookieStore.delete("invite_token");

  return NextResponse.redirect(new URL("/auth/invite/invalid", req.url));
}
