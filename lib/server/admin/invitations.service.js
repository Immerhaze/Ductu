import "server-only";
import prisma from "@/lib/prisma";
import { requireAppUser } from "@/lib/authz";
import { createInviteToken } from "@/lib/invitations";

export async function createInvitationService({ email, role, positionTitle }) {
  const { appUser: requester } = await requireAppUser({
    roles: ["ADMINISTRATIVE"],
  });

  const institutionId = requester.institutionId;

  const normalizedRole = typeof role === "string" ? role.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPositionTitle =
    typeof positionTitle === "string" ? positionTitle.trim() : "";

  if (!normalizedEmail) throw new Error("Email es obligatorio.");
  if (!normalizedRole) throw new Error("Rol es obligatorio.");

  if (normalizedRole === "ADMINISTRATIVE" && !normalizedPositionTitle) {
    throw new Error("El cargo es obligatorio para usuarios administrativos.");
  }

  const exists = await prisma.appUser.findFirst({
    where: { institutionId, email: normalizedEmail },
    select: { id: true },
  });
  if (exists) throw new Error("Ese usuario ya existe en la institución.");

  const activeInvite = await prisma.invitation.findFirst({
    where: {
      institutionId,
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { expiresAt: true },
  });

  if (activeInvite) {
    throw new Error(
      `Ya existe una invitación activa para este correo. Expira el ${activeInvite.expiresAt.toLocaleDateString()}.`
    );
  }

  const { token, tokenHash } = createInviteToken();

  await prisma.invitation.create({
    data: {
      institutionId,
      email: normalizedEmail,
      role: normalizedRole,
      positionTitle: normalizedRole === "ADMINISTRATIVE" ? normalizedPositionTitle : null,
      tokenHash,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      createdByAppUserId: requester.id,
    },
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/invite/${token}`;
  return { inviteUrl };
}

export async function listPendingInvitationsService() {
  const { appUser: requester } = await requireAppUser({ roles: ["ADMINISTRATIVE"] });

  const institutionId = requester.institutionId;
  const now = new Date();

  return prisma.invitation.findMany({
    where: {
      institutionId,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      role: true,
      positionTitle: true,
      createdAt: true,
      expiresAt: true,
      createdByAppUserId: true,
    },
  });
}

export async function revokeInvitationService(invitationId) {
  if (!invitationId) throw new Error("ID de invitación requerido.");

  const { appUser: requester } = await requireAppUser({ roles: ["ADMINISTRATIVE"] });

  const institutionId = requester.institutionId;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, institutionId: true, usedAt: true },
  });

  if (!invitation || invitation.institutionId !== institutionId) {
    throw new Error("Invitación no encontrada.");
  }
  if (invitation.usedAt) throw new Error("La invitación ya fue utilizada.");

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { expiresAt: new Date() },
  });

  return { ok: true };
}
