// app/dashboard/grades/components/ImportGradesModal.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// step: "upload" | "preview" | "sending" | "success" | "result"

const CATEGORY_LABELS = {
  EXAM:          "Examen / Prueba",
  HOMEWORK:      "Tarea / Trabajo",
  PROJECT:       "Proyecto",
  PARTICIPATION: "Participación",
  OTHER:         "Otro",
};

export default function ImportGradesModal({
  open,
  onClose,
  assignmentId,
  periodId,
  assignmentLabel,
  onImported,
}) {
  const fileInputRef          = useRef(null);
  const [file, setFile]       = useState(null);
  const [step, setStep]       = useState("upload");
  const [preview, setPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-avanzar de "success" → "result" tras 1.8 s
  useEffect(() => {
    if (step !== "success") return;
    const t = setTimeout(() => setStep("result"), 1800);
    return () => clearTimeout(t);
  }, [step]);

  const reset = () => {
    setFile(null);
    setStep("upload");
    setPreview(null);
    setResult(null);
    setError("");
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => { reset(); onClose(); };

  const handleDownloadTemplate = () => {
    window.open(`/api/grades/template?assignmentId=${assignmentId}`, "_blank");
  };

  const handleFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    setLoading(true);
    try {
      const { parseGradesExcel } = await import("@/lib/import/gradesParser");
      const parsed = await parseGradesExcel(f);
      setPreview(parsed);
      setStep("preview");
    } catch (e) {
      setError(e?.message ?? "Error leyendo el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file || !assignmentId || !periodId) return;
    setError("");
    setStep("sending");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignmentId);
      formData.append("periodId", periodId);

      const res  = await fetch("/api/grades/import", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error importando notas.");
        setStep("preview");
        return;
      }

      setResult(data);
      if (data.imported > 0) onImported?.();
      setStep("success");
    } catch {
      setError("Error de red.");
      setStep("preview");
    }
  };

  const canImport = step === "preview" && (preview?.validRows?.length ?? 0) > 0 && !loading;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-lg">

        {/* ── Encabezado (oculto durante animaciones) ── */}
        {step !== "sending" && step !== "success" && (
          <DialogHeader>
            <DialogTitle>Importar notas masivamente</DialogTitle>
            {assignmentLabel && (
              <p className="text-xs text-gray-400 mt-1">{assignmentLabel}</p>
            )}
          </DialogHeader>
        )}

        {/* ── Animación de carga ── */}
        {step === "sending" && (
          <div className="flex flex-col items-center justify-center py-10 gap-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-950 animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-gray-800">Importando notas…</p>
              <p className="text-xs text-gray-500">
                Procesando {preview?.validRows?.length ?? 0} notas. Por favor espera.
              </p>
            </div>
          </div>
        )}

        {/* ── Animación de éxito ── */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-10 gap-5">
            <div
              className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"
              style={{ animation: "successPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both" }}
            >
              <span className="icon-[lucide--check] text-green-600 text-3xl" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-gray-800">
                ¡{result?.imported ?? 0} nota{result?.imported !== 1 ? "s" : ""} importada{result?.imported !== 1 ? "s" : ""}!
              </p>
              <p className="text-xs text-gray-500">Preparando el resumen…</p>
            </div>
            <style>{`
              @keyframes successPop {
                0%   { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* ── STEP: UPLOAD ── */}
        {step === "upload" && (
          <div className="space-y-4 py-2">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-blue-800">¿Cómo funciona?</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Descarga el template — ya incluye los alumnos del curso</li>
                <li>Llena la columna <strong>nota</strong> y el <strong>título</strong> de la evaluación</li>
                <li>Sube el archivo para importar</li>
              </ol>
            </div>

            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full border-dashed border-2 border-blue-200 text-blue-700 hover:bg-blue-50 h-12"
            >
              <span className="icon-[lucide--download] text-base mr-2" />
              Descargar template Excel (con alumnos)
            </Button>

            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-3xl mb-2">📂</p>
              <p className="text-sm font-medium text-gray-700">
                {loading ? "Leyendo archivo..." : "Haz click para seleccionar el archivo"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Solo archivos .xlsx</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleFileChange}
            />

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── STEP: PREVIEW ── */}
        {step === "preview" && preview && (
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{preview.total}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total filas</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-700">{preview.validRows.length}</p>
                <p className="text-xs text-green-600 mt-0.5">Válidas</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${preview.errors.length > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <p className={`text-xl font-bold ${preview.errors.length > 0 ? "text-red-600" : "text-gray-400"}`}>
                  {preview.errors.length}
                </p>
                <p className={`text-xs mt-0.5 ${preview.errors.length > 0 ? "text-red-500" : "text-gray-400"}`}>
                  Errores
                </p>
              </div>
            </div>

            {preview.validRows.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                  Vista previa — {preview.validRows.length} notas a importar
                </p>
                <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 font-semibold text-gray-400">Email</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-400">Evaluación</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-400">Nota</th>
                        <th className="text-left px-3 py-2 font-semibold text-gray-400">Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.validRows.map((row, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-3 py-2 text-gray-600 truncate max-w-[120px]">{row.email}</td>
                          <td className="px-3 py-2 text-gray-700 font-medium truncate max-w-[100px]">{row.titulo}</td>
                          <td className="px-3 py-2 font-bold text-blue-700">{row.nota}</td>
                          <td className="px-3 py-2 text-gray-400">{CATEGORY_LABELS[row.categoria] ?? row.categoria}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {preview.errors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-2">
                  Errores encontrados
                </p>
                <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-100 rounded-xl p-3 space-y-1.5">
                  {preview.errors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-400 text-xs shrink-0">Fila {e.row}:</span>
                      <span className="text-xs text-red-700">{e.message}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Las filas con errores serán ignoradas. Solo se importarán las {preview.validRows.length} filas válidas.
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── STEP: RESULT ── */}
        {step === "result" && result && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-green-700">{result.imported}</p>
                <p className="text-xs text-green-600 mt-0.5">Importadas</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-yellow-700">{result.skipped}</p>
                <p className="text-xs text-yellow-600 mt-0.5">Omitidas</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${result.errors?.length > 0 ? "bg-red-50" : "bg-gray-50"}`}>
                <p className={`text-xl font-bold ${result.errors?.length > 0 ? "text-red-600" : "text-gray-400"}`}>
                  {result.errors?.length ?? 0}
                </p>
                <p className={`text-xs mt-0.5 ${result.errors?.length > 0 ? "text-red-500" : "text-gray-400"}`}>
                  Errores
                </p>
              </div>
            </div>

            {result.skipped > 0 && result.skippedDetails?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-yellow-700 mb-2">Notas omitidas (ya existían):</p>
                <div className="space-y-1">
                  {result.skippedDetails.slice(0, 5).map((s, i) => (
                    <p key={i} className="text-xs text-yellow-600">{s.email} — {s.message}</p>
                  ))}
                  {result.skippedDetails.length > 5 && (
                    <p className="text-xs text-yellow-500">+{result.skippedDetails.length - 5} más</p>
                  )}
                </div>
              </div>
            )}

            {result.errors?.length > 0 && (
              <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-100 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-red-500 mb-1">Errores del servidor:</p>
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-red-400 text-xs shrink-0">{e.email}:</span>
                    <span className="text-xs text-red-700">{e.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Footer (oculto durante animaciones) ── */}
        {step !== "sending" && step !== "success" && (
          <DialogFooter>
            {step === "upload" && (
              <Button variant="ghost" onClick={handleClose}>Cancelar</Button>
            )}

            {step === "preview" && (
              <>
                <Button variant="ghost" onClick={reset} disabled={loading}>← Volver</Button>
                <Button
                  onClick={handleImport}
                  disabled={!canImport}
                  className="bg-blue-950 hover:bg-blue-900"
                >
                  Importar {preview?.validRows?.length ?? 0} notas
                </Button>
              </>
            )}

            {step === "result" && (
              <Button onClick={handleClose} className="bg-blue-950 hover:bg-blue-900">
                Cerrar
              </Button>
            )}
          </DialogFooter>
        )}

      </DialogContent>
    </Dialog>
  );
}
