// app/dashboard/my-profile/components/StudentProfileView.jsx
"use client";

import { useEffect, useState } from "react";

const CATEGORY_LABEL = {
  EXAM: "Prueba", QUIZ: "Control", ASSIGNMENT: "Trabajo",
  PROJECT: "Proyecto", ORAL: "Presentación oral", OTHER: "Otro",
};

const CATEGORY_CLASSES = {
  EXAM: "bg-red-50 text-red-700", QUIZ: "bg-yellow-50 text-yellow-700",
  ASSIGNMENT: "bg-indigo-50 text-indigo-700", PROJECT: "bg-purple-50 text-purple-700",
  ORAL: "bg-green-50 text-green-700", OTHER: "bg-gray-100 text-gray-600",
};

const ANNOTATION_CONFIG = {
  POSITIVE:    { label: "Positiva",    bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "⭐" },
  NEGATIVE:    { label: "Negativa",    bg: "bg-red-50",   text: "text-red-700",   border: "border-red-200",   icon: "⚠️" },
  OBSERVATION: { label: "Observación", bg: "bg-blue-50",  text: "text-blue-700",  border: "border-blue-200",  icon: "📝" },
};

const TAB_LABELS = [
  { key: "academic",     label: "Mis notas" },
  { key: "annotations",  label: "Anotaciones" },
  { key: "achievements", label: "Logros" },
  { key: "plans",        label: "Plan de mejora" },
];

function SubjectCard({ subject, passingGrade }) {
  const [open, setOpen] = useState(false);
  const passing = subject.avgGrade >= passingGrade;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
      >
        <div className={`w-3 h-3 rounded-full shrink-0 ${passing ? "bg-green-500" : "bg-red-500"}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{subject.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {subject.teacher} · {subject.gradesCount} {subject.gradesCount === 1 ? "nota" : "notas"}
          </p>
        </div>
        <div className="text-right shrink-0 mr-4">
          <p className={`text-2xl font-bold leading-none ${passing ? "text-green-600" : "text-red-500"}`}>
            {subject.avgGrade}
          </p>
          <p className={`text-xs mt-1 font-medium ${passing ? "text-green-500" : "text-red-400"}`}>
            {passing ? "Aprobado" : "Reprobado"}
          </p>
        </div>
        <span className={`text-gray-400 text-sm transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </div>

      {open && subject.grades.length > 0 && (
        <div className="border-t border-gray-100 px-6 pb-4 pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left py-2 font-medium">Evaluación</th>
                <th className="text-left py-2 font-medium">Categoría</th>
                <th className="text-left py-2 font-medium">Período</th>
                <th className="text-right py-2 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody>
              {subject.grades.map(g => (
                <tr key={g.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2">
                    <p className="font-medium text-gray-800">{g.title ?? "Sin título"}</p>
                    {g.comment && <p className="text-xs text-gray-400 mt-0.5">{g.comment}</p>}
                  </td>
                  <td className="py-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${CATEGORY_CLASSES[g.category] ?? CATEGORY_CLASSES.OTHER}`}>
                      {CATEGORY_LABEL[g.category] ?? g.category}
                    </span>
                  </td>
                  <td className="py-2 text-xs text-gray-500">{g.period}</td>
                  <td className={`py-2 text-right font-bold ${g.value >= passingGrade ? "text-green-600" : "text-red-500"}`}>
                    {Number(g.value).toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StudentProfileView({ studentId }) {
  const [activeTab, setActiveTab] = useState("academic");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [data, setData]           = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/students/${studentId}/profile`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setData(await res.json());
      } catch { setError("No se pudo cargar tu perfil."); }
      finally { setLoading(false); }
    }
    load();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-sm">{error || "Perfil no encontrado"}</p>
      </div>
    );
  }

  const { student, academic, annotations, achievements, improvementPlans } = data;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <div className="bg-blue-950 px-12 py-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
            {student.fullName?.charAt(0) ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{student.fullName ?? "Sin nombre"}</h1>
            <p className="text-blue-300 text-sm mt-1">{student.email}</p>
            {student.course && (
              <span className="text-xs font-medium bg-blue-900 text-blue-200 px-3 py-1 rounded-full mt-2 inline-block">
                {student.course.name}
              </span>
            )}
          </div>

          {/* KPIs */}
          <div className="hidden md:flex gap-4 shrink-0">
            <div className="bg-blue-900 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{academic.overallAvg || "—"}</p>
              <p className="text-xs text-blue-300 mt-1">Promedio general</p>
            </div>
            <div className="bg-blue-900 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">{academic.atRisk?.length ?? 0}</p>
              <p className="text-xs text-blue-300 mt-1">En riesgo</p>
            </div>
            <div className="bg-blue-900 rounded-xl px-5 py-3 text-center">
              <p className="text-2xl font-bold text-white">
                {improvementPlans?.filter(p => !p.isCompleted).length ?? 0}
              </p>
              <p className="text-xs text-blue-300 mt-1">Planes activos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-12">
        <div className="flex">
          {TAB_LABELS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-950 text-blue-950"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="px-12 py-8">

        {/* Mis notas */}
        {activeTab === "academic" && (
          <div className="space-y-6">
            {academic.atRisk.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 flex items-start gap-4">
                <span className="text-2xl shrink-0">🚨</span>
                <div>
                  <p className="text-sm font-semibold text-red-700 mb-2">
                    {academic.atRisk.length} {academic.atRisk.length === 1 ? "materia en riesgo" : "materias en riesgo"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {academic.atRisk.map(s => (
                      <span key={s.id} className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1 rounded-lg">
                        {s.name} — {s.avgGrade}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Promedio general</p>
                <p className={`text-3xl font-bold ${academic.overallAvg >= academic.passingGrade ? "text-green-600" : "text-red-500"}`}>
                  {academic.overallAvg || "—"}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Asignaturas</p>
                <p className="text-3xl font-bold text-gray-900">{academic.subjectSummaries.length}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Aprobadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {academic.subjectSummaries.filter(s => s.passing).length}
                </p>
              </div>
            </div>

            {academic.subjectSummaries.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
                <p className="text-4xl mb-4">📚</p>
                <p className="text-sm font-semibold text-gray-700">Sin notas registradas</p>
                <p className="text-xs text-gray-400 mt-2">Tus notas aparecerán aquí una vez que tus profesores las ingresen.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {academic.subjectSummaries
                  .sort((a, b) => a.avgGrade - b.avgGrade)
                  .map(s => <SubjectCard key={s.id} subject={s} passingGrade={academic.passingGrade} />)}
              </div>
            )}
          </div>
        )}

        {/* Anotaciones — solo lectura */}
        {activeTab === "annotations" && (
          <div className="space-y-3">
            {annotations.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-sm font-semibold text-gray-700">Sin anotaciones</p>
              </div>
            ) : annotations.map(a => {
              const cfg = ANNOTATION_CONFIG[a.type] ?? ANNOTATION_CONFIG.OBSERVATION;
              return (
                <div key={a.id} className={`border rounded-2xl p-5 ${cfg.bg} ${cfg.border}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-sm font-semibold ${cfg.text}`}>{a.title}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md bg-white bg-opacity-60 ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{a.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(a.date).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}
                        {a.author?.fullName ? ` · ${a.author.fullName}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Logros — solo lectura */}
        {activeTab === "achievements" && (
          <div>
            {achievements.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
                <p className="text-3xl mb-3">🏆</p>
                <p className="text-sm font-semibold text-gray-700">Sin logros registrados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map(a => (
                  <div key={a.id} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">🏆</span>
                      <div>
                        <p className="text-sm font-semibold text-yellow-800">{a.title}</p>
                        {a.description && <p className="text-sm text-yellow-700 mt-1">{a.description}</p>}
                        <p className="text-xs text-yellow-600 mt-2">
                          {new Date(a.date).toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" })}
                          {a.author?.fullName ? ` · ${a.author.fullName}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Planes de mejora — solo lectura */}
        {activeTab === "plans" && (
          <div className="space-y-3">
            {improvementPlans.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
                <p className="text-3xl mb-3">🎯</p>
                <p className="text-sm font-semibold text-gray-700">Sin planes de mejora</p>
              </div>
            ) : improvementPlans.map(plan => (
              <div key={plan.id} className={`border rounded-2xl p-5 ${plan.isCompleted ? "bg-gray-50 border-gray-200 opacity-75" : "bg-indigo-50 border-indigo-200"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg">{plan.isCompleted ? "✅" : "🎯"}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${plan.isCompleted ? "text-gray-500 line-through" : "text-indigo-800"}`}>
                      {plan.goal}
                    </p>
                    {plan.description && <p className="text-sm text-gray-600 mt-1">{plan.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {plan.dueDate && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          plan.isCompleted ? "bg-gray-100 text-gray-500" :
                          new Date(plan.dueDate) < new Date() ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"
                        }`}>
                          📅 {new Date(plan.dueDate).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      )}
                      {plan.isCompleted && plan.completedAt && (
                        <span className="text-xs text-green-600">
                          Completado el {new Date(plan.completedAt).toLocaleDateString("es-CL")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}