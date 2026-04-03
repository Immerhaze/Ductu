// app/dashboard/schedule/page.jsx
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/authz";
import ScheduleClient from "./components/ScheduleClient";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  try {
    const { appUser } = await requireAppUser({ requireProfileCompleted: true });
    return <ScheduleClient userRole={appUser.role} />;
  } catch (e) {
    redirect("/auth?mode=login");
  }
}