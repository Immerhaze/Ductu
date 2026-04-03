// app/dashboard/settings/components/CoursesTab.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  getCoursesAdminViewAction,
  saveCourseConfigAndGenerateCoursesAction,
} from "@/lib/server/actions/courses";

const LEVELS = [
  { code: "B1", label: "1° Básico" }, { code: "B2", label: "2° Básico" },
  { code: "B3", label: "3° Básico" }, { code: "B4", label: "4° Básico" },
  { code: "B5", label: "5° Básico" }, { code: "B6", label: "6° Básico" },
  { code: "B7", label: "7° Básico" }, { code: "B8", label: "8° Básico" },
  { code: "M1", label: "1° Medio"  }, { code: "M2", label: "2° Medio"  },
  { code: "M3", label: "3° Medio"  }, { code: "M4", label: "4° Medio"  },
];

export default function CoursesTab() {
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [courses, setCourses]       = useState([]);
  const [activeLevels, setActiveLevels] = useState(LEVELS.map((l) => l.code));
  const [sectionNaming, setSectionNaming] = useState("LETTERS");
  const [sectionCount, setSectionCount]   = useState(2);
  const [nameFormat, setNameFormat]       = useState("CHILE_TRADITIONAL");

  useEffect(() => {
    async function load() {
      try {
        const res = await getCoursesAdminViewAction();
        const cfg = res?.config;
        if (cfg) {
          setActiveLevels(cfg.activeLevels?.length ? cfg.activeLevels : LEVELS.map((l) => l.code));
          setSectionNaming(cfg.sectionNaming || "LETTERS");
          setSectionCount(cfg.sectionCount ?? 2);
          setNameFormat(cfg.nameFormat || "CHILE_TRADITIONAL");
        }
        setCourses(Array.isArray(res?.courses) ? res.courses : []);
      } catch (e) { setError(e?.message || "No se pudo cargar la configuración."); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const preview = useMemo(() => {
    const max = Math.min(Number(sectionCount || 1), 3);
    const sections = sectionNaming === "NUMBERS"
      ? Array.from({ length: max }, (_, i) => String(i + 1))
      : ["A", "B", "C"].slice(0, max);

    const basic = sections.map((s) => {
      if (nameFormat === "CHILE_TRADITIONAL") return `1°${s}`;
      if (nameFormat === "COMPACT") return `1${s}`;
      return `1${s}`;
    });

    const middle = sections.map((s, i) => {
      if (nameFormat === "CHILE_TRADITIONAL") return `1° Medio ${s}`;
      if (nameFormat === "COMPACT") return `1M${s}`;
      return String(101 + i);
    });

    return { basic, middle };
  }, [sectionNaming, sectionCount, nameFormat]);

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await saveCourseConfigAndGenerateCoursesAction({ activeLevels, sectionNaming, sectionCount, nameFormat });
      const res = await getCoursesAdminViewAction();
      setCourses(Array.isArray(res?.courses) ? res.courses : []);
    } catch (e) { setError(e?.message || "No se pudo guardar."); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center gap-3 py-8 text-gray-400 text-sm">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Cargando...
    </div>
  );

  const active   = courses.filter((c) => c.isActive);
  const inactive = courses.filter((c) => !c.isActive);

  return (
    <div className="space-y-8">
      {/* Configuración */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">Configuración de cursos</p>
          <p className="text-xs text-gray-400">
            Define la estructura y el sistema generará los cursos automáticamente.
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Niveles activos */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Niveles activos</p>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {LEVELS.map((l) => {
              const checked = activeLevels.includes(l.code);
              return (
                <label key={l.code} className={`flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl border transition-colors ${
                  checked ? "bg-blue-50 border-blue-200 text-blue-800" : "border-gray-200 text-gray-500"
                }`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setActiveLevels((prev) =>
                      e.target.checked ? [...prev, l.code] : prev.filter((x) => x !== l.code)
                    )}
                    className="shrink-0"
                  />
                  {l.label}
                </label>
              );
            })}
          </div>
        </div>

        {/* Paralelos y formato */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Paralelos</label>
            <Select value={sectionNaming} onValueChange={setSectionNaming}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LETTERS">Letras (A, B, C)</SelectItem>
                <SelectItem value="NUMBERS">Números (1, 2, 3)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Cantidad</label>
            <Input type="number" min={1} max={12} value={sectionCount} onChange={(e) => setSectionCount(Number(e.target.value))} />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">Formato</label>
            <Select value={nameFormat} onValueChange={setNameFormat}>
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHILE_TRADITIONAL">Chile tradicional (7°A / 1° Medio B)</SelectItem>
                <SelectItem value="COMPACT">Compacto (7A / 1MB)</SelectItem>
                <SelectItem value="HUNDREDS">Centenas (101/201...)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Preview</p>
          <p className="text-xs text-gray-600">
            <span className="font-medium">Básica:</span> {preview.basic.join(", ")}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            <span className="font-medium">Media:</span> {preview.middle.join(", ")}
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
          {saving ? "Guardando y generando..." : "Guardar y generar cursos"}
        </Button>
      </div>

      {/* Lista de cursos */}
      {courses.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            Cursos actuales — {active.length} activos · {inactive.length} inactivos
          </p>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-gray-100">
              {courses.map((c) => (
                <div key={c.id} className={`px-4 py-3 text-sm ${c.isActive ? "text-gray-800" : "text-gray-300 line-through"}`}>
                  {c.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}