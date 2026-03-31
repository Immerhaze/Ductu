// app/dashboard/grades/components/AddGradeModal.jsx
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CATEGORY_LABEL = {
  EXAM:       "Prueba / Examen",
  QUIZ:       "Control",
  ASSIGNMENT: "Trabajo / Tarea",
  PROJECT:    "Proyecto",
  ORAL:       "Presentación oral",
  OTHER:      "Otro",
};

export default function AddGradeModal({
  open,
  onClose,
  onSaved,
  assignmentId,
  periodId,
  student,
  policy,
  editingGrade,
}) {
  const isEdit = !!editingGrade;

  const [value, setValue]     = useState("");
  const [title, setTitle]     = useState("");
  const [category, setCategory] = useState("EXAM");
  const [weight, setWeight]   = useState("1.0");
  const [comment, setComment] = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (editingGrade) {
      setValue(Number(editingGrade.value).toFixed(1));
      setTitle(editingGrade.title ?? "");
      setCategory(editingGrade.category ?? "EXAM");
      setWeight(Number(editingGrade.weight).toFixed(1));
      setComment(editingGrade.comment ?? "");
    } else {
      setValue(""); setTitle(""); setCategory("EXAM"); setWeight("1.0"); setComment("");
    }
    setError("");
  }, [editingGrade, open]);

  const handleSave = async () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < policy.scaleMin || numValue > policy.scaleMax) {
      setError(`La nota debe estar entre ${policy.scaleMin} y ${policy.scaleMax}`);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const url = isEdit ? `/api/grades/${editingGrade.id}` : "/api/grades";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { value: numValue, title, category, weight: parseFloat(weight) || 1.0, comment }
        : {
            teachingAssignmentId: assignmentId,
            academicPeriodId: periodId,
            studentId: student.id,
            value: numValue,
            title,
            category,
            weight: parseFloat(weight) || 1.0,
            comment,
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error guardando"); return; }

      onSaved(data.grade, isEdit);
      onClose();
    } catch {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar nota" : `Nueva nota — ${student?.fullName ?? ""}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                Nota * ({policy?.scaleMin} – {policy?.scaleMax})
              </label>
              <Input
                type="number"
                step="0.1"
                min={policy?.scaleMin ?? 1}
                max={policy?.scaleMax ?? 7}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`${policy?.scaleMin ?? 1.0}`}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                Ponderación
              </label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="1.0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">
              Título de la evaluación
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Prueba Unidad 1, Trabajo grupal..."
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">
              Categoría
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Observación sobre esta evaluación..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-y min-h-[72px] font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar nota"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}