import "server-only";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/authz";
import DashboardShell from "./DashboardShell";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardLayout({ children }) {
  try {
    await requireAppUser({ requireProfileCompleted: true });
    return <DashboardShell>{children}</DashboardShell>;
  } catch (e) {
    const code = e?.code || e?.message;

    if (code === "PROFILE_INCOMPLETE") redirect("/complete-profile");

    // Antes mandabas esto a /request-access y esa ruta te da 404.
    // Para este flujo, si no existe AppUser todavía, hay que resolverlo en post-auth.
    if (code === "APP_USER_NOT_FOUND") redirect("/api/auth/post-auth");

    if (code === "NO_INSTITUTION") redirect("/onboarding");
    if (code === "ACCOUNT_DISABLED") redirect("/access-denied");

    redirect("/auth?mode=login");
  }
}