// components/ImportUsersModal.jsx
"use client";

import { useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseBulkInvitesExcel } from "@/lib/import/bulkInviteParser";

export default function ImportUsersModal({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("pick"); // "pick" | "preview" | "done"
  const [preview, setPreview] = useState(null);
  const [parseError, setParseError] = useState("");
  const [uploadResult, setUploadResult] = useState(null);

  const fileName = useMemo(() => file?.name ?? "", [file]);

  const reset = () => {
    setFile(null);
    setStep("pick");
    setPreview(null);
    setParseError("");
    setUploadResult(null);
  };

  const handlePick = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(null);
    setParseError("");
    setStep("pick");
  };

  function handleDownloadTemplate() {
    const link = document.createElement("a");
    link.href = "/templates/invitaciones-bulk-template.xlsx";
    link.download = "invitaciones-bulk-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleValidate = async () => {
    if (!file) return;
    setLoading(true);
    setParseError("");
    setPreview(null);

    try {
      const result = await parseBulkInvitesExcel(file);
      setPreview(result);
      setStep("preview");
    } catch (e) {
      setParseError(e?.message || "No se pudo leer el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!preview?.validRows?.length) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/invitations/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview.validRows }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message ?? `Error ${res.status}`);
      }

      setUploadResult(data);
      setStep("done");
      await onImport?.(data);
    } catch (e) {
      setParseError(e?.message ?? "No se pudo subir el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = (preview?.errors?.length ?? 0) > 0;
  const hasValidRows = (preview?.validRows?.length ?? 0) > 0;
  const canUpload = step === "preview" && !hasErrors && hasValidRows && !loading;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose?.(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar usuarios por Excel</DialogTitle>
          <DialogDescription>
            Descarga el template, complétalo y sube el archivo. Las invitaciones se enviarán por email automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* Paso 1: template + selector */}
          {step !== "done" && (
            <>
              <div className="rounded-lg border p-3 bg-white flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Template Excel</p>
                  <p className="text-xs text-muted-foreground">Descárgalo para evitar errores de formato.</p>
                </div>
                <Button variant="outline" onClick={handleDownloadTemplate}>Descargar</Button>
              </div>

              <div className="space-y-2">
                <Label>Archivo Excel (.xlsx)</Label>
                <Input type="file" accept=".xlsx" onChange={handlePick} disabled={loading} />
                {fileName && <p className="text-xs text-muted-foreground">Seleccionado: {fileName}</p>}
              </div>

              {/* Columnas esperadas */}
              <div className="rounded-lg border bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                <p className="font-medium text-sm text-gray-700 mb-1">Columnas esperadas</p>
                <p><span className="font-medium">Todos:</span> email, rol, enviar invitación (S/N)</p>
                <p><span className="font-medium">Administrativo:</span> cargo</p>
                <p><span className="font-medium">Estudiante:</span> curso (ej: 7B, 1MA)</p>
                <p><span className="font-medium">Docente:</span> cursos del profe (separados por coma), curso jefatura (opcional)</p>
              </div>
            </>
          )}

          {/* Error de parseo */}
          {parseError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {parseError}
            </div>
          )}

          {/* Paso 2: preview */}
          {step === "preview" && preview && (
            <div className="rounded-lg border p-3 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Resultado de validación</p>
                <p className="text-xs text-muted-foreground">Hoja: {preview.sheetName}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded border bg-gray-50 p-2">
                  <p className="text-xs text-muted-foreground">Total filas</p>
                  <p className="font-semibold">{preview.total}</p>
                </div>
                <div className="rounded border bg-green-50 p-2">
                  <p className="text-xs text-muted-foreground">Válidas</p>
                  <p className="font-semibold text-green-700">{preview.validRows?.length ?? 0}</p>
                </div>
                <div className={`rounded border p-2 ${hasErrors ? "bg-red-50" : "bg-gray-50"}`}>
                  <p className="text-xs text-muted-foreground">Con errores</p>
                  <p className={`font-semibold ${hasErrors ? "text-red-700" : ""}`}>{preview.errors?.length ?? 0}</p>
                </div>
              </div>

              {hasErrors ? (
                <div className="max-h-40 overflow-auto rounded border bg-red-50 p-2 text-xs text-red-700 space-y-1">
                  <p className="font-medium mb-1">Errores a corregir:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {preview.errors.slice(0, 50).map((e, i) => (
                      <li key={i}>Fila {e.row} ({e.email}): {e.message}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded border bg-green-50 p-2 text-xs text-green-700">
                  ✅ Archivo válido. Se enviarán <strong>{preview.validRows.length}</strong> invitaciones por email al confirmar.
                </div>
              )}
            </div>
          )}

          {/* Paso 3: resultado del upload */}
          {step === "done" && uploadResult && (
            <div className="rounded-lg border p-4 bg-white space-y-3">
              <p className="text-sm font-medium">Proceso completado</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded border bg-green-50 p-2">
                  <p className="text-xs text-muted-foreground">Invitaciones creadas</p>
                  <p className="font-semibold text-green-700">{uploadResult.created}</p>
                </div>
                <div className="rounded border bg-gray-50 p-2">
                  <p className="text-xs text-muted-foreground">Omitidos</p>
                  <p className="font-semibold">{uploadResult.skipped}</p>
                </div>
                <div className={`rounded border p-2 ${uploadResult.errors?.length ? "bg-red-50" : "bg-gray-50"}`}>
                  <p className="text-xs text-muted-foreground">Errores</p>
                  <p className={`font-semibold ${uploadResult.errors?.length ? "text-red-700" : ""}`}>
                    {uploadResult.errors?.length ?? 0}
                  </p>
                </div>
              </div>

              {uploadResult.errors?.length > 0 && (
                <div className="max-h-40 overflow-auto rounded border bg-red-50 p-2 text-xs text-red-700 space-y-1">
                  <p className="font-medium mb-1">Filas con error en el servidor:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {uploadResult.errors.map((e, i) => (
                      <li key={i}>Fila {e.row} ({e.email}): {e.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "done" ? (
            <Button onClick={() => { reset(); onClose?.(); }}>Cerrar</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => { reset(); onClose?.(); }} disabled={loading}>Cancelar</Button>

              {step === "pick" && (
                <Button variant="outline" onClick={handleValidate} disabled={!file || loading}>
                  {loading ? "Validando..." : "Validar archivo"}
                </Button>
              )}

              {step === "preview" && (
                <>
                  <Button variant="outline" onClick={() => setStep("pick")} disabled={loading}>
                    Cambiar archivo
                  </Button>
                  <Button onClick={handleUpload} disabled={!canUpload}>
                    {loading ? "Enviando invitaciones..." : `Confirmar y enviar (${preview?.validRows?.length ?? 0})`}
                  </Button>
                </>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}