// app/dashboard/schedule/components/SlotModal.jsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SlotModal({
  open, onClose, blockId, dayOfWeek, existingSlot,
  courseId, subjects, teachers, blocks, days,
  onSaved, onDeleted,
}) {
  const [subjectId, setSubjectId] = useState(existingSlot?.subject?.id ?? "");
  const [teacherId, setTeacherId] = useState(existingSlot?.teacher?.id ?? "");
  const [room, setRoom]           = useState(existingSlot?.room ?? "");
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [error, setError]         = useState("");

  const block   = blocks.find((b) => b.id === blockId);
  const dayName = days.find((d) => d.value === dayOfWeek)?.label ?? "";

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/schedule/slot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          blockId,
          dayOfWeek,
          subjectId: subjectId || null,
          teacherId: teacherId || null,
          room: room || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error guardando"); return; }
      onSaved(data.slot);
      onClose();
    } catch { setError("Error de red."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!existingSlot?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/schedule/slot/${existingSlot.id}`, { method: "DELETE" });
      if (res.ok) {
        onDeleted(blockId, dayOfWeek);
        onClose();
      }
    } catch {}
    finally { setDeleting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {existingSlot ? "Editar clase" : "Agregar clase"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Info del bloque */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{dayName}</span>
            {" · "}
            {block?.name} ({block?.startTime} – {block?.endTime})
          </div>

          {/* Asignatura */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Asignatura</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Sin asignatura —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Docente */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Docente</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Sin docente —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Sala */}
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">Sala (opcional)</label>
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Ej: Sala 12, Lab. Ciencias..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {existingSlot && (
              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                {deleting ? "Eliminando..." : "Eliminar clase"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={saving || deleting}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || deleting} className="bg-blue-950 hover:bg-blue-900">
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}