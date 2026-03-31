// app/dashboard/my-profile/page.jsx
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/authz";
import StudentProfileView from "./components/StudentProfileView";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });

    if (appUser.role !== "STUDENT") {
      redirect("/dashboard");
    }

    return <StudentProfileView studentId={appUser.id} />;
  } catch (e) {
    const code = e?.message;
    if (code === "PROFILE_INCOMPLETE") redirect("/complete-profile");
    if (code === "APP_USER_NOT_FOUND") redirect("/post-auth");
    if (code === "NO_INSTITUTION") redirect("/onboarding");
    redirect("/auth?mode=login");
  }
}