import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { stackServerApp } from "@/stack/server";
import CompleteProfileClient from "./ui/CompleteProfileClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompleteProfilePage() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  const appUser = await prisma.AppUser.findUnique({
    where: { authUserId: user.id },
    include: { institution: true },
  });

  // Si no existe AppUser, el flujo correcto es volver a post-auth
  if (!appUser) return redirect("/post-auth");

  // Si ya completó, no tiene sentido estar aquí
  if (appUser.profileCompletedAt) return redirect("/dashboard");

  const institutionName = appUser.institution?.name ?? "—";

  return (
    <CompleteProfileClient
      initial={{
        fullName: appUser.fullName ?? user.displayName ?? "",
        email: appUser.email ?? user.primaryEmail ?? "",
        role: appUser.role,
        positionTitle: appUser.positionTitle ?? null,
        isSuperAdmin: appUser.isSuperAdmin ?? false,
        institutionName,
      }}
    />
  );
}
