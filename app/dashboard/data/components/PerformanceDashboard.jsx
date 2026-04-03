// app/dashboard/data/components/PerformanceDashboard.jsx
"use client";

import { useAppUser } from "@/components/providers/AppUserContext";
import AdminPerformanceDashboard from "./AdminPerformanceDashboard";
import TeacherPerformanceDashboard from "./TeacherPerformanceDashboard";
import StudentPerformanceDashboard from "./StudentPerformanceDashboard";

export default function PerformanceDashboard() {
  const { me, isLoading, error } = useAppUser();

  const role = typeof me?.role === "string" ? me.role.trim().toUpperCase() : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-950 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-red-500">Error cargando la información del usuario.</p>
      </div>
    );
  }

  if (role === "ADMINISTRATIVE") return <AdminPerformanceDashboard />;
  if (role === "TEACHER") return <TeacherPerformanceDashboard />;
  if (role === "STUDENT") return <StudentPerformanceDashboard />;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-sm text-gray-400">Rol no soportado.</p>
    </div>
  );
}