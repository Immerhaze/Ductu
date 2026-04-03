// app/dashboard/schedule/components/ReadOnlyScheduleView.jsx
"use client";

import { useEffect, useState } from "react";
import ScheduleGrid from "./ScheduleGrid";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function ReadOnlyScheduleView({ userRole }) {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots]     = useState([]);
  const [blocks, setBlocks]   = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/schedule/my");
        if (!res.ok) return;
        const data = await res.json();
        setSlots(data.slots ?? []);
        setBlocks(data.blocks ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="px-12 py-9 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-950 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Cargando horario...</p>
        </div>
      </div>
    );
  }

  // Detectar días activos
  const activeDays = [...new Set(slots.map((s) => s.dayOfWeek))].sort();
  const daysToShow = activeDays.length > 0 ? activeDays : [1, 2, 3, 4, 5];

  return (
    <div className="px-12 py-9 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Horarios</p>
        <h1 className="text-3xl font-bold text-gray-900">
          {userRole === "TEACHER" ? "Mi horario de clases" : "Horario de mi curso"}
        </h1>
      </div>

      {blocks.length === 0 || slots.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-sm font-semibold text-gray-700">Sin horario asignado</p>
          <p className="text-xs text-gray-400 mt-2">
            El administrador aún no ha configurado el horario.
          </p>
        </div>
      ) : (
        <ScheduleGrid
          blocks={blocks}
          slots={slots}
          days={daysToShow}
          dayLabels={DAYS}
          showCourse={userRole === "TEACHER"}
          readOnly
        />
      )}
    </div>
  );
}