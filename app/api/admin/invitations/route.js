import { NextResponse } from "next/server";
import {
  createInvitationService,
  listPendingInvitationsService,
  revokeInvitationService,
} from "@/lib/server/admin/invitations.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const invitations = await listPendingInvitationsService();
    return NextResponse.json(invitations);
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await createInvitationService(body);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { invitationId } = await req.json();
    const result = await revokeInvitationService(invitationId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 400 });
  }
}
