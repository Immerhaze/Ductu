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
    if (code === "APP_USER_NOT_FOUND") redirect("/request-access");
    if (code === "NO_INSTITUTION") redirect("/onboarding");
    if (code === "ACCOUNT_DISABLED") redirect("/access-denied");
    redirect("/auth?mode=login");
  }
}
