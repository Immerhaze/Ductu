// app/dashboard/grades/components/GradeStats.jsx
"use client";

function StatPill({ label, value, colorClass }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-3xl font-bold leading-none ${colorClass ?? "text-gray-900"}`}>{value}</span>
    </div>
  );
}

export default function GradeStats({ stats, passingGrade }) {
  const avgColor = () => {
    if (stats.avg === "—") return "text-gray-400";
    return stats.avg >= passingGrade ? "text-green-600" : "text-red-500";
  };

  return (
    <div className="grid grid-cols-5 gap-3 mb-7">
      <StatPill label="Alumnos" value={stats.total} />
      <StatPill label="Con notas" value={stats.withGrades} />
      <StatPill label="Promedio" value={typeof stats.avg === "number" ? stats.avg.toFixed(1) : stats.avg} colorClass={avgColor()} />
      <StatPill label="Aprobados" value={stats.passing} colorClass="text-green-600" />
      <StatPill label="Reprobados" value={stats.failing} colorClass="text-red-500" />
    </div>
  );
}