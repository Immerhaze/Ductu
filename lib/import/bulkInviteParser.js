import * as XLSX from "xlsx";

function normHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

// Aliases simples (ya normalizados)
const HEADER_ALIASES = {
  full_name: ["full_name", "nombre_completo", "nombre", "name"],
  email: ["email", "correo", "correo_electronico"],
  role: ["role", "rol"],
  position_title: ["position_title", "cargo", "puesto"],
  student_course: ["student_course", "curso_estudiante", "curso_(estudiante)"],
  teacher_courses: ["teacher_courses", "cursos_docente", "cursos_del_profe"],
  teacher_chief_course: ["teacher_chief_course", "curso_jefe", "curso_jefatura"],
  send_invite: ["send_invite", "enviar_invitacion", "enviar__invitacion"],
};

function pick(row, key) {
  const aliases = HEADER_ALIASES[key] || [key];
  for (const a of aliases) {
    const v = row[a];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}

function mapRoleToEnum(raw) {
  const r = String(raw || "").trim().toLowerCase();
  if (!r) return "";
  if (["administrativo", "admin", "administrative"].includes(r)) return "ADMINISTRATIVE";
  if (["docente", "profesor", "teacher", "profe"].includes(r)) return "TEACHER";
  if (["estudiante", "alumno", "student"].includes(r)) return "STUDENT";
  if (["administrative", "teacher", "student"].includes(r)) return r.toUpperCase();
  if (["ADMINISTRATIVE", "TEACHER", "STUDENT"].includes(String(raw).trim())) return String(raw).trim();
  return "";
}

function parseYesNo(raw) {
  const v = String(raw || "").trim().toLowerCase();
  if (!v) return true; // default: true (o cámbialo a false si prefieres “safe”)
  return ["y", "yes", "si", "sí", "s", "true", "1"].includes(v);
}

function splitCourses(raw) {
  return String(raw || "")
    .split(/[,;\n]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function validateRow(n, rowIndex1Based) {
  const errors = [];

  if (!n.email) errors.push("Email requerido");
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.email)) errors.push("Email inválido");

  if (!n.role) errors.push("Rol inválido (usa Administrativo/Docente/Estudiante)");

  if (n.role === "ADMINISTRATIVE") {
    if (!n.positionTitle) errors.push("Cargo requerido para Administrativo");
  }

  if (n.role === "STUDENT") {
    if (!n.studentCourseName) errors.push("Curso del estudiante requerido");
  }

  if (n.role === "TEACHER") {
    if (!n.teacherCourseNames.length) errors.push("Cursos del docente requerido (>=1)");
    if (n.teacherChiefCourseName && !n.teacherCourseNames.includes(n.teacherChiefCourseName)) {
      errors.push("Curso jefe debe estar dentro de cursos del docente");
    }
  }

  return errors.map((m) => ({ row: rowIndex1Based, email: n.email || "-", message: m }));
}

/**
 * Detecta si el excel trae 2 filas de header (ES + machine EN)
 */
function detectHeaderMode(rowsAoA) {
  const r1 = (rowsAoA[0] || []).map(normHeader);
  const r2 = (rowsAoA[1] || []).map(normHeader);

  const looksLikeMachine = r2.includes("email") && (r2.includes("role") || r2.includes("rol"));
  if (looksLikeMachine) {
    return { headers: r2, dataStartIndex: 2, headerRowIndex: 2 }; // data desde fila 3
  }
  return { headers: r1, dataStartIndex: 1, headerRowIndex: 1 }; // data desde fila 2
}

/**
 * Lee el Excel y devuelve preview: validRows + errors
 */
export async function parseBulkInvitesExcel(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const sheetName =
    wb.SheetNames.find((n) => normHeader(n) === "invitations" || normHeader(n) === "invitaciones") ||
    wb.SheetNames[0];

  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error("No se encontró la hoja de Invitaciones.");

  const rowsAoA = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (!rowsAoA.length) throw new Error("El archivo está vacío.");

  const { headers, dataStartIndex, headerRowIndex } = detectHeaderMode(rowsAoA);

  const dataRows = rowsAoA.slice(dataStartIndex);

  const objects = dataRows
    .filter((r) => r.some((cell) => String(cell).trim() !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    });

  const validRows = [];
  const errors = [];

  objects.forEach((raw, idx) => {
    const rowIndex1Based = dataStartIndex + idx + 1; // 1-based real row in sheet

    // Skip example rows (si tu template trae esa marca)
    const maybeName = String(pick(raw, "full_name")).trim().toLowerCase();
    if (maybeName.includes("ejemplo")) return;

    const email = String(pick(raw, "email")).trim().toLowerCase();
    const role = mapRoleToEnum(pick(raw, "role"));
    const positionTitle = String(pick(raw, "position_title")).trim();

    const sendInvite = parseYesNo(pick(raw, "send_invite"));

    const studentCourseName = String(pick(raw, "student_course")).trim();

    const teacherCourseNames = splitCourses(pick(raw, "teacher_courses"));
    const teacherChiefCourseName = String(pick(raw, "teacher_chief_course")).trim();

    const normalized = {
      row: rowIndex1Based,
      email,
      role,
      positionTitle,
      sendInvite,
      studentCourseName,
      teacherCourseNames,
      teacherChiefCourseName,
    };

    const rowErrors = validateRow(normalized, rowIndex1Based);
    if (rowErrors.length) errors.push(...rowErrors);
    else validRows.push(normalized);
  });

  return {
    sheetName,
    headerRow: headerRowIndex,
    total: objects.length,
    validRows,
    errors,
  };
}