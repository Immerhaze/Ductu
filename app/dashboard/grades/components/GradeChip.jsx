// app/dashboard/grades/components/GradeChip.jsx
"use client";

const CATEGORY_LABEL = {
  EXAM:       "Prueba",
  QUIZ:       "Control",
  ASSIGNMENT: "Trabajo",
  PROJECT:    "Proyecto",
  ORAL:       "Presentación oral",
  OTHER:      "Otro",
};

const CATEGORY_CLASSES = {
  EXAM:       "bg-red-50 text-red-700",
  QUIZ:       "bg-yellow-50 text-yellow-700",
  ASSIGNMENT: "bg-indigo-50 text-indigo-700",
  PROJECT:    "bg-purple-50 text-purple-700",
  ORAL:       "bg-green-50 text-green-700",
  OTHER:      "bg-gray-100 text-gray-600",
};

export default function GradeChip({ grade, passingGrade, onEdit, onDelete }) {
  const passing = Number(grade.value) >= passingGrade;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 ${CATEGORY_CLASSES[grade.category] ?? CATEGORY_CLASSES.OTHER}`}>
        {CATEGORY_LABEL[grade.category] ?? grade.category}
      </span>

      <span className="text-sm text-gray-500 flex-1 truncate">
        {grade.title ?? "Sin título"}
      </span>

      {grade.comment && (
        <span className="text-xs text-gray-400 truncate max-w-[140px] hidden md:block">
          {grade.comment}
        </span>
      )}

      <span className={`text-sm font-bold shrink-0 ${passing ? "text-green-600" : "text-red-500"}`}>
        {Number(grade.value).toFixed(1)}
      </span>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={() => onEdit(grade)}
          className="text-gray-300 hover:text-blue-500 transition-colors text-xs px-1.5 py-0.5 rounded"
          title="Editar"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(grade.id)}
          className="text-gray-300 hover:text-red-500 transition-colors text-xs px-1.5 py-0.5 rounded"
          title="Eliminar"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}