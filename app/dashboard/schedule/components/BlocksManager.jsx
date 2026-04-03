// app/dashboard/schedule/components/BlocksManager.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

function BlockRow({ block, onEdit, onDelete }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-3 border-b border-gray-100 last:border-0 ${block.isBreak ? "bg-gray-50" : "bg-white"}`}>
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
        {block.order}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{block.name}</p>
        <p className="text-xs text-gray-400">{block.startTime} – {block.endTime}</p>
      </div>
      {block.isBreak && (
        <span className="text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full">
          Recreo
        </span>
      )}
      <div className="flex gap-2 shrink-0">
        <button onClick={() => onEdit(block)} className="text-xs text-gray-400 hover:text-blue-600 transition-colors px-2 py-1">
          ✏️ Editar
        </button>
        <button onClick={() => onDelete(block)} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1">
          🗑️
        </button>
      </div>
    </div>
  );
}

function BlockModal({ open, onClose, onSaved, editing }) {
  const [name, setName]           = useState(editing?.name ?? "");
  const [startTime, setStartTime] = useState(editing?.startTime ?? "");
  const [endTime, setEndTime]     = useState(editing?.endTime ?? "");
  const [isBreak, setIsBreak]     = useState(editing?.isBreak ?? false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  const handleSave = async () => {
    if (!name.trim() || !startTime || !endTime) {
      setError("Nombre, hora inicio y hora fin son requeridos.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/schedule/blocks/${editing.id}` : "/api/schedule/blocks";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, startTime, endTime, isBreak }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error guardando"); return; }
      onSaved(data.block);
      onClose();
    } catch { setError("Error de red."); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar bloque" : "Nuevo bloque horario"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Nombre *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Bloque 1, Recreo, Almuerzo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Hora inicio *</label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Hora fin *</label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={isBreak} onChange={(e) => setIsBreak(e.target.checked)} />
            Es recreo o pausa (no se asigna clase)
          </label>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
            {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear bloque"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BlocksManager({ blocks, onChanged }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState(null);

  const handleEdit = (block) => { setEditing(block); setModalOpen(true); };

  const handleDelete = async (block) => {
    if (!confirm(`¿Eliminar el bloque "${block.name}"? Esto eliminará todas las clases asignadas en ese bloque.`)) return;
    try {
      const res = await fetch(`/api/schedule/blocks/${block.id}`, { method: "DELETE" });
      if (res.ok) onChanged(blocks.filter((b) => b.id !== block.id));
    } catch {}
  };

  const handleSaved = (block) => {
    if (editing) {
      onChanged(blocks.map((b) => b.id === block.id ? block : b));
    } else {
      onChanged([...blocks, block]);
    }
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Bloques horarios</p>
          <p className="text-xs text-gray-400 mt-0.5">Define los bloques de tiempo de la jornada escolar</p>
        </div>
        <Button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="bg-blue-950 hover:bg-blue-900 text-sm"
        >
          + Nuevo bloque
        </Button>
      </div>

      {blocks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
          <p className="text-3xl mb-3">⏰</p>
          <p className="text-sm font-semibold text-gray-700">Sin bloques configurados</p>
          <p className="text-xs text-gray-400 mt-1">
            Crea los bloques horarios de la jornada escolar (ej: Bloque 1: 8:00-8:45, Recreo: 10:30-11:00...)
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {blocks.map((block) => (
            <BlockRow key={block.id} block={block} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <BlockModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSaved={handleSaved}
        editing={editing}
      />
    </div>
  );
}