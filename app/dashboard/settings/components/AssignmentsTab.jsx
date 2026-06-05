// app/dashboard/settings/components/AssignmentsTab.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

function TeacherGroup({ teacher, assignments, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Cabecera del docente */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-indigo-700">
            {teacher.name?.charAt(0)?.toUpperCase() ?? "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{teacher.name}</p>
          <p className="text-xs text-gray-400">{teacher.email}</p>
        </div>
        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
          {assignments.length} asignación{assignments.length !== 1 ? "es" : ""}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Asignaciones del docente */}
      {open && (
        <div className="bg-gray-50/60 divide-y divide-gray-100">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center gap-4 px-6 py-3 pl-16">
              <div className="flex-1 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-700 font-medium">{a.course?.name ?? "—"}</span>
                <svg className="w-3 h-3 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  {a.subject?.name ?? "—"}
                </span>
              </div>
              <button
                onClick={() => onDelete(a.id)}
                className="text-xs text-gray-300 hover:text-red-500 transition-colors shrink-0"
                title="Eliminar asignación"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AssignmentsTab() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [modalOpen, setModalOpen]     = useState(false);
  const [search, setSearch]           = useState("");

  const [teachers, setTeachers]   = useState([]);
  const [courses, setCourses]     = useState([]);
  const [subjects, setSubjects]   = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [courseId, setCourseId]   = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [saving, setSaving]       = useState(false);

  const load = async () => {
    try {
      const [assignRes, usersRes, coursesRes, subjectsRes] = await Promise.all([
        fetch("/api/admin/assignments"),
        fetch("/api/admin/users"),
        fetch("/api/courses?onlyActive=1"),
        fetch("/api/subjects"),
      ]);
      const [assignData, usersData, coursesData, subjectsData] = await Promise.all([
        assignRes.json(), usersRes.json(), coursesRes.json(), subjectsRes.json(),
      ]);
      setAssignments(assignData.assignments ?? []);
      setTeachers((Array.isArray(usersData) ? usersData : []).filter((u) => u.rol === "TEACHER"));
      setCourses(Array.isArray(coursesData?.courses) ? coursesData.courses : []);
      setSubjects(Array.isArray(subjectsData?.subjects) ? subjectsData.subjects : []);
    } catch { setError("No se pudieron cargar los datos."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!teacherId || !courseId || !subjectId) { setError("Selecciona docente, curso y asignatura."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, courseId, subjectId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error creando asignación"); return; }
      await load();
      setModalOpen(false);
      setTeacherId(""); setCourseId(""); setSubjectId("");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta asignación? El docente dejará de ver este curso en su libro de notas.")) return;
    await fetch(`/api/admin/assignments/${id}`, { method: "DELETE" });
    await load();
  };

  // Agrupar por docente
  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim();

    const filtered = q
      ? assignments.filter((a) =>
          a.teacher?.fullName?.toLowerCase().includes(q) ||
          a.teacher?.email?.toLowerCase().includes(q) ||
          a.course?.name?.toLowerCase().includes(q) ||
          a.subject?.name?.toLowerCase().includes(q)
        )
      : assignments;

    const map = {};
    for (const a of filtered) {
      const tid = a.teacher?.id ?? "unknown";
      if (!map[tid]) {
        map[tid] = {
          teacher: { id: tid, name: a.teacher?.fullName ?? "—", email: a.teacher?.email ?? "" },
          assignments: [],
        };
      }
      map[tid].assignments.push(a);
    }
    return Object.values(map).sort((a, b) => a.teacher.name.localeCompare(b.teacher.name));
  }, [assignments, search]);

  if (loading) return (
    <div className="flex items-center gap-3 py-8 text-gray-400 text-sm">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Cargando...
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Asignaciones docentes</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {assignments.length} asignación{assignments.length !== 1 ? "es" : ""} · {grouped.length} docente{grouped.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-blue-950 hover:bg-blue-900 text-sm">
          + Nueva asignación
        </Button>
      </div>

      {/* Buscador */}
      {assignments.length > 0 && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por docente, email, curso o asignatura..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
              ✕
            </button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Lista */}
      {assignments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
          <p className="text-3xl mb-3">👩‍🏫</p>
          <p className="text-sm font-semibold text-gray-700">Sin asignaciones</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Las asignaciones determinan qué docente puede ingresar notas en cada curso y asignatura.
          </p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-10 text-center">
          <p className="text-sm text-gray-500">Sin resultados para "{search}"</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {grouped.map(({ teacher, assignments: teacherAssignments }) => (
            <TeacherGroup
              key={teacher.id}
              teacher={teacher}
              assignments={teacherAssignments}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) { setModalOpen(false); setError(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nueva asignación docente</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Docente *</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Selecciona docente —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} · {t.cargo || "Docente"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Curso *</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Selecciona curso —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Asignatura *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Selecciona asignatura —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setModalOpen(false); setError(""); }} disabled={saving}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
              {saving ? "Creando..." : "Crear asignación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
