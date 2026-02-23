"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ✅ Tu parser (ajusta el path real)
import { parseBulkInvitesExcel } from "@/lib/import/bulkInviteParser";

const TEMPLATE_PUBLIC_URL =
  "/templates/DUCTU_Bulk_Invitations_Template_ready.xlsx";

export default function ImportUsersModal({ open, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // preview state
  const [preview, setPreview] = useState(null); // { sheetName, total, validRows, errors }
  const [parseError, setParseError] = useState("");

  const fileName = useMemo(() => file?.name ?? "", [file]);

  const handlePick = (e) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);

    // reset preview al cambiar archivo
    setPreview(null);
    setParseError("");
  };

  const handleDownloadTemplate = () => {
    // ✅ descarga real desde /public
    window.open(TEMPLATE_PUBLIC_URL, "_blank", "noopener,noreferrer");
  };

  const handleValidate = async () => {
    if (!file) return;

    setLoading(true);
    setParseError("");
    setPreview(null);

    try {
      const result = await parseBulkInvitesExcel(file);
      setPreview(result);
    } catch (e) {
      setParseError(e?.message || "No se pudo leer el archivo.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setParseError("");
  };

  // Paso siguiente (aún no ejecuta bulk real, solo deja el “hook”)
const handleUpload = async () => {
  if (!file) return;

  // obliga validar primero
  if (!preview) {
    await handleValidate();
    return;
  }

  if (preview.errors?.length) {
    alert("Hay errores en el Excel. Corrígelos antes de continuar.");
    return;
  }

  const rows = preview.validRows || [];
  if (!rows.length) {
    alert("No hay filas válidas para procesar.");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("/api/admin/invitations/bulk", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });

    if (!res.ok) {
      let msg = `No se pudo procesar (${res.status})`;
      try {
        const data = await res.json();
        msg = data?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    const data = await res.json(); // { ok, created, skipped, errors }

    // si el backend devolvió errores por filas, muéstralos en el preview
    if (data?.errors?.length) {
      setPreview((p) => ({
        ...(p || {}),
        serverResult: data,
        errors: data.errors, // opcional: mezclarlos con los de parser
      }));
      alert("Se procesó, pero hubo errores. Revisa la lista.");
      return;
    }

    await onImport?.(data); // opcional: para que el padre haga mutate
    handleReset();
    onClose?.();
  } catch (e) {
    alert(e?.message || "No se pudo subir el archivo.");
  } finally {
    setLoading(false);
  }
};

  const canValidate = !!file && !loading;
  const canContinue =
    !!file &&
    !!preview &&
    !loading &&
    (preview.errors?.length || 0) === 0 &&
    (preview.validRows?.length || 0) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          // al cerrar: limpia estado
          handleReset();
          onClose?.();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar usuarios por Excel</DialogTitle>
          <DialogDescription>
            Descarga el template, completa los usuarios y luego sube el archivo
            para crear invitaciones en bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template */}
          <div className="rounded-lg border p-3 bg-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Template</p>
                <p className="text-xs text-muted-foreground">
                  Recomendado para evitar errores de formato.
                </p>
              </div>
              <Button variant="outline" onClick={handleDownloadTemplate}>
                Descargar template
              </Button>
            </div>
          </div>

          {/* File picker */}
          <div className="space-y-2">
            <Label>Archivo Excel</Label>
            <Input
              type="file"
              accept=".xlsx"
              onChange={handlePick}
              disabled={loading}
            />
            {fileName ? (
              <p className="text-xs text-muted-foreground">
                Seleccionado: {fileName}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Formato permitido: .xlsx
              </p>
            )}
          </div>

          {/* Columnas esperadas */}
          <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-700">
            <p className="font-medium mb-1">Columnas esperadas (resumen)</p>
            <ul className="list-disc list-inside space-y-1">
              <li>email (requerido)</li>
              <li>rol (Administrativo | Docente | Estudiante)</li>
              <li>cargo (solo Administrativo)</li>
              <li>curso (Estudiante)</li>
              <li>cursos del profe (solo Docente, separados por coma o ;)</li>
              <li>curso jefatura (opcional, solo Docente)</li>
              <li>enviar invitación (S/N)</li>
            </ul>
          </div>

          {/* Parse errors */}
          {parseError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {parseError}
            </div>
          ) : null}

          {/* Preview */}
          {preview ? (
            <div className="rounded-lg border p-3 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Previsualización</p>
                <p className="text-xs text-muted-foreground">
                  Hoja: {preview.sheetName}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded border bg-gray-50 p-2">
                  <p className="text-xs text-muted-foreground">Filas</p>
                  <p className="font-semibold">{preview.total}</p>
                </div>
                <div className="rounded border bg-gray-50 p-2">
                  <p className="text-xs text-muted-foreground">Válidas</p>
                  <p className="font-semibold">
                    {preview.validRows?.length || 0}
                  </p>
                </div>
                <div className="rounded border bg-gray-50 p-2">
                  <p className="text-xs text-muted-foreground">Errores</p>
                  <p className="font-semibold">{preview.errors?.length || 0}</p>
                </div>
              </div>

              {preview.errors?.length ? (
                <div className="mt-2 max-h-40 overflow-auto rounded border bg-red-50 p-2 text-xs text-red-700">
                  <p className="font-medium mb-1">Errores (primeros 50):</p>
                  <ul className="list-disc list-inside space-y-1">
                    {preview.errors.slice(0, 50).map((e, idx) => (
                      <li key={`${e.row}-${idx}`}>
                        Fila {e.row} ({e.email}): {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="mt-2 rounded border bg-green-50 p-2 text-xs text-green-700">
                  Archivo válido ✅ Puedes continuar.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>

          <Button variant="outline" onClick={handleValidate} disabled={!canValidate}>
            {loading ? "Validando..." : "Validar archivo"}
          </Button>

          <Button onClick={handleUpload} disabled={!file || loading || !canContinue}>
            {loading ? "Procesando..." : "Subir archivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}