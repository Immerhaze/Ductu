// app/dashboard/data/components/AdminPerformanceDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import { BarChartComponent } from "./BarChartComponent";

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-2 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: accent }} />
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-4xl font-bold text-gray-900 leading-none">{value}</span>
      <span className="text-xs text-gray-400">{sub}</span>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export default function AdminPerformanceDashboard() {
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [passFailCounts, setPassFailCounts] = useState({ total: 0, passing: 0, failing: 0 });
  const [subjectAverages, setSubjectAverages] = useState([]);
  const [teacherAverages, setTeacherAverages] = useState([]);

  const hasData = subjectAverages.length > 0 || teacherAverages.length > 0;

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setPassFailCounts(data.passFailCounts);
        // Ordenar de menor a mayor para identificar asignaturas en riesgo
        setSubjectAverages([...(data.subjectAverages ?? [])].sort((a, b) => a.avgGrade - b.avgGrade));
        setTeacherAverages([...(data.teacherAverages ?? [])].sort((a, b) => b.avgGrade - a.avgGrade));
      } catch (err) {
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-950 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Cargando datos del panel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-12 py-9 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Panel de administración</p>
        <h1 className="text-3xl font-bold text-gray-900">Rendimiento académico</h1>
        <p className="text-sm text-gray-400 mt-1">Vista general de la institución</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total estudiantes" value={passFailCounts.total} sub="con notas registradas" accent="#3b5bdb" />
        <StatCard label="Aprobados" value={passFailCounts.passing} sub="promedio ≥ nota mínima" accent="#2f9e44" />
        <StatCard label="No aprobados" value={passFailCounts.failing} sub="requieren atención" accent="#e03131" />
      </div>

      {!hasData ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 px-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">📊</div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Aún no hay datos registrados</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Los gráficos aparecerán cuando los docentes comiencen a ingresar calificaciones.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <ChartCard
            title="Promedio por asignatura"
            description="Ordenado de menor a mayor — las primeras asignaturas requieren más atención"
          >
            <BarChartComponent
              data={subjectAverages}
              xAxisDataKey="name"
              barDataKey="avgGrade"
              fill="#3b5bdb"
            />
          </ChartCard>

          <ChartCard
            title="Rendimiento por docente"
            description="Promedio de notas registradas por cada profesor, ordenado de mayor a menor"
          >
            <BarChartComponent
              data={teacherAverages}
              xAxisDataKey="name"
              barDataKey="avgGrade"
              fill="#2f9e44"
            />
          </ChartCard>
        </div>
      )}
    </div>
  );
}