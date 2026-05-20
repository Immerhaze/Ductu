import "server-only";
import { stackServerApp } from "@/stack/server";

export async function requireProductAdmin() {
  let user;
  try {
    user = await stackServerApp.getUser();
  } catch {
    user = null;
  }

  const adminEmail = process.env.PRODUCT_ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user?.primaryEmail?.trim().toLowerCase();

  if (!userEmail || !adminEmail || userEmail !== adminEmail) {
    const err = new Error("UNAUTHORIZED");
    err.code = "UNAUTHORIZED";
    throw err;
  }

  return user;
}
