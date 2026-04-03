// app/dashboard/data/components/StudentPerformanceDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

function SubjectCard({ subject, passingGrade }) {
  const [open, setOpen] = useState(false);
  const passing = subject.passing;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full shrink-0 ${passing ? "bg-green-500" : "bg-red-500"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{subject.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {subject.gradesCount} {subject.gradesCount === 1 ? "nota registrada" : "notas registradas"}
          </p>
        </div>
        <div className="text-right shrink-0 mr-4">
          <p className={`text-2xl font-bold leading-none ${passing ? "text-green-600" : "text-red-500"}`}>
            {subject.avgGrade}
          </p>
          <p className={`text-xs mt-1 font-medium ${passing ? "text-green-500" : "text-red-400"}`}>
            {passing ? "Aprobado" : "Reprobado"}
          </p>
        </div>
        <span className={`text-gray-400 text-sm transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-6 pb-4 pt-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evaluación</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subject.grades.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium text-sm">{g.title}</TableCell>
                  <TableCell className={`font-bold text-sm ${g.value >= passingGrade ? "text-green-600" : "text-red-500"}`}>
                    {g.value}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${
                      g.value >= passingGrade ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    }`}>
                      {g.value >= passingGrade ? "Aprobado" : "Reprobado"}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-gray-400">
                    {new Date(g.date).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function StudentPerformanceDashboard() {
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [kpis, setKpis]                     = useState({ overallAvg: 0, totalSubjects: 0, passingSubjects: 0, failingSubjects: 0 });
  const [subjectSummaries, setSubjectSummaries] = useState([]);
  const [atRiskSubjects, setAtRiskSubjects]   = useState([]);
  const [gradeHistory, setGradeHistory]       = useState([]);
  const [passingGrade, setPassingGrade]       = useState(4.0);

  const hasData = subjectSummaries.length > 0;

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/students/stats");
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setKpis(data.kpis);
        // Ordenar asignaturas de menor a mayor para ver las que están en riesgo primero
        setSubjectSummaries([...(data.subjectSummaries ?? [])].sort((a, b) => a.avgGrade - b.avgGrade));
        setAtRiskSubjects(data.atRiskSubjects ?? []);
        setGradeHistory(data.gradeHistory ?? []);
        setPassingGrade(data.passingGrade ?? 4.0);
      } catch (err) {
        setError("No se pudieron cargar tus datos académicos.");
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
          <p className="text-sm text-gray-400">Cargando tu rendimiento académico...</p>
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
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Panel del estudiante</p>
        <h1 className="text-3xl font-bold text-gray-900">Mi rendimiento académico</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Promedio general"  value={kpis.overallAvg}      sub="todas las asignaturas"    accent="#3b5bdb" />
        <StatCard label="Asignaturas"       value={kpis.totalSubjects}   sub="este año académico"       accent="#1c7ed6" />
        <StatCard label="Aprobadas"         value={kpis.passingSubjects} sub={`promedio ≥ ${passingGrade}`} accent="#2f9e44" />
        <StatCard label="Reprobadas"        value={kpis.failingSubjects} sub="requieren atención"        accent="#e03131" />
      </div>

      {!hasData ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-16 px-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl">📚</div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Sin notas registradas aún</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Tu progreso aparecerá aquí cuando tus profesores comiencen a ingresar calificaciones.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Alerta materias en riesgo */}
          {atRiskSubjects.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-start gap-4">
              <span className="text-2xl shrink-0">🚨</span>
              <div>
                <p className="text-sm font-semibold text-red-700 mb-2">
                  {atRiskSubjects.length} {atRiskSubjects.length === 1 ? "asignatura en riesgo" : "asignaturas en riesgo"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {atRiskSubjects.map((s) => (
                    <span key={s.id} className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1 rounded-lg">
                      {s.name} — {s.avgGrade}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Historial cronológico */}
          {gradeHistory.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <p className="text-sm font-semibold text-gray-900 mb-1">Evolución de calificaciones</p>
              <p className="text-xs text-gray-400 mb-5">Todas tus notas en orden cronológico</p>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={gradeHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ec" />
                  <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#aaa" }} />
                  <YAxis domain={[1, 7]} tick={{ fontSize: 11, fill: "#aaa" }} />
                  <Tooltip
                    formatter={(value, _, props) => [`${value} — ${props.payload.title}`, "Nota"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid #e8e8e3", fontSize: 13 }}
                  />
                  <ReferenceLine
                    y={passingGrade}
                    stroke="#e03131"
                    strokeDasharray="4 4"
                    label={{ value: `Mínimo (${passingGrade})`, fill: "#e03131", fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b5bdb"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b5bdb" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detalle por asignatura */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Detalle por asignatura · ordenado de menor a mayor
            </p>
            <div className="flex flex-col gap-3">
              {subjectSummaries.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} passingGrade={passingGrade} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}