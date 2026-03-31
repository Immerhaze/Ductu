// app/dashboard/grades/components/GradeSelectors.jsx
"use client";

import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function GradeSelectors({
  assignments,
  periods,
  selectedAssignmentId,
  selectedPeriodId,
  search,
  onAssignmentChange,
  onPeriodChange,
  onSearchChange,
}) {
  return (
    <div className="flex gap-3 mb-7 flex-wrap">
      <div className="min-w-[260px]">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
          Curso · Asignatura
        </label>
        <Select value={selectedAssignmentId} onValueChange={onAssignmentChange}>
          <SelectTrigger className="bg-white border-gray-200">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {assignments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.course.name} · {a.subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[180px]">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
          Período
        </label>
        <Select value={selectedPeriodId} onValueChange={onPeriodChange}>
          <SelectTrigger className="bg-white border-gray-200">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}{p.isActive ? " · Activo" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
          Buscar alumno
        </label>
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nombre o email..."
          className="bg-white border-gray-200"
        />
      </div>
    </div>
  );
}