// app/dashboard/settings/components/SubjectsTab.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function SubjectsTab() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [name, setName]         = useState("");
  const [code, setCode]         = useState("");
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/subjects");
      const data = await res.json();
      setSubjects(data.subjects ?? []);
    } catch { setError("No se pudieron cargar las asignaturas."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setName(""); setCode(""); setModalOpen(true); };
  const openEdit = (s) => { setEditing(s); setName(s.name); setCode(s.code ?? ""); setModalOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) { setError("Nombre requerido."); return; }
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/admin/subjects/${editing.id}` : "/api/admin/subjects";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error guardando"); return; }
      await load();
      setModalOpen(false);
    } finally { setSaving(false); }
  };

  const handleToggle = async (subject) => {
    await fetch(`/api/admin/subjects/${subject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !subject.isActive }),
    });
    await load();
  };

  if (loading) return (
    <div className="flex items-center gap-3 py-8 text-gray-400 text-sm">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Cargando...
    </div>
  );

  const active   = subjects.filter((s) => s.isActive);
  const inactive = subjects.filter((s) => !s.isActive);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Asignaturas</p>
          <p className="text-xs text-gray-400 mt-0.5">{active.length} activa{active.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-950 hover:bg-blue-900 text-sm">
          + Nueva asignatura
        </Button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {subjects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-sm font-semibold text-gray-700">Sin asignaturas</p>
          <p className="text-xs text-gray-400 mt-1">Crea las asignaturas de tu institución</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {subjects.map((s) => (
            <div key={s.id} className={`flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0 ${!s.isActive ? "opacity-50" : ""}`}>
              <div className={`w-2 h-2 rounded-full shrink-0 ${s.isActive ? "bg-green-500" : "bg-gray-300"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                {s.code && <p className="text-xs text-gray-400 mt-0.5">Código: {s.code}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(s)} className="text-xs text-gray-400 hover:text-blue-600 transition-colors px-2 py-1">
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleToggle(s)}
                  className={`text-xs px-2 py-1 transition-colors ${s.isActive ? "text-gray-400 hover:text-orange-500" : "text-gray-400 hover:text-green-600"}`}
                >
                  {s.isActive ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) setModalOpen(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? "Editar asignatura" : "Nueva asignatura"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Nombre *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Matemáticas, Lenguaje y Comunicación" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Código (opcional)</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ej: MAT, LEN, HIS" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear asignatura"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}