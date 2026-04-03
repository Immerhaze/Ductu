// app/dashboard/schedule/components/ScheduleClient.jsx
"use client";

import { useEffect, useState } from "react";
import AdminScheduleView from "./AdminScheduleView";
import ReadOnlyScheduleView from "./ReadOnlyScheduleView";

export default function ScheduleClient({ userRole }) {
  const isAdmin = userRole === "ADMINISTRATIVE";

  return isAdmin ? <AdminScheduleView /> : <ReadOnlyScheduleView userRole={userRole} />;
}