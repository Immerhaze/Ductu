import "server-only";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";

function authzError(code) {
  const err = new Error(code);
  err.code = code;
  return err;
}

export async function requireAppUser(opts = {}) {
  const { roles, requireProfileCompleted = true } = opts;

  // 1) Usuario autenticado (Stack)
  const authUser = await stackServerApp.getUser({ or: "redirect" });

  // 2) Usuario interno (Prisma)
  let appUser;
  try {
    appUser = await prisma.AppUser.findUnique({
      where: { authUserId: authUser.id },
      select: {
        id: true,
        authUserId: true,
        email: true,
        role: true,
        institutionId: true,
        isActive: true,
        isSuperAdmin: true,
        profileCompletedAt: true,
      },
    });
  } catch (e) {
    // Si la DB cae, que no genere loops
    const err = authzError("DB_UNREACHABLE");
    err.cause = e;
    throw err;
  }

  if (!appUser) throw authzError("APP_USER_NOT_FOUND");
  if (!appUser.isActive) throw authzError("ACCOUNT_DISABLED");
  if (!appUser.institutionId) throw authzError("NO_INSTITUTION");
  if (requireProfileCompleted && !appUser.profileCompletedAt) {
    throw authzError("PROFILE_INCOMPLETE");
  }
  if (roles?.length && !roles.includes(appUser.role)) {
    throw authzError("FORBIDDEN");
  }

  return { authUser, appUser };
}
