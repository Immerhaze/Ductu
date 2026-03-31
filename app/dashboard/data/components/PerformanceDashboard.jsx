"use client";

import React, { useEffect, useState } from "react";
import AdminPerformanceDashboard from "./AdminPerformanceDashboard";
import TeacherPerformanceDashboard from "./TeacherPerformanceDashboard";
import StudentPerformanceDashboard from "./StudentPerformanceDashboard";
import { DUMMY_TEACHERS } from "@/lib/DummyPerformanceOverallData";
import { useAppUser } from "@/components/providers/AppUserContext";

export default function PerformanceDashboard() {
  const { me, isLoading, error } = useAppUser();

  const role =
    typeof me?.role === "string"
      ? me.role.trim().toUpperCase()
      : "";

  const [currentTeacherId, setCurrentTeacherId] = useState("");

  useEffect(() => {
    if (role === "TEACHER" && DUMMY_TEACHERS?.length > 0) {
      setCurrentTeacherId(DUMMY_TEACHERS[0].id);
    }
  }, [role]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">
        Cargando datos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center text-red-500">
        Error cargando la información del usuario.
      </div>
    );
  }

  if (role === "ADMINISTRATIVE") {
    return (
      <div className="min-h-screen bg-gray-50 overflow-y-auto">
        <AdminPerformanceDashboard />
      </div>
    );
  }

  if (role === "TEACHER") {
    if (!currentTeacherId) {
      return (
        <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">
          Cargando datos del docente...
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 overflow-y-auto">
        <TeacherPerformanceDashboard currentTeacherId={currentTeacherId} />
      </div>
    );
  }

  if (role === "STUDENT") {
    return (
      <div className="min-h-screen bg-gray-50 overflow-y-auto">
        <StudentPerformanceDashboard />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-center text-gray-500">
      Rol no soportado.
    </div>
  );
}