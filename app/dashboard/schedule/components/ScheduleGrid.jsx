// app/dashboard/schedule/components/ScheduleGrid.jsx
"use client";

const DAY_COLORS = {
  1: "bg-blue-500",
  2: "bg-indigo-500",
  3: "bg-violet-500",
  4: "bg-purple-500",
  5: "bg-fuchsia-500",
  6: "bg-pink-500",
  7: "bg-rose-500",
};

const SUBJECT_COLORS = [
  "bg-blue-50 border-blue-200 text-blue-800",
  "bg-green-50 border-green-200 text-green-800",
  "bg-yellow-50 border-yellow-200 text-yellow-800",
  "bg-purple-50 border-purple-200 text-purple-800",
  "bg-pink-50 border-pink-200 text-pink-800",
  "bg-orange-50 border-orange-200 text-orange-800",
  "bg-teal-50 border-teal-200 text-teal-800",
  "bg-indigo-50 border-indigo-200 text-indigo-800",
];

function getSubjectColor(subjectId, subjectMap) {
  if (!subjectId) return null;
  const keys = Object.keys(subjectMap);
  const idx = keys.indexOf(subjectId) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[idx];
}

export default function ScheduleGrid({
  blocks,
  slots,
  days,
  dayLabels,
  onCellClick,
  readOnly = true,
  showCourse = false,
}) {
  // Construir mapa de asignaturas para colores consistentes
  const subjectMap = {};
  slots.forEach((s) => {
    if (s.subject?.id) subjectMap[s.subject.id] = s.subject.name;
  });

  const getSlot = (blockId, dayOfWeek) =>
    slots.find((s) => s.blockId === blockId && s.dayOfWeek === dayOfWeek);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* Columna de bloques */}
              <th className="w-32 bg-gray-50 border-b border-r border-gray-100 px-4 py-3 text-left">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Bloque</span>
              </th>
              {days.map((day) => (
                <th key={day} className="border-b border-r border-gray-100 bg-gray-50 px-4 py-3 text-center min-w-[140px]">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${DAY_COLORS[day] ?? "bg-gray-400"}`} />
                    <span className="text-xs font-semibold text-gray-700">{dayLabels[day - 1]}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blocks.map((block, blockIdx) => (
              <tr key={block.id} className={block.isBreak ? "bg-gray-50/80" : ""}>
                {/* Nombre del bloque */}
                <td className="border-b border-r border-gray-100 px-4 py-3 align-top">
                  <p className="text-xs font-semibold text-gray-700">{block.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{block.startTime} – {block.endTime}</p>
                  {block.isBreak && (
                    <span className="text-xs text-gray-400 italic">Recreo</span>
                  )}
                </td>

                {days.map((day) => {
                  const slot = getSlot(block.id, day);
                  const color = slot?.subject?.id ? getSubjectColor(slot.subject.id, subjectMap) : null;

                  if (block.isBreak) {
                    return (
                      <td key={day} className="border-b border-r border-gray-100 px-3 py-3 text-center">
                        <span className="text-xs text-gray-300">—</span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={day}
                      className={`border-b border-r border-gray-100 px-2 py-2 ${!readOnly ? "cursor-pointer hover:bg-gray-50 transition-colors" : ""}`}
                      onClick={() => !readOnly && onCellClick?.(block.id, day)}
                    >
                      {slot?.subject ? (
                        <div className={`rounded-xl border px-3 py-2 ${color ?? "bg-blue-50 border-blue-200"}`}>
                          <p className="text-xs font-semibold truncate">{slot.subject.name}</p>
                          {slot.teacher && (
                            <p className="text-xs opacity-70 truncate mt-0.5">{slot.teacher.fullName}</p>
                          )}
                          {showCourse && slot.courseSchedule?.course && (
                            <p className="text-xs opacity-60 truncate mt-0.5">{slot.courseSchedule.course.name}</p>
                          )}
                          {slot.room && (
                            <p className="text-xs opacity-50 truncate mt-0.5">📍 {slot.room}</p>
                          )}
                        </div>
                      ) : (
                        !readOnly && (
                          <div className="rounded-xl border-2 border-dashed border-gray-200 px-3 py-2 text-center hover:border-blue-300 transition-colors">
                            <span className="text-xs text-gray-300">+ Agregar</span>
                          </div>
                        )
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}