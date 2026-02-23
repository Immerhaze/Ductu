"use server";

import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

function requiredName(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (trimmed.length < 3) return null;
  return trimmed;
}

export async function completeProfileAction({ fullName }) {
  const user = await stackServerApp.getUser({ or: "redirect" });

  const appUser = await prisma.AppUser.findUnique({
    where: { authUserId: user.id },
    include: { institution: true },
  });

  if (!appUser) {
    throw new Error("No existe un perfil interno asociado a esta sesión. Vuelve a /post-auth.");
  }

  if (appUser.profileCompletedAt) {
    return { ok: true }; // ya estaba completo
  }

  const name = requiredName(fullName);
  if (!name) {
    throw new Error("Ingresa un nombre completo válido (mínimo 3 caracteres).");
  }

  await prisma.AppUser.update({
    where: { id: appUser.id },
    data: {
      fullName: name,
      profileCompletedAt: new Date(),
    },
  });

  return { ok: true };
}
