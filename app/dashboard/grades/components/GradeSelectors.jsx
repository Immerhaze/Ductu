// app/dashboard/grades/components/GradeSelectors.jsx
"use client";

import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ALL = "__all__";

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div className="min-w-[180px]">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
        <SelectTrigger className="bg-white border-gray-200">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.name ?? o.fullName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function GradeSelectors({
  assignments,
  periods,
  selectedAssignmentId,
  selectedPeriodId,
  search,
  onAssignmentChange,
  onPeriodChange,
  onSearchChange,
  isAdmin = false,
  // props admin
  adminTeachers = [],
  adminCourses  = [],
  adminSubjects = [],
  filterTeacher = "",
  filterCourse  = "",
  filterSubject = "",
  onFilterTeacher,
  onFilterCourse,
  onFilterSubject,
}) {
  const activeFilters = [
    filterTeacher && adminTeachers.find((t) => t.id === filterTeacher)?.fullName,
    filterCourse  && adminCourses.find((c)  => c.id === filterCourse)?.name,
    filterSubject && adminSubjects.find((s) => s.id === filterSubject)?.name,
  ].filter(Boolean);

  return (
    <div className="mb-7 space-y-3">

      {/* Fila 1 (admin): filtros en cascada */}
      {isAdmin && (
        <div className="flex gap-3 flex-wrap">
          <FilterSelect
            label="Profesor"
            value={filterTeacher}
            onChange={onFilterTeacher}
            options={adminTeachers}
            placeholder="Todos los profesores"
          />
          <FilterSelect
            label="Curso"
            value={filterCourse}
            onChange={onFilterCourse}
            options={adminCourses}
            placeholder="Todos los cursos"
          />
          <FilterSelect
            label="Asignatura"
            value={filterSubject}
            onChange={onFilterSubject}
            options={adminSubjects}
            placeholder="Todas las asignaturas"
          />
        </div>
      )}

      {/* Chips de filtros activos */}
      {isAdmin && activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-400">Filtrando por:</span>
          {activeFilters.map((label) => (
            <span
              key={label}
              className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full"
            >
              {label}
            </span>
          ))}
          <span className="text-xs text-gray-400 ml-1">
            · {assignments.length} asignación{assignments.length !== 1 ? "es" : ""}
          </span>
        </div>
      )}

      {/* Fila 2: selector de asignación + período + búsqueda */}
      <div className="flex gap-3 flex-wrap">
        <div className="min-w-[260px]">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
            {isAdmin ? "Asignación" : "Curso · Asignatura"}
          </label>
          <Select value={selectedAssignmentId} onValueChange={onAssignmentChange}>
            <SelectTrigger className="bg-white border-gray-200">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {assignments.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.course.name} · {a.subject.name}
                  {isAdmin && a.teacher ? ` · ${a.teacher.fullName}` : ""}
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
    </div>
  );
}
