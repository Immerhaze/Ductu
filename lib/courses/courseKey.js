// lib/courses/courseKey.js

function normalizeCourseInput(raw) {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")     // sin tildes
    .replace(/º|°/g, "")                 // sin ° / º
    .replace(/[°º˚]/g, "")              // variantes de grado
    .replace(/\bMEDIO\b/g, "M")          // "MEDIO" → "M"
    .replace(/\bBASICO\b/g, "")          // "BASICO" → nada
    .replace(/\bBASICA\b/g, "")          // "BASICA" → nada
    .replace(/\s+/g, "")                 // sin espacios
    .replace(/[-_./]/g, "");             // sin separadores
}

// Retorna { levelCode, section } o null
// section puede ser null si el usuario no la especificó
function parseCourseKey(raw) {
  const s = normalizeCourseInput(raw);
  if (!s) return null;

  // ── MEDIA con sección ──────────────────────────────────────────────────────
  // 1MA, 2MB, 3MC, 4MA  /  1° Medio A → 1MA  /  1 M A → 1MA
  let m = s.match(/^([1-4])M([A-Z0-9])$/);
  if (m) return { levelCode: `M${m[1]}`, section: m[2] };

  // ── MEDIA sin sección ──────────────────────────────────────────────────────
  // 1M, 2M, 3M, 4M  /  1° Medio → 1M
  m = s.match(/^([1-4])M$/);
  if (m) return { levelCode: `M${m[1]}`, section: null };

  // ── BÁSICA con sección ─────────────────────────────────────────────────────
  // 7A, 8B, 1C  /  7° A → 7A
  m = s.match(/^([1-8])([A-Z0-9])$/);
  if (m) return { levelCode: `B${m[1]}`, section: m[2] };

  // ── BÁSICA sin sección ─────────────────────────────────────────────────────
  // 7, 8, 1, ...  /  7° → 7
  m = s.match(/^([1-8])$/);
  if (m) return { levelCode: `B${m[1]}`, section: null };

  // ── CENTENAS ───────────────────────────────────────────────────────────────
  // 701, 702, 101, 201, 801...
  // Primer dígito = nivel básico (1-8), resto = sección numérica
  m = s.match(/^([1-8])(\d{2})$/);
  if (m) return { levelCode: `B${m[1]}`, section: m[2] };

  // Centenas para media: 101, 201, 301, 401 (primer dígito 1-4, prefijado con "M" semánticamente)
  // Distinguir básica de media por contexto es imposible con solo el número.
  // Preferimos básica por defecto en el rango 1-8XX.
  // Si quieren media centenas, que usen 1M01 o similar — fuera del scope estándar.

  return null;
}

export async function findCourseByUserInput(prismaClient, institutionId, input) {
  const key = parseCourseKey(input);

  if (!key) return null;

  // ── Con sección explícita: búsqueda exacta ─────────────────────────────────
  if (key.section !== null) {
    return prismaClient.course.findFirst({
      where: {
        institutionId,
        levelCode: key.levelCode,
        section: key.section,
        isActive: true,
      },
      select: { id: true, name: true, levelCode: true, section: true },
    });
  }

  // ── Sin sección: buscar todos los paralelos del nivel ──────────────────────
  const courses = await prismaClient.course.findMany({
    where: {
      institutionId,
      levelCode: key.levelCode,
      isActive: true,
    },
    select: { id: true, name: true, levelCode: true, section: true },
    orderBy: { section: "asc" },
  });

  // Exactamente 1 paralelo → lo devolvemos sin ambigüedad
  if (courses.length === 1) return courses[0];

  // Más de 1 paralelo → ambiguo, el caller debe pedir que especifique la sección
  // Retornamos null con un símbolo especial para que el caller pueda dar
  // un error más descriptivo si quiere
  if (courses.length > 1) {
    const err = new Error(
      `El nivel "${input}" tiene ${courses.length} paralelos (${courses.map((c) => c.name).join(", ")}). Especifica la sección, ej: ${courses[0].name}.`
    );
    err.code = "AMBIGUOUS_COURSE";
    err.courses = courses;
    throw err;
  }

  // 0 cursos → no existe
  return null;
}