// app/dashboard/settings/page.jsx
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/authz";
import SettingsClient from "./components/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    return <SettingsClient userRole={appUser.role} />;
  } catch (e) {
    const code = e?.message;
    if (code === "PROFILE_INCOMPLETE") redirect("/complete-profile");
    if (code === "APP_USER_NOT_FOUND") redirect("/post-auth");
    redirect("/auth?mode=login");
  }
}