// app/dashboard/settings/components/AssignmentsTab.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AssignmentsTab() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [modalOpen, setModalOpen]     = useState(false);

  // Datos para el modal
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
        fetch("/api/admin/subjects"),
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

  if (loading) return (
    <div className="flex items-center gap-3 py-8 text-gray-400 text-sm">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Cargando...
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Asignaciones docentes</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Asigna qué docente enseña qué asignatura en qué curso para el año activo
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-blue-950 hover:bg-blue-900 text-sm">
          + Nueva asignación
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {assignments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
          <p className="text-3xl mb-3">👩‍🏫</p>
          <p className="text-sm font-semibold text-gray-700">Sin asignaciones</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Las asignaciones determinan qué docente puede ingresar notas en cada curso y asignatura.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Docente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Curso</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Asignatura</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-medium text-gray-900">{a.teacher?.fullName ?? "—"}</p>
                    <p className="text-xs text-gray-400">{a.teacher?.email}</p>
                  </td>
                  <td className="px-6 py-3 text-gray-700">{a.course?.name ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span className="text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                      {a.subject?.name ?? "—"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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