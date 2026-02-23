function normalizeCourseInput(raw) {
  // "1 m a" -> "1MA", "7-a" -> "7A", "1m-b" -> "1MB"
  return String(raw || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")     // sin tildes
    .replace(/º|°/g, "")                 // sin ° / º
    .replace(/\s+/g, "")                 // sin espacios
    .replace(/[-_]/g, "");               // sin separadores
}

// Devuelve { levelCode, section } o null
function parseCourseKey(raw) {
  const s = normalizeCourseInput(raw);

  // MEDIA: 1MA, 2MB, 3MC, 4MA...
  // patrón: <1-4> M <A-Z|1-9>
  let m = s.match(/^([1-4])M([A-Z0-9])$/);
  if (m) {
    return { levelCode: `M${m[1]}`, section: m[2] };
  }

  // BÁSICA: 7A, 8B, 1C (si manejas básica 1-8)
  // patrón: <1-8> <A-Z|1-9>
  m = s.match(/^([1-8])([A-Z0-9])$/);
  if (m) {
    return { levelCode: `B${m[1]}`, section: m[2] };
  }

  return null;
}

export async function findCourseByUserInput(tx, institutionId, input) {
  const key = parseCourseKey(input);
  if (!key) return null;

  return tx.course.findFirst({
    where: {
      institutionId,
      levelCode: key.levelCode,
      section: key.section,
    },
    select: { id: true, name: true, levelCode: true, section: true },
  });
}