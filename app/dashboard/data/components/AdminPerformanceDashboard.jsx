// src/components/AdminPerformanceDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import { BarChartComponent } from "./BarChartComponent";

function StatCard({ label, value, sub, accent }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e3",
        borderRadius: 16,
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: accent,
          borderRadius: "16px 0 0 16px",
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "#888",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 42, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 13, color: "#aaa" }}>{sub}</span>
    </div>
  );
}

function ChartCard({ title, description, children }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e3",
        borderRadius: 16,
        padding: "28px 32px",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>{description}</div>
      </div>
      {children}
    </div>
  );
}

function EmptyBanner() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)",
        border: "1px solid #dde3f5",
        borderRadius: 16,
        padding: "32px 40px",
        display: "flex",
        alignItems: "center",
        gap: 24,
        marginBottom: 32,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "#e0e8ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          flexShrink: 0,
        }}
      >
        📊
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>
          Aún no hay datos de notas registrados
        </div>
        <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>
          Los gráficos y métricas aparecerán aquí una vez que los docentes comiencen a ingresar calificaciones en el sistema.
        </div>
      </div>
    </div>
  );
}

export default function AdminPerformanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passFailCounts, setPassFailCounts] = useState({ total: 0, passing: 0, failing: 0 });
  const [subjectAverages, setSubjectAverages] = useState([]);
  const [teacherAverages, setTeacherAverages] = useState([]);

  const hasData = subjectAverages.length > 0 || teacherAverages.length > 0;

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setPassFailCounts(data.passFailCounts);
        setSubjectAverages(data.subjectAverages);
        setTeacherAverages(data.teacherAverages);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#aaa",
          fontSize: 15,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>⏳</span> Cargando datos del panel...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e55",
          fontSize: 15,
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>⚠️</span> {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "40px 48px",
        background: "#f7f7f5",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 8 }}>
          Panel de administración
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
          Rendimiento académico
        </h1>
      </div>

      {/* Banner sin datos */}
      {!hasData && <EmptyBanner />}

      {/* KPI Cards — siempre visibles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Total estudiantes"
          value={passFailCounts.total}
          sub="con notas registradas"
          accent="#3b5bdb"
        />
        <StatCard
          label="Aprobados"
          value={passFailCounts.passing}
          sub="promedio ≥ nota mínima"
          accent="#2f9e44"
        />
        <StatCard
          label="No aprobados"
          value={passFailCounts.failing}
          sub="requieren atención"
          accent="#e03131"
        />
      </div>

      {/* Charts — solo si hay datos */}
      {hasData && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <ChartCard
            title="Promedio general por asignatura"
            description="Nota promedio de cada materia en toda la institución"
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
            description="Promedio de las notas registradas por cada profesor"
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