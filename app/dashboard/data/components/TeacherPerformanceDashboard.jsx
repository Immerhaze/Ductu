// src/components/TeacherPerformanceDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChartComponent } from "./BarChartComponent";
import { LineChartComponent } from "./LineChartComponent";
import {
  Table, TableBody, TableCaption, TableCell,
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

function ChartCard({ title, description, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e3", borderRadius: 16, padding: "28px 32px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{title}</div>
        {description && <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: "#aaa", textTransform: "uppercase", marginBottom: 16, marginTop: 8 }}>
      {children}
    </div>
  );
}

function EmptyBanner({ message }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)", border: "1px solid #dde3f5", borderRadius: 16, padding: "32px 40px", display: "flex", alignItems: "center", gap: 24, marginBottom: 32 }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: "#e0e8ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>📊</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", marginBottom: 4 }}>Aún no hay datos registrados</div>
        <div style={{ fontSize: 14, color: "#888", lineHeight: 1.6 }}>{message}</div>
      </div>
    </div>
  );
}

export default function TeacherPerformanceDashboard() {
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [loadingChief, setLoadingChief] = useState(true);
  const [error, setError] = useState(null);

  // Teacher stats
  const [kpis, setKpis] = useState({ coursesTaught: 0, totalStudentsTaught: 0, passingStudents: 0, failingStudents: 0 });
  const [courses, setCourses] = useState([]);
  const [studentPerformancePerCourse, setStudentPerformancePerCourse] = useState([]);
  const [studentsAtRisk, setStudentsAtRisk] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedAtRiskCourseId, setSelectedAtRiskCourseId] = useState("all");

  // Chief stats
  const [isChief, setIsChief] = useState(false);
  const [chiefKpis, setChiefKpis] = useState({ coursesLed: 0, totalStudents: 0, passingStudents: 0, failingStudents: 0 });
  const [chiefCourses, setChiefCourses] = useState([]);
  const [subjectAveragesPerCourse, setSubjectAveragesPerCourse] = useState([]);
  const [chiefStudentPerformancePerCourse, setChiefStudentPerformancePerCourse] = useState([]);
  const [studentsAtRiskPerCourse, setStudentsAtRiskPerCourse] = useState([]);
  const [selectedChiefCourseId, setSelectedChiefCourseId] = useState("");

  useEffect(() => {
    async function fetchTeacherStats() {
      try {
        const res = await fetch("/api/teachers/stats");
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setKpis(data.kpis);
        setCourses(data.courses);
        setStudentPerformancePerCourse(data.studentPerformancePerCourse);
        setStudentsAtRisk(data.studentsAtRisk);
        if (data.courses.length > 0) setSelectedCourseId(data.courses[0].id);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos del docente.");
      } finally {
        setLoadingTeacher(false);
      }
    }

    async function fetchChiefStats() {
      try {
        const res = await fetch("/api/teachers/chief-stats");
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setIsChief(data.isChief);
        if (data.isChief) {
          setChiefKpis(data.kpis);
          setChiefCourses(data.chiefCourses);
          setSubjectAveragesPerCourse(data.subjectAveragesPerCourse);
          setChiefStudentPerformancePerCourse(data.studentPerformancePerCourse);
          setStudentsAtRiskPerCourse(data.studentsAtRiskPerCourse);
          if (data.chiefCourses.length > 0) setSelectedChiefCourseId(data.chiefCourses[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingChief(false);
      }
    }

    fetchTeacherStats();
    fetchChiefStats();
  }, []);

  // Datos filtrados según curso seleccionado
  const selectedCoursePerformance = studentPerformancePerCourse.find((c) => c.courseId === selectedCourseId);
  const selectedAtRiskStudents = selectedAtRiskCourseId === "all"
    ? studentsAtRisk
    : studentsAtRisk.filter((s) => s.courseId === selectedAtRiskCourseId);

  const selectedChiefSubjectAverages = subjectAveragesPerCourse.find((c) => c.courseId === selectedChiefCourseId)?.subjects ?? [];
  const selectedChiefStudentPerformance = chiefStudentPerformancePerCourse.find((c) => c.courseId === selectedChiefCourseId)?.students ?? [];
  const selectedChiefAtRiskStudents = studentsAtRiskPerCourse.find((c) => c.courseId === selectedChiefCourseId)?.students ?? [];

  const hasTeacherData = studentPerformancePerCourse.length > 0;
  const hasChiefData = subjectAveragesPerCourse.length > 0;

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
          Panel del docente
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
          Mi rendimiento académico
        </h1>
      </div>

      {/* ── SECCIÓN DOCENTE ── */}
      <SectionTitle>Como docente de asignatura</SectionTitle>

      {loadingTeacher ? (
        <div style={{ color: "#aaa", fontSize: 14, marginBottom: 32 }}>Cargando datos...</div>
      ) : (
        <>
          {!hasTeacherData && (
            <EmptyBanner message="Los gráficos aparecerán cuando se registren notas en las materias que impartes." />
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
            <StatCard label="Cursos impartidos" value={kpis.coursesTaught} sub="este año académico" accent="#3b5bdb" />
            <StatCard label="Alumnos totales" value={kpis.totalStudentsTaught} sub="en mis asignaturas" accent="#1c7ed6" />
            <StatCard label="Aprobados" value={kpis.passingStudents} sub="promedio ≥ mínimo" accent="#2f9e44" />
            <StatCard label="Reprobados" value={kpis.failingStudents} sub="requieren atención" accent="#e03131" />
          </div>

          {hasTeacherData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 48 }}>
              <ChartCard title="Rendimiento individual de alumnos" description="Promedio de cada alumno en mis asignaturas según el curso seleccionado">
                <div style={{ marginBottom: 16 }}>
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <LineChartComponent
                  data={selectedCoursePerformance?.students ?? []}
                  xAxisDataKey="name"
                  lineDataKey="avgGrade"
                  stroke="#3b5bdb"
                />
              </ChartCard>

              <ChartCard title="Alumnos en riesgo" description="Alumnos con promedio bajo la nota de aprobación en mis asignaturas">
                <div style={{ marginBottom: 16 }}>
                  <Select value={selectedAtRiskCourseId} onValueChange={setSelectedAtRiskCourseId}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por curso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los cursos</SelectItem>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Promedio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedAtRiskStudents.length > 0 ? (
                      selectedAtRiskStudents.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell>{s.courseName}</TableCell>
                          <TableCell style={{ color: "#e03131", fontWeight: 600 }}>{s.avgGrade}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} style={{ textAlign: "center", color: "#aaa" }}>
                          No hay alumnos en riesgo en este curso.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ChartCard>
            </div>
          )}
        </>
      )}

      {/* ── SECCIÓN PROFESOR JEFE ── */}
      {!loadingChief && isChief && (
        <>
          <div style={{ height: 1, background: "#e8e8e3", margin: "8px 0 40px" }} />
          <SectionTitle>Como profesor jefe</SectionTitle>

          {!hasChiefData && (
            <EmptyBanner message="Los gráficos aparecerán cuando se registren notas en los cursos que lideras." />
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
            <StatCard label="Cursos liderados" value={chiefKpis.coursesLed} sub="como profesor jefe" accent="#7950f2" />
            <StatCard label="Alumnos totales" value={chiefKpis.totalStudents} sub="en mis cursos jefe" accent="#ae3ec9" />
            <StatCard label="Aprobados" value={chiefKpis.passingStudents} sub="promedio general ≥ mínimo" accent="#2f9e44" />
            <StatCard label="Reprobados" value={chiefKpis.failingStudents} sub="requieren atención" accent="#e03131" />
          </div>

          {hasChiefData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ marginBottom: 8 }}>
                <Select value={selectedChiefCourseId} onValueChange={setSelectedChiefCourseId}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Seleccionar curso jefe" />
                  </SelectTrigger>
                  <SelectContent>
                    {chiefCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ChartCard title="Promedio por asignatura" description="Nota promedio de cada materia en el curso seleccionado">
                <BarChartComponent
                  data={selectedChiefSubjectAverages}
                  xAxisDataKey="name"
                  barDataKey="avgGrade"
                  fill="#7950f2"
                />
              </ChartCard>

              <ChartCard title="Rendimiento general por alumno" description="Promedio general de cada alumno en el curso seleccionado">
                <LineChartComponent
                  data={selectedChiefStudentPerformance}
                  xAxisDataKey="name"
                  lineDataKey="avgGrade"
                  stroke="#ae3ec9"
                />
              </ChartCard>

              <ChartCard title="Alumnos en riesgo" description="Alumnos con promedio general bajo la nota mínima en el curso seleccionado">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Promedio general</TableHead>
                      <TableHead>Materias en riesgo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedChiefAtRiskStudents.length > 0 ? (
                      selectedChiefAtRiskStudents.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.name}</TableCell>
                          <TableCell style={{ color: "#e03131", fontWeight: 600 }}>{s.avgGrade}</TableCell>
                          <TableCell>{s.subjectsBelowPassing.join(", ") || "—"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} style={{ textAlign: "center", color: "#aaa" }}>
                          No hay alumnos en riesgo en este curso.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ChartCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}