// lib/import/bulkInviteParser.js
import * as XLSX from "xlsx";

function norm(h) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Eliminar caracteres especiales que no sean letras, números o guión bajo
    .replace(/[^a-z0-9_\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

const ALIASES = {
  email: [
    "email", "email_", "correo", "correo_electronico",
  ],
  role: [
    "rol", "role", "rol_",
  ],
  position_title: [
    "position_title", "cargo", "puesto", "cargo_titulo", "cargo__titulo",
  ],
  student_course: [
    "student_course", "curso_estudiante", "curso_estudiante_",
    "curso", "curso_",
  ],
  teacher_courses: [
    "teacher_courses", "cursos_docente", "cursos_del_profe",
    "cursos_docente_", "cursos",
  ],
  teacher_chief_course: [
    "teacher_chief_course", "curso_jefe", "curso_jefatura",
    "curso_jefatura_",
  ],
  send_invite: [
    "send_invite", "enviar_invitacion", "enviar__invitacion",
    "enviar_invitacion_", "enviar",
  ],
};

function pick(row, key) {
  for (const alias of ALIASES[key] ?? [key]) {
    const v = row[alias];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}

function mapRole(raw) {
  const r = norm(raw);
  if (!r) return "";
  if (["administrativo", "admin", "administrative"].includes(r)) return "ADMINISTRATIVE";
  if (["docente", "profesor", "teacher", "profe"].includes(r)) return "TEACHER";
  if (["estudiante", "alumno", "student"].includes(r)) return "STUDENT";
  return "";
}

export function parseSendInvite(raw) {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v) return true;
  return ["y", "yes", "si", "sí", "s", "true", "1"].includes(v);
}

function splitCourses(raw) {
  return String(raw ?? "")
    .split(/[,;\n]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function validateRow(row) {
  const errors = [];
  if (!row.email) errors.push("Email requerido");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email))
    errors.push("Email inválido");
  if (!row.role)
    errors.push("Rol inválido — usa Administrativo, Docente o Estudiante");
  if (row.role === "ADMINISTRATIVE" && !row.positionTitle)
    errors.push("Cargo requerido para Administrativo");
  if (row.role === "STUDENT" && !row.studentCourseName)
    errors.push("Curso requerido para Estudiante");
  if (row.role === "TEACHER" && !row.teacherCourseNames.length)
    errors.push("Al menos un curso requerido para Docente");
  if (
    row.role === "TEACHER" &&
    row.teacherChiefCourseName &&
    !row.teacherCourseNames.includes(row.teacherChiefCourseName)
  ) {
    errors.push("Curso jefe debe estar dentro de los cursos del docente");
  }
  return errors.map((message) => ({
    row: row.row,
    email: row.email || "—",
    message,
  }));
}

function detectDataStart(rowsAoA) {
  // Buscar la primera fila que contenga "email" o "correo" después de normalizar
  for (let i = 0; i < Math.min(rowsAoA.length, 8); i++) {
    const normed = (rowsAoA[i] ?? []).map(norm);
    const hasEmail = normed.some((h) =>
      ["email", "correo", "correo_electronico"].includes(h)
    );
    const hasRole = normed.some((h) => ["rol", "role"].includes(h));

    if (hasEmail && hasRole) {
      return { headerRowIndex: i, headers: normed, dataStart: i + 1 };
    }
  }
  return null;
}

export async function parseBulkInvitesExcel(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  // Buscar hoja correcta
  const sheetName =
    wb.SheetNames.find((n) =>
      ["invitations", "invitaciones", "usuarios"].includes(norm(n))
    ) ?? wb.SheetNames[0];

  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error("No se encontró la hoja de datos en el archivo.");

  const rowsAoA = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (rowsAoA.length < 2) throw new Error("El archivo está vacío o solo tiene encabezados.");

  // Detectar dónde están los headers reales
  const detected = detectDataStart(rowsAoA);
  if (!detected) {
    throw new Error(
      "No se encontraron los encabezados esperados (email, rol). Verifica que estás usando el template correcto."
    );
  }

  const { headers, dataStart } = detected;

  // Saltar la siguiente fila si es de hints (no contiene email válido)
  let actualDataStart = dataStart;
  const firstDataRow = rowsAoA[dataStart] ?? [];
  const firstRowNormed = firstDataRow.map(norm);
  const looksLikeHint =
    firstRowNormed.some((v) =>
      ["obligatorio", "opcional", "recomendado", "ej"].some((hint) =>
        v.includes(hint)
      )
    );
  if (looksLikeHint) actualDataStart = dataStart + 1;

  const dataRows = rowsAoA.slice(actualDataStart);

  // Convertir a objetos
  const objects = dataRows
    .filter((r) => r.some((c) => String(c).trim() !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = r[i];
      });
      return obj;
    });

  if (!objects.length)
    throw new Error("No se encontraron filas de datos en el archivo.");

  const validRows = [];
  const errors = [];

  objects.forEach((raw, idx) => {
    const realRow = actualDataStart + idx + 1;

    // Saltar filas de leyenda o vacías
    const emailRaw = String(pick(raw, "email")).trim().toLowerCase();
    if (!emailRaw) return;
    if (
      emailRaw.includes("ejemplo") ||
      emailRaw.includes("example") ||
      emailRaw.includes("leyenda") ||
      !emailRaw.includes("@")
    )
      return;

    const row = {
      row: realRow,
      email: emailRaw,
      role: mapRole(pick(raw, "role")),
      positionTitle: String(pick(raw, "position_title")).trim(),
      sendInvite: parseSendInvite(pick(raw, "send_invite")),
      studentCourseName: String(pick(raw, "student_course")).trim(),
      teacherCourseNames: splitCourses(pick(raw, "teacher_courses")),
      teacherChiefCourseName: String(pick(raw, "teacher_chief_course")).trim(),
    };

    const rowErrors = validateRow(row);
    if (rowErrors.length) errors.push(...rowErrors);
    else validRows.push(row);
  });

  return {
    sheetName,
    total: objects.length,
    validRows,
    errors,
  };
}