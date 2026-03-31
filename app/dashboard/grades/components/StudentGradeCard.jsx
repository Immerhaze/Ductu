// app/dashboard/grades/components/StudentGradeCard.jsx
"use client";

import { useRouter } from "next/navigation";
import GradeChip from "./GradeChip";

export default function StudentGradeCard({
  student,
  grades,
  passingGrade,
  onAddGrade,
  onEditGrade,
  onDeleteGrade,
}) {
  const router = useRouter();

  const avg = grades.length
    ? Math.round((grades.reduce((a, g) => a + Number(g.value), 0) / grades.length) * 10) / 10
    : null;
  const passing = avg !== null ? avg >= passingGrade : null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header del alumno */}
      <div className="flex items-center gap-4 px-6 py-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-base font-bold text-blue-950 shrink-0">
          {student.fullName?.charAt(0) ?? "?"}
        </div>

        {/* Nombre + email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{student.fullName ?? "Sin nombre"}</p>
          <p className="text-xs text-gray-400 truncate">{student.email}</p>
        </div>

        {/* Promedio */}
        <div className="text-right shrink-0">
          {avg !== null ? (
            <>
              <p className={`text-2xl font-bold leading-none ${passing ? "text-green-600" : "text-red-500"}`}>
                {avg.toFixed(1)}
              </p>
              <p className={`text-xs mt-1 font-medium ${passing ? "text-green-500" : "text-red-400"}`}>
                {passing ? "Aprobado" : "Reprobado"}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-300">Sin notas</p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onAddGrade(student)}
            className="bg-blue-950 hover:bg-blue-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            + Nota
          </button>
          <button
            onClick={() => router.push(`/dashboard/grades/student/${student.id}`)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Ver perfil
          </button>
        </div>
      </div>

      {/* Notas del alumno */}
      {grades.length > 0 && (
        <div className="border-t border-gray-50 px-6 pb-3 pt-2">
          {grades.map((grade) => (
            <GradeChip
              key={grade.id}
              grade={grade}
              passingGrade={passingGrade}
              onEdit={onEditGrade}
              onDelete={onDeleteGrade}
            />
          ))}
        </div>
      )}
    </div>
  );
}