// app/dashboard/data/components/TeacherPerformanceDashboard.jsx
"use client";

import React, { useState, useEffect } from "react";
import { LineChartComponent } from "./LineChartComponent";
import { BarChartComponent } from "./BarChartComponent";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

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

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-4 my-2">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest shrink-0">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

export default function TeacherPerformanceDashboard() {
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [loadingChief, setLoadingChief]     = useState(true);
  const [error, setError]                   = useState(null);

  // Teacher stats
  const [kpis, setKpis]                                   = useState({ coursesTaught: 0, totalStudentsTaught: 0, passingStudents: 0, failingStudents: 0 });
  const [courses, setCourses]                             = useState([]);
  const [studentPerformancePerCourse, setStudentPerformancePerCourse] = useState([]);
  const [studentsAtRisk, setStudentsAtRisk]               = useState([]);
  const [selectedCourseId, setSelectedCourseId]           = useState("");
  const [selectedAtRiskCourseId, setSelectedAtRiskCourseId] = useState("all");

  // Chief stats
  const [isChief, setIsChief]                             = useState(false);
  const [chiefKpis, setChiefKpis]                         = useState({ coursesLed: 0, totalStudents: 0, passingStudents: 0, failingStudents: 0 });
  const [chiefCourses, setChiefCourses]                   = useState([]);
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
        setCourses(data.courses ?? []);
        // Ordenar alumnos por promedio de menor a mayor
        const sorted = (data.studentPerformancePerCourse ?? []).map((c) => ({
          ...c,
          students: [...c.students].sort((a, b) => a.avgGrade - b.avgGrade),
        }));
        setStudentPerformancePerCourse(sorted);
        setStudentsAtRisk([...(data.studentsAtRisk ?? [])].sort((a, b) => a.avgGrade - b.avgGrade));
        if (data.courses?.length > 0) setSelectedCourseId(data.courses[0].id);
      } catch (err) {
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
          setChiefCourses(data.chiefCourses ?? []);
          // Ordenar asignaturas de menor a mayor para ver las que están en riesgo primero
          const sortedSubjects = (data.subjectAveragesPerCourse ?? []).map((c) => ({
            ...c,
            subjects: [...c.subjects].sort((a, b) => a.avgGrade - b.avgGrade),
          }));
          setSubjectAveragesPerCourse(sortedSubjects);
          // Ordenar alumnos de menor a mayor
          const sortedStudents = (data.studentPerformancePerCourse ?? []).map((c) => ({
            ...c,
            students: [...c.students].sort((a, b) => a.avgGrade - b.avgGrade),
          }));
          setChiefStudentPerformancePerCourse(sortedStudents);
          setStudentsAtRiskPerCourse(data.studentsAtRiskPerCourse ?? []);
          if (data.chiefCourses?.length > 0) setSelectedChiefCourseId(data.chiefCourses[0].id);
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

  const selectedCoursePerformance     = studentPerformancePerCourse.find((c) => c.courseId === selectedCourseId);
  const selectedAtRiskStudents        = selectedAtRiskCourseId === "all"
    ? studentsAtRisk
    : studentsAtRisk.filter((s) => s.courseId === selectedAtRiskCourseId);
  const selectedChiefSubjectAverages  = subjectAveragesPerCourse.find((c) => c.courseId === selectedChiefCourseId)?.subjects ?? [];
  const selectedChiefStudentPerf      = chiefStudentPerformancePerCourse.find((c) => c.courseId === selectedChiefCourseId)?.students ?? [];
  const selectedChiefAtRiskStudents   = studentsAtRiskPerCourse.find((c) => c.courseId === selectedChiefCourseId)?.students ?? [];

  const hasTeacherData = studentPerformancePerCourse.length > 0;
  const hasChiefData   = subjectAveragesPerCourse.length > 0;

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
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Panel del docente</p>
        <h1 className="text-3xl font-bold text-gray-900">Mi rendimiento académico</h1>
      </div>

      {/* ── SECCIÓN DOCENTE ── */}
      <SectionDivider label="Como docente de asignatura" />

      {loadingTeacher ? (
        <div className="flex items-center gap-3 py-8 text-gray-400 text-sm">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
          Cargando datos...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mt-6 mb-8">
            <StatCard label="Cursos impartidos"  value={kpis.coursesTaught}       sub="este año académico"  accent="#3b5bdb" />
            <StatCard label="Alumnos totales"     value={kpis.totalStudentsTaught} sub="en mis asignaturas"  accent="#1c7ed6" />
            <StatCard label="Aprobados"           value={kpis.passingStudents}     sub="promedio ≥ mínimo"   accent="#2f9e44" />
            <StatCard label="Reprobados"          value={kpis.failingStudents}     sub="requieren atención"  accent="#e03131" />
          </div>

          {!hasTeacherData ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-12 px-8 flex flex-col items-center text-center gap-3 mb-8">
              <p className="text-3xl">📊</p>
              <p className="text-sm font-semibold text-gray-700">Sin datos aún</p>
              <p className="text-xs text-gray-400 max-w-xs">Los gráficos aparecerán cuando registres notas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 mb-8">

              {/* Rendimiento individual por curso */}
              <ChartCard
                title="Rendimiento individual de alumnos"
                description="Promedio de cada alumno — ordenado de menor a mayor para identificar quiénes necesitan más apoyo"
              >
                <div className="mb-4">
                  <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                    <SelectTrigger className="w-[200px] h-9 text-sm">
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

              {/* Alumnos en riesgo */}
              <ChartCard
                title="Alumnos en riesgo"
                description="Alumnos con promedio bajo la nota de aprobación — ordenados de menor a mayor"
              >
                <div className="mb-4">
                  <Select value={selectedAtRiskCourseId} onValueChange={setSelectedAtRiskCourseId}>
                    <SelectTrigger className="w-[200px] h-9 text-sm">
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

                {selectedAtRiskStudents.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-sm text-gray-500">No hay alumnos en riesgo en este curso.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Nombre</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Curso</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Promedio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedAtRiskStudents.map((s) => (
                        <TableRow key={s.id} className="hover:bg-red-50/50 transition-colors">
                          <TableCell className="text-sm font-medium text-gray-800">{s.name}</TableCell>
                          <TableCell className="text-sm text-gray-500">{s.courseName}</TableCell>
                          <TableCell className="text-sm font-bold text-red-500">{s.avgGrade}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ChartCard>
            </div>
          )}
        </>
      )}

      {/* ── SECCIÓN PROFESOR JEFE ── */}
      {!loadingChief && isChief && (
        <>
          <SectionDivider label="Como profesor jefe" />

          <div className="grid grid-cols-4 gap-4 mt-6 mb-8">
            <StatCard label="Cursos liderados"  value={chiefKpis.coursesLed}      sub="como profesor jefe"       accent="#7950f2" />
            <StatCard label="Alumnos totales"   value={chiefKpis.totalStudents}   sub="en mis cursos jefe"       accent="#ae3ec9" />
            <StatCard label="Aprobados"         value={chiefKpis.passingStudents} sub="promedio general ≥ mínimo" accent="#2f9e44" />
            <StatCard label="Reprobados"        value={chiefKpis.failingStudents} sub="requieren atención"        accent="#e03131" />
          </div>

          {!hasChiefData ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-12 px-8 flex flex-col items-center text-center gap-3">
              <p className="text-3xl">📊</p>
              <p className="text-sm font-semibold text-gray-700">Sin datos aún</p>
              <p className="text-xs text-gray-400 max-w-xs">Los gráficos aparecerán cuando se registren notas en los cursos que lideras.</p>
            </div>
          ) : (
            <>
              {/* Selector de curso jefe */}
              <div className="mb-6">
                <Select value={selectedChiefCourseId} onValueChange={setSelectedChiefCourseId}>
                  <SelectTrigger className="w-[220px] h-9 text-sm">
                    <SelectValue placeholder="Seleccionar curso jefe" />
                  </SelectTrigger>
                  <SelectContent>
                    {chiefCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-6">
                <ChartCard
                  title="Promedio por asignatura"
                  description="Nota promedio de cada materia en el curso — ordenado de menor a mayor"
                >
                  <BarChartComponent
                    data={selectedChiefSubjectAverages}
                    xAxisDataKey="name"
                    barDataKey="avgGrade"
                    fill="#7950f2"
                  />
                </ChartCard>

                <ChartCard
                  title="Rendimiento general por alumno"
                  description="Promedio general de cada alumno — ordenado de menor a mayor"
                >
                  <LineChartComponent
                    data={selectedChiefStudentPerf}
                    xAxisDataKey="name"
                    lineDataKey="avgGrade"
                    stroke="#ae3ec9"
                  />
                </ChartCard>

                <ChartCard
                  title="Alumnos en riesgo"
                  description="Alumnos con promedio general bajo la nota mínima"
                >
                  {selectedChiefAtRiskStudents.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-2xl mb-2">✅</p>
                      <p className="text-sm text-gray-500">No hay alumnos en riesgo en este curso.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Nombre</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Promedio</TableHead>
                          <TableHead className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Materias en riesgo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedChiefAtRiskStudents
                          .sort((a, b) => a.avgGrade - b.avgGrade)
                          .map((s) => (
                            <TableRow key={s.id} className="hover:bg-red-50/50 transition-colors">
                              <TableCell className="text-sm font-medium text-gray-800">{s.name}</TableCell>
                              <TableCell className="text-sm font-bold text-red-500">{s.avgGrade}</TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {s.subjectsBelowPassing?.join(", ") || "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </ChartCard>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}