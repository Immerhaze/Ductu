import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import AuthClient from "@/app/auth/components/AuthClient";
import { hashToken } from "@/lib/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function InviteAuthPage() {
  const cookieStore = await cookies();
  const inviteToken = cookieStore.get("invite_token")?.value;

  if (!inviteToken) redirect("/auth?mode=login");

  const tokenHash = hashToken(inviteToken);

  const invite = await prisma.invitation.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      email: true,
      role: true,
      usedAt: true,
      expiresAt: true,
      institution: { select: { name: true } },
    },
  });

  const isValid =
    invite &&
    !invite.usedAt &&
    invite.expiresAt &&
    invite.expiresAt > new Date();

  if (!isValid) {
  redirect("/auth/invite/clear");
}


  return (
    <AuthClient
      mode="invite"
      invitedEmail={invite.email}
      invitedRole={invite.role}
      isLoginDefault={false}
      institutionName={invite.institution?.name}
    />
  );
}
