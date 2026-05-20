"use client";

import { useState, useEffect, useCallback } from "react";

function codeStatus(code) {
  const now = new Date();
  if (code.usedAt) return { label: "Usado", cls: "bg-gray-100 text-gray-600" };
  if (code.expiresAt && new Date(code.expiresAt) < now) return { label: "Expirado", cls: "bg-red-50 text-red-600" };
  if (!code.isActive) return { label: "Inactivo", cls: "bg-orange-50 text-orange-600" };
  return { label: "Activo", cls: "bg-green-50 text-green-700" };
}

function StatusChip({ code }) {
  const { label, cls } = codeStatus(code);
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
  );
}

function GenerateModal({ onClose, onGenerated }) {
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/product-admin/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim() || undefined,
          expiresAt: expiresAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedCode(data.code);
      onGenerated();
    } catch (err) {
      alert("Error al generar código: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900">Generar código de acceso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {generatedCode ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Código generado</p>
            <div className="flex items-center gap-3 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
              <code className="flex-1 text-sm font-mono font-medium text-gray-900 tracking-wide">{generatedCode}</code>
              <button
                onClick={handleCopy}
                className="text-xs font-semibold text-blue-950 hover:text-blue-800 shrink-0"
              >
                {copied ? "Copiado ✓" : "Copiar"}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Comparte este código con la institución. Solo puede usarse una vez.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-medium px-4 py-2.5 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Descripción <span className="normal-case font-normal text-gray-300">(opcional)</span>
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-950/20"
                placeholder="ej: Colegio San Martín"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                Fecha de expiración <span className="normal-case font-normal text-gray-300">(opcional)</span>
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-950/20"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 px-4 py-2.5 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-medium px-4 py-2.5 disabled:opacity-50 transition-colors"
              >
                {loading ? "Generando..." : "Generar código"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const TABS = [
  { id: "codes", label: "Códigos de acceso" },
  { id: "institutions", label: "Instituciones" },
];

export default function ProductAdminClient() {
  const [tab, setTab] = useState("codes");
  const [codes, setCodes] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [loadingInst, setLoadingInst] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchCodes = useCallback(async () => {
    setLoadingCodes(true);
    try {
      const res = await fetch("/api/product-admin/access-codes");
      setCodes(await res.json());
    } finally {
      setLoadingCodes(false);
    }
  }, []);

  const fetchInstitutions = useCallback(async () => {
    setLoadingInst(true);
    try {
      const res = await fetch("/api/product-admin/institutions");
      setInstitutions(await res.json());
    } finally {
      setLoadingInst(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
    fetchInstitutions();
  }, [fetchCodes, fetchInstitutions]);

  async function handleDeactivate(id) {
    if (!confirm("¿Desactivar este código de acceso?")) return;
    await fetch(`/api/product-admin/access-codes/${id}`, { method: "DELETE" });
    fetchCodes();
  }

  return (
    <div className="min-h-screen bg-gray-50 px-12 py-9">
      <div className="max-w-7xl mx-auto space-y-6">

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Panel de producto</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">DUCTU Admin</h1>
        </div>

        <div className="flex gap-1 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "text-blue-950 border-b-2 border-blue-950"
                  : "text-gray-400 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "codes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Códigos de acceso</p>
                <p className="text-xs text-gray-400 mt-0.5">{codes.length} total</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-sm font-medium px-4 py-2.5 transition-colors"
              >
                Generar código
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Código", "Descripción", "Estado", "Institución", "Creado", "Expira", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingCodes ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-400">Cargando...</td>
                    </tr>
                  ) : codes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-xs text-gray-400">Sin códigos generados aún</td>
                    </tr>
                  ) : codes.map((code) => {
                    const canDeactivate = code.isActive && !code.usedAt;
                    return (
                      <tr key={code.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="px-4 py-3">
                          <code className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                            {code.code}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{code.description || "—"}</td>
                        <td className="px-4 py-3"><StatusChip code={code} /></td>
                        <td className="px-4 py-3 text-xs text-gray-400">{code.usedByInstitution?.name || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(code.createdAt)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(code.expiresAt)}</td>
                        <td className="px-4 py-3 text-right">
                          {canDeactivate && (
                            <button
                              onClick={() => handleDeactivate(code.id)}
                              className="text-xs font-medium text-red-500 hover:text-red-700"
                            >
                              Desactivar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "institutions" && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Instituciones registradas</p>
              <p className="text-xs text-gray-400 mt-0.5">{institutions.length} total</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Nombre", "Usuarios", "Registrada"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loadingInst ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-xs text-gray-400">Cargando...</td>
                    </tr>
                  ) : institutions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-xs text-gray-400">Sin instituciones registradas</td>
                    </tr>
                  ) : institutions.map((inst) => (
                    <tr key={inst.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-gray-900">{inst.name}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{inst._count?.appUsers ?? 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(inst.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <GenerateModal
          onClose={() => setShowModal(false)}
          onGenerated={fetchCodes}
        />
      )}
    </div>
  );
}
