// app/dashboard/userManagment/layout.jsx
import "server-only";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UserManagementLayout({ children }) {
  try {
    await requireAppUser({
      roles: ["ADMINISTRATIVE"],
      requireProfileCompleted: true,
    });

    return <>{children}</>;
  } catch (e) {
    const code = e?.code || e?.message;

    if (code === "PROFILE_INCOMPLETE") redirect("/complete-profile");
    if (code === "APP_USER_NOT_FOUND") redirect("/request-access");
    if (code === "NO_INSTITUTION") redirect("/onboarding");
    if (code === "ACCOUNT_DISABLED") redirect("/auth?mode=login");
    if (code === "FORBIDDEN") redirect("/403");

    redirect("/auth?mode=login");
  }
}
