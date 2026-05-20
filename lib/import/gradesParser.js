// lib/import/gradesParser.js
import * as XLSX from "xlsx";

function norm(h) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

const ALIASES = {
  email:       ["email", "correo", "correo_electronico"],
  titulo:      ["titulo", "title", "evaluacion", "nombre_evaluacion", "titulo_evaluacion"],
  nota:        ["nota", "value", "calificacion", "grade", "puntaje"],
  categoria:   ["categoria", "category", "tipo", "tipo_evaluacion"],
  ponderacion: ["ponderacion", "weight", "peso", "porcentaje"],
  comentario:  ["comentario", "comment", "observacion", "obs"],
};

const CATEGORY_MAP = {
  "examen":      "EXAM",
  "exam":        "EXAM",
  "prueba":      "EXAM",
  "test":        "EXAM",
  "tarea":       "HOMEWORK",
  "homework":    "HOMEWORK",
  "trabajo":     "HOMEWORK",
  "participacion": "PARTICIPATION",
  "participation": "PARTICIPATION",
  "proyecto":    "PROJECT",
  "project":     "PROJECT",
  "otro":        "OTHER",
  "other":       "OTHER",
};

function pick(row, key) {
  for (const alias of ALIASES[key] ?? [key]) {
    const v = row[alias];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
}

function mapCategory(raw) {
  const n = norm(String(raw ?? ""));
  return CATEGORY_MAP[n] ?? "OTHER";
}

function detectDataStart(rowsAoA) {
  for (let i = 0; i < Math.min(rowsAoA.length, 8); i++) {
    const normed = (rowsAoA[i] ?? []).map(norm);
    const hasEmail = normed.some((h) => ["email", "correo"].includes(h));
    const hasNota  = normed.some((h) => ["nota", "value", "calificacion", "grade"].includes(h));
    if (hasEmail && hasNota) {
      return { headerRowIndex: i, headers: normed, dataStart: i + 1 };
    }
  }
  return null;
}

export async function parseGradesExcel(file, { scaleMin = 1.0, scaleMax = 7.0 } = {}) {
  const buf = await file.arrayBuffer();
  const wb  = XLSX.read(buf, { type: "array" });

  const sheetName =
    wb.SheetNames.find((n) => ["notas", "grades", "calificaciones"].includes(norm(n)))
    ?? wb.SheetNames[0];

  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error("No se encontró la hoja de datos en el archivo.");

  const rowsAoA = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (rowsAoA.length < 2) throw new Error("El archivo está vacío o solo tiene encabezados.");

  const detected = detectDataStart(rowsAoA);
  if (!detected) {
    throw new Error("No se encontraron los encabezados esperados (email, nota). Verifica que estás usando el template correcto.");
  }

  const { headers, dataStart } = detected;

  // Saltar fila de hints si existe
  let actualDataStart = dataStart;
  const firstDataRow   = rowsAoA[dataStart] ?? [];
  const looksLikeHint  = firstDataRow.map(norm).some((v) =>
    ["obligatorio", "opcional", "ejemplo", "ej"].some((hint) => v.includes(hint))
  );
  if (looksLikeHint) actualDataStart = dataStart + 1;

  const dataRows = rowsAoA.slice(actualDataStart);

  const objects = dataRows
    .filter((r) => r.some((c) => String(c).trim() !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = r[i]; });
      return obj;
    });

  if (!objects.length) throw new Error("No se encontraron filas de datos en el archivo.");

  const validRows = [];
  const errors    = [];

  objects.forEach((raw, idx) => {
    const realRow = actualDataStart + idx + 1;

    const email = String(pick(raw, "email")).trim().toLowerCase();
    if (!email || !email.includes("@")) return; // saltar filas vacías o de ejemplo

    const notaRaw = pick(raw, "nota");
    const nota    = parseFloat(String(notaRaw).replace(",", "."));

    const row = {
      row:         realRow,
      email,
      titulo:      String(pick(raw, "titulo")).trim() || "Sin título",
      nota,
      categoria:   mapCategory(pick(raw, "categoria")),
      ponderacion: parseFloat(String(pick(raw, "ponderacion")).replace(",", ".")) || 1.0,
      comentario:  String(pick(raw, "comentario")).trim() || null,
    };

    const rowErrors = [];

    if (isNaN(nota)) {
      rowErrors.push({ row: realRow, email, message: "Nota inválida — debe ser un número" });
    } else if (nota < scaleMin || nota > scaleMax) {
      rowErrors.push({ row: realRow, email, message: `Nota fuera de rango (${scaleMin}–${scaleMax})` });
    }

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