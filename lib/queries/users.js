// lib/queries/users.js
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server"; // si es tu auth actual

export async function getUsersForTableScopedToMyInstitution() {
  // 1) sesión
  const sessionUser = await stackServerApp.getUser({ or: "redirect" });

  // 2) usuario interno + institución
  const me = await prisma.appUser.findUnique({
    where: { authUserId: sessionUser.id },
    select: { institutionId: true },
  });

  if (!me?.institutionId) {
    throw new Error("No hay institución asociada a este usuario.");
  }

  // 3) SOLO usuarios de mi institución
  const users = await prisma.appUser.findMany({
    where: { institutionId: me.institutionId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      role: true,
      position: true,
      status: true,
      courses: { select: { name: true } }, // ajusta si tu relación es distinta
    },
  });

  return users;
}
