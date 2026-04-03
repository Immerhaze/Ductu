// app/dashboard/settings/components/InstitutionTab.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InstitutionTab() {
  const [name, setName]       = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        setName(data?.institution?.name ?? "");
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { setError("El nombre es requerido."); return; }
    setSaving(true); setError(""); setSuccess(false);
    try {
      const res = await fetch("/api/admin/institution", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) { setError("No se pudo guardar."); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center gap-3 py-8 text-gray-400 text-sm">
      <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      Cargando...
    </div>
  );

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-1">Información institucional</p>
        <p className="text-xs text-gray-400">Datos básicos de tu institución</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium mb-1.5 block">Nombre del colegio *</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Colegio San Martín" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">✅ Guardado correctamente</p>}

        <Button onClick={handleSave} disabled={saving} className="bg-blue-950 hover:bg-blue-900">
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  );
}