// app/dashboard/settings/components/SettingsClient.jsx
"use client";

import { useState } from "react";
import AcademicYearsTab from "./AcademicYearsTab";
import SubjectsTab from "./SubjectsTab";
import CoursesTab from "./CoursesTab";
import AssignmentsTab from "./AssignmentsTab";
import InstitutionTab from "./InstitutionTab";

const ADMIN_TABS = [
  { key: "years",       label: "Año académico" },
  { key: "periods",     label: "Períodos" },
  { key: "courses",     label: "Cursos" },
  { key: "subjects",    label: "Asignaturas" },
  { key: "assignments", label: "Asignaciones docentes" },
  { key: "institution", label: "Institución" },
];

export default function SettingsClient({ userRole }) {
  const [activeTab, setActiveTab] = useState("years");
  const isAdmin = userRole === "ADMINISTRATIVE";

  if (!isAdmin) {
    return (
      <div className="px-12 py-9 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Ajustes</p>
          <h1 className="text-3xl font-bold text-gray-900">Mi cuenta</h1>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md">
          <p className="text-sm text-gray-500">
            La configuración de cuenta se gestiona desde Stack Auth.
            Contacta a tu administrador para cambios en tu perfil.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-12 py-9 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Ajustes</p>
        <h1 className="text-3xl font-bold text-gray-900">Configuración académica</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configura el año académico, períodos, cursos y asignaciones docentes
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200 mb-8 overflow-x-auto">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors shrink-0 ${
              activeTab === tab.key
                ? "border-blue-950 text-blue-950"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
   {activeTab === "years"       && <AcademicYearsTab />}
{activeTab === "periods"     && <AcademicYearsTab showPeriodsOnly />}
{activeTab === "courses"     && <CoursesTab />}
{activeTab === "subjects"    && <SubjectsTab />}
{activeTab === "assignments" && <AssignmentsTab />}
{activeTab === "institution" && <InstitutionTab />}
    </div>
  );
}