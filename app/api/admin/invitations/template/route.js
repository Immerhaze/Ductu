// app/api/admin/invitations/template/route.js
import { NextResponse } from "next/server";
import { requireAppUser } from "@/lib/authz";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAppUser({ roles: ["ADMINISTRATIVE"], requireProfileCompleted: true });

    const headers = ["email", "rol", "cargo", "curso", "cursos", "curso_jefatura", "enviar"];
    const hints   = [
      "correo@ejemplo.com",
      "Administrativo | Docente | Estudiante",
      "Solo Administrativo",
      "Solo Estudiante (ej: 7B)",
      "Solo Docente, separar por coma (ej: 7A, 8B)",
      "Solo Docente, opcional",
      "S o N",
    ];
    const examples = [
      ["ana@colegio.com",    "Administrativo", "Coordinadora", "",    "",        "",    "S"],
      ["luis@colegio.com",   "Docente",        "",             "",    "7A, 8B",  "7A",  "S"],
      ["maria@colegio.com",  "Estudiante",     "",             "9C",  "",        "",    "S"],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, hints, ...examples]);

    ws["!cols"] = [
      { wch: 28 }, // email
      { wch: 16 }, // rol
      { wch: 18 }, // cargo
      { wch: 10 }, // curso
      { wch: 20 }, // cursos
      { wch: 16 }, // curso_jefatura
      { wch: 8  }, // enviar
    ];

    XLSX.utils.book_append_sheet(wb, ws, "invitaciones");

    // ── Hoja de demostración ─────────────────────────────────────────────────
    const demo = [
      ["GUÍA DE VALORES ACEPTADOS POR EL SISTEMA"],
      [""],
      ["COLUMNA", "VALORES QUE ENTIENDE EL SISTEMA", "NOTAS"],
      [
        "email",
        "cualquier correo válido: usuario@dominio.com",
        "Obligatorio para todos los roles",
      ],
      [
        "rol",
        "Administrativo  /  admin  /  Administrative\nDocente  /  Profesor  /  Teacher  /  Profe\nEstudiante  /  Alumno  /  Student",
        "No distingue mayúsculas ni tildes",
      ],
      [
        "cargo",
        "Cualquier texto: Rector, Coordinadora, Secretario…",
        "Solo se usa si rol = Administrativo",
      ],
      [
        "curso",
        "Nombre exacto del curso en el sistema: 7A, 8B, 1MA…",
        "Solo se usa si rol = Estudiante",
      ],
      [
        "cursos",
        "Uno o varios cursos separados por coma: 7A, 8B, 9C",
        "Solo se usa si rol = Docente. Obligatorio.",
      ],
      [
        "curso_jefatura",
        "Un curso de los que ya están en 'cursos': 7A",
        "Solo Docente. Opcional. Debe estar en la columna 'cursos'.",
      ],
      [
        "enviar",
        "S  /  Si  /  Sí  /  Y  /  Yes  /  1  /  true   →  envía invitación\nN  /  No  /  0  /  false  →  no envía",
        "Si se deja vacío el sistema envía la invitación",
      ],
      [""],
      ["EJEMPLOS COMPLETOS POR ROL"],
      [""],
      ["email", "rol", "cargo", "curso", "cursos", "curso_jefatura", "enviar"],
      // Administrativo
      ["rector@colegio.com",       "Administrativo", "Rector",        "",    "",             "",    "S"],
      ["secretaria@colegio.com",   "admin",          "Secretaria",    "",    "",             "",    "S"],
      ["coordinador@colegio.com",  "Administrative", "Coordinador",   "",    "",             "",    "N"],
      // Docente
      ["profe.juan@colegio.com",   "Docente",    "", "", "7A, 7B",        "7A",  "S"],
      ["profe.ana@colegio.com",    "Teacher",    "", "", "8A, 8B, 9A",    "8A",  "S"],
      ["profe.luis@colegio.com",   "Profesor",   "", "", "10A",           "",    "S"],
      // Estudiante
      ["est.maria@colegio.com",    "Estudiante", "", "7A",  "", "", "S"],
      ["est.pedro@colegio.com",    "Alumno",     "", "8B",  "", "", "S"],
      ["est.sofia@colegio.com",    "Student",    "", "1MA", "", "", "N"],
    ];

    const wsd = XLSX.utils.aoa_to_sheet(demo);

    wsd["!cols"] = [
      { wch: 28 }, // columna / email
      { wch: 48 }, // valores / rol
      { wch: 44 }, // notas / cargo
      { wch: 10 }, // curso
      { wch: 20 }, // cursos
      { wch: 16 }, // curso_jefatura
      { wch: 8  }, // enviar
    ];

    XLSX.utils.book_append_sheet(wb, wsd, "guia");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="template_invitaciones.xlsx"`,
      },
    });
  } catch (e) {
    console.error("[api/admin/invitations/template]", e?.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
