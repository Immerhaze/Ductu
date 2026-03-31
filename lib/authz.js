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

  const authUser = await stackServerApp.getUser({ or: "redirect" });

  let appUser;
  try {
    appUser = await prisma.appUser.findUnique({
      where: { authUserId: authUser.id },
      select: {
        id: true,
        authUserId: true,
        email: true,
        role: true,
        institutionId: true,
        courseId: true,
        isActive: true,
        isSuperAdmin: true,
        profileCompletedAt: true,
      },
    });
  } catch (e) {
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