// app/dashboard/grades/page.jsx
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/authz";
import GradesClient from "./components/GradesClient";

export const dynamic = "force-dynamic";

export default async function GradesPage() {
  try {
    await requireAppUser({ requireProfileCompleted: true });
    return <GradesClient />;
  } catch (e) {
    const code = e?.message;
    if (code === "PROFILE_INCOMPLETE") redirect("/complete-profile");
    if (code === "APP_USER_NOT_FOUND") redirect("/post-auth");
    if (code === "NO_INSTITUTION") redirect("/onboarding");
    redirect("/auth?mode=login");
  }
}