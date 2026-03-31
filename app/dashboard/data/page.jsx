// app/dashboard/data/page.jsx
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/authz";
import PerformanceDashboard from "./components/PerformanceDashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DataPage() {
  try {
     await requireAppUser({ requireProfileCompleted: true });
  return <PerformanceDashboard />;
  } catch (e) {
    const code = e?.message;

    if (code === "PROFILE_INCOMPLETE") redirect("/complete-profile");
    if (code === "APP_USER_NOT_FOUND") redirect("/api/auth/post-auth");
    if (code === "NO_INSTITUTION") redirect("/onboarding");
    if (code === "ACCOUNT_DISABLED") redirect("/auth?mode=login");

    redirect("/auth??mode=login");
  }
}
