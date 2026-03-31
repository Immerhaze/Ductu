// src/components/StudentPerformanceDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from "recharts";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e3", borderRadius: 16, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 6, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: accent, borderRadius: "16px 0 0 16px" }} />
      <span style={{ fontSize: 13, fontWeight: 500, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 42, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 13, color: "#aaa" }}>{sub}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 16 }}>
      {children}
    </div>
  );
}

function EmptyBanner() {
  return (
    <div style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)", border: "1px solid #dde3f5", borderRadius: 16, padding: "32px 40px", display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "#e0e8ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>📚</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>Aún no tienes notas registradas</div>
        <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>Tu progreso académico aparecerá aquí una vez que tus profesores comiencen a ingresar calificaciones.</div>
      </div>
    </div>
  );
}

function SubjectCard({ subject, passingGrade }) {
  const [open, setOpen] = useState(false);
  const statusColor = subject.passing ? "#2f9e44" : "#e03131";
  const statusBg = subject.passing ? "#ebfbee" : "#fff5f5";
  const statusLabel = subject.passing ? "Aprobado" : "Reprobado";

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e3", borderRadius: 16, overflow: "hidden" }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: statusBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            {subject.passing ? "✅" : "⚠️"}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{subject.name}</div>
            <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>{subject.gradesCount} {subject.gradesCount === 1 ? "nota registrada" : "notas registradas"}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: statusColor, lineHeight: 1 }}>{subject.avgGrade}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: statusColor, background: statusBg, borderRadius: 6, padding: "2px 8px", marginTop: 4, display: "inline-block" }}>
              {statusLabel}
            </div>
          </div>
          <div style={{ color: "#ccc", fontSize: 18, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▼</div>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #f0f0ec", padding: "16px 28px 24px" }}>
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
                  <TableCell style={{ fontWeight: 500 }}>{g.title}</TableCell>
                  <TableCell style={{ fontWeight: 700, color: g.value >= passingGrade ? "#2f9e44" : "#e03131" }}>
                    {g.value}
                  </TableCell>
                  <TableCell>
                    <span style={{ fontSize: 12, fontWeight: 500, padding: "2px 10px", borderRadius: 6, background: g.value >= passingGrade ? "#ebfbee" : "#fff5f5", color: g.value >= passingGrade ? "#2f9e44" : "#e03131" }}>
                      {g.value >= passingGrade ? "Aprobado" : "Reprobado"}
                    </span>
                  </TableCell>
                  <TableCell style={{ color: "#aaa", fontSize: 13 }}>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState({ overallAvg: 0, totalSubjects: 0, passingSubjects: 0, failingSubjects: 0 });
  const [subjectSummaries, setSubjectSummaries] = useState([]);
  const [atRiskSubjects, setAtRiskSubjects] = useState([]);
  const [gradeHistory, setGradeHistory] = useState([]);
  const [passingGrade, setPassingGrade] = useState(4.0);

  const hasData = subjectSummaries.length > 0;

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/student/stats");
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setKpis(data.kpis);
        setSubjectSummaries(data.subjectSummaries);
        setAtRiskSubjects(data.atRiskSubjects);
        setGradeHistory(data.gradeHistory);
        setPassingGrade(data.passingGrade);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar tus datos académicos.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 15, gap: 12 }}>
        <span style={{ fontSize: 20 }}>⏳</span> Cargando tu rendimiento académico...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#e55", fontSize: 15, gap: 12 }}>
        <span style={{ fontSize: 20 }}>⚠️</span> {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 48px", background: "#f7f7f5", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 8 }}>
          Panel del estudiante
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
          Mi rendimiento académico
        </h1>
      </div>

      {!hasData && <EmptyBanner />}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
        <StatCard label="Promedio general" value={kpis.overallAvg} sub="todas las asignaturas" accent="#3b5bdb" />
        <StatCard label="Asignaturas" value={kpis.totalSubjects} sub="este año académico" accent="#1c7ed6" />
        <StatCard label="Aprobadas" value={kpis.passingSubjects} sub={`promedio ≥ ${passingGrade}`} accent="#2f9e44" />
        <StatCard label="Reprobadas" value={kpis.failingSubjects} sub="requieren atención" accent="#e03131" />
      </div>

      {hasData && (
        <>
          {/* Alerta de materias en riesgo */}
          {atRiskSubjects.length > 0 && (
            <div style={{ background: "#fff5f5", border: "1px solid #ffc9c9", borderRadius: 16, padding: "20px 28px", marginBottom: 32, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>🚨</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#c92a2a", marginBottom: 6 }}>
                  Tienes {atRiskSubjects.length} {atRiskSubjects.length === 1 ? "asignatura en riesgo" : "asignaturas en riesgo"}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {atRiskSubjects.map((s) => (
                    <span key={s.id} style={{ fontSize: 13, fontWeight: 500, padding: "4px 12px", borderRadius: 8, background: "#ffe3e3", color: "#c92a2a" }}>
                      {s.name} — {s.avgGrade}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Historial cronológico de notas */}
          {gradeHistory.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <SectionTitle>Historial de notas</SectionTitle>
              <div style={{ background: "#fff", border: "1px solid #e8e8e3", borderRadius: 16, padding: "28px 32px" }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>Evolución de calificaciones</div>
                <div style={{ fontSize: 13, color: "#aaa", marginBottom: 20 }}>Todas tus notas en orden cronológico</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={gradeHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ec" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: "#aaa" }} />
                    <YAxis domain={[1, 7]} tick={{ fontSize: 11, fill: "#aaa" }} />
                    <Tooltip
                      formatter={(value, _, props) => [`${value} — ${props.payload.title}`, "Nota"]}
                      contentStyle={{ borderRadius: 10, border: "1px solid #e8e8e3", fontSize: 13 }}
                    />
                    <ReferenceLine y={passingGrade} stroke="#e03131" strokeDasharray="4 4" label={{ value: `Mínimo (${passingGrade})`, fill: "#e03131", fontSize: 11 }} />
                    <Line type="monotone" dataKey="value" stroke="#3b5bdb" strokeWidth={2} dot={{ r: 4, fill: "#3b5bdb" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Detalle por asignatura (expandible) */}
          <div>
            <SectionTitle>Detalle por asignatura</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {subjectSummaries
                .sort((a, b) => a.avgGrade - b.avgGrade)
                .map((subject) => (
                  <SubjectCard key={subject.id} subject={subject} passingGrade={passingGrade} />
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}