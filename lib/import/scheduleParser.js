// lib/import/scheduleParser.js
import * as XLSX from "xlsx";

const DAY_MAP = {
  lunes: 1, lun: 1, monday: 1, mon: 1,
  martes: 2, mar: 2, tuesday: 2, tue: 2,
  miercoles: 3, mie: 3, wednesday: 3, wed: 3,
  jueves: 4, jue: 4, thursday: 4, thu: 4,
  viernes: 5, vie: 5, friday: 5, fri: 5,
  sabado: 6, sab: 6, saturday: 6, sat: 6,
  domingo: 7, dom: 7, sunday: 7, sun: 7,
};

function norm(v) {
  return String(v ?? "")
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
  curso:      ["curso", "course", "grado", "nivel"],
  dia:        ["dia", "day", "dia_semana", "jornada"],
  bloque:     ["bloque", "block", "periodo", "hora", "modulo"],
  asignatura: ["asignatura", "subject", "materia", "clase", "ramo"],
  docente:    ["docente", "teacher", "profesor", "profe"],
  sala:       ["sala", "room", "aula", "laboratorio"],
};

function pick(row, key) {
  for (const alias of ALIASES[key] ?? [key]) {
    const v = row[alias];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

function detectHeader(rowsAoA) {
  for (let i = 0; i < Math.min(rowsAoA.length, 8); i++) {
    const normed = (rowsAoA[i] ?? []).map(norm);
    const hasCurso  = normed.some((h) => ALIASES.curso.includes(h));
    const hasBloque = normed.some((h) => ALIASES.bloque.includes(h));
    const hasDia    = normed.some((h) => ALIASES.dia.includes(h));
    if (hasCurso && hasBloque && hasDia) {
      return { headerRowIndex: i, headers: normed, dataStart: i + 1 };
    }
  }
  return null;
}

export async function parseScheduleExcel(file) {
  const buf = await file.arrayBuffer();
  const wb  = XLSX.read(buf, { type: "array" });

  const sheetName =
    wb.SheetNames.find((n) => ["horario", "schedule", "horarios"].includes(norm(n)))
    ?? wb.SheetNames[0];

  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error("No se encontró la hoja de datos en el archivo.");

  const rowsAoA = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
  if (rowsAoA.length < 2) throw new Error("El archivo está vacío o solo tiene encabezados.");

  const detected = detectHeader(rowsAoA);
  if (!detected) {
    throw new Error(
      "No se encontraron los encabezados esperados (curso, dia, bloque). " +
      "Asegúrate de usar el template correcto."
    );
  }

  const { headers, dataStart } = detected;

  // Saltar fila de hints si existe
  let actualDataStart = dataStart;
  const firstRow = rowsAoA[dataStart] ?? [];
  const looksLikeHint = firstRow.map(norm).some((v) =>
    ["obligatorio", "opcional", "ejemplo", "ej", "no_editar"].some((hint) => v.includes(hint))
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
  let skippedEmpty = 0;

  objects.forEach((raw, idx) => {
    const realRow = actualDataStart + idx + 1;

    const curso      = pick(raw, "curso");
    const diaRaw     = pick(raw, "dia");
    const bloque     = pick(raw, "bloque");
    const asignatura = pick(raw, "asignatura");
    const docente    = pick(raw, "docente");
    const sala       = pick(raw, "sala") || null;

    // Filas donde el usuario no llenó la asignatura → skip silencioso
    if (!asignatura) {
      skippedEmpty++;
      return;
    }

    const rowErrors = [];

    if (!curso) rowErrors.push({ row: realRow, message: "Falta el nombre del curso" });
    if (!diaRaw) rowErrors.push({ row: realRow, message: "Falta el día de la semana" });
    if (!bloque) rowErrors.push({ row: realRow, message: "Falta el nombre del bloque" });

    const diaNum = DAY_MAP[norm(diaRaw)];
    if (diaRaw && !diaNum) {
      rowErrors.push({
        row: realRow,
        message: `Día "${diaRaw}" no reconocido. Usa: Lunes, Martes, Miércoles, Jueves, Viernes`,
      });
    }

    if (rowErrors.length) {
      errors.push(...rowErrors);
      return;
    }

    validRows.push({ row: realRow, curso, dia: diaRaw, diaNum, bloque, asignatura, docente, sala });
  });

  return {
    sheetName,
    total: objects.length,
    skippedEmpty,
    validRows,
    errors,
  };
}
