// app/dashboard/settings/components/AcademicYearsTab.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AcademicYearsTab({ showPeriodsOnly = false, onGoToPeriods }) {
  const [years, setYears]       = useState([]);
  const [policy, setPolicy]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Modal año
  const [yearModal, setYearModal]   = useState(false);
  const [newYear, setNewYear]       = useState(new Date().getFullYear() + 1);
  const [newYearName, setNewYearName] = useState("");
  const [savingYear, setSavingYear] = useState(false);

  // Modal período
  const [periodModal, setPeriodModal]   = useState(false);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [periodName, setPeriodName]     = useState("");
  const [periodNumber, setPeriodNumber] = useState(1);
  const [periodStart, setPeriodStart]   = useState("");
  const [periodEnd, setPeriodEnd]       = useState("");
  const [savingPeriod, setSavingPeriod] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/academic-years");
      const data = await res.json();
      setYears(data.years ?? []);
      setPolicy(data.policy ?? null);
    } catch { setError("No se pudieron cargar los años académicos."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreateYear = async () => {
    setSavingYear(true);
    try {
      const res = await fetch("/api/admin/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: newYear, name: newYearName || `Año ${newYear}` }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await load();
      setYearModal(false);
      setNewYearName("");
    } finally { setSavingYear(false); }
  };

  const handleSetActive = async (id) => {
    if (!confirm("¿Activar este año académico? El año activo anterior quedará como histórico.")) return;
    await fetch(`/api/admin/academic-years/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setActive: true }),
    });
    await load();
  };

  const handleCreatePeriod = async () => {
    setSavingPeriod(true);
    try {
      const res = await fetch("/api/admin/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          academicYearId: selectedYearId,
          name: periodName,
          periodNumber,
          startDate: periodStart || null,
          endDate: periodEnd || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await load();
      setPeriodModal(false);
      setPeriodName(""); setPeriodNumber(1); setPeriodStart(""); setPeriodEnd("");
    } finally { setSavingPeriod(false); }
  };

  const handleTogglePeriod = async (periodId, isActive) => {
    await fetch(`/api/admin/periods/${periodId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  };

  const handleDeletePeriod = async (periodId) => {
    if (!confirm("¿Eliminar este período? Se perderán las notas asociadas.")) return;
    await fetch(`/api/admin/periods/${periodId}`, { method: "DELETE" });
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8 text-gray-400 text-sm">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        Cargando...
      </div>
    );
  }

  const activeYear = years.find((y) => y.id === policy?.activeAcademicYearId);

  return (
    <div className="space-y-8">

      {/* Año académico activo */}
      {!showPeriodsOnly && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Año académico</p>
              <p className="text-xs text-gray-400 mt-0.5">El año activo es el que usan todas las funcionalidades del sistema</p>
            </div>
            <Button onClick={() => setYearModal(true)} className="bg-blue-950 hover:bg-blue-900 text-sm">
              + Nuevo año
            </Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {years.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
              <p className="text-3xl mb-3">📅</p>
              <p className="text-sm font-semibold text-gray-700">Sin años académicos</p>
              <p className="text-xs text-gray-400 mt-1">Crea el primer año académico para comenzar.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {years.map((year) => {
                const isActive = year.id === policy?.activeAcademicYearId;
                return (
                  <div key={year.id} className={`flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0 ${isActive ? "bg-blue-50" : ""}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{year.name}</p>
                        {isActive && (
                          <span className="text-xs font-medium bg-blue-950 text-white px-2 py-0.5 rounded-full">Activo</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {year.periods.length} período{year.periods.length !== 1 ? "s" : ""} configurado{year.periods.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!isActive && (
                        <Button variant="outline" onClick={() => handleSetActive(year.id)} className="text-xs h-8">
                          Activar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Períodos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Períodos académicos</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeYear
                ? `Períodos del año activo: ${activeYear.name}`
                : "Activa un año académico para gestionar sus períodos"}
            </p>
          </div>
          {activeYear && (
            <Button
              onClick={() => { setSelectedYearId(activeYear.id); setPeriodModal(true); }}
              className="bg-blue-950 hover:bg-blue-900 text-sm"
            >
              + Nuevo período
            </Button>
          )}
        </div>

        {!activeYear ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
            <p className="text-3xl mb-3">⏳</p>
            <p className="text-sm font-semibold text-gray-700">Sin año activo</p>
            <p className="text-xs text-gray-400 mt-1">
              {!showPeriodsOnly
                ? "Activa un año académico arriba para gestionar sus períodos."
                : "Ve a la pestaña Año académico y activa uno."}
            </p>
          </div>
        ) : activeYear.periods.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-sm font-semibold text-gray-700">Sin períodos</p>
            <p className="text-xs text-gray-400 mt-1">Crea los períodos del año activo (ej: Semestre 1, Semestre 2)</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {activeYear.periods.map((period) => (
              <div key={period.id} className={`flex items-center gap-4 px-6 py-4 border-b border-gray-100 last:border-0 ${period.isActive ? "bg-green-50" : ""}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{period.name}</p>
                    {period.isActive && (
                      <span className="text-xs font-medium bg-green-600 text-white px-2 py-0.5 rounded-full">Activo</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Período {period.periodNumber}
                    {period.startDate && ` · ${new Date(period.startDate).toLocaleDateString("es-CL")}`}
                    {period.endDate && ` – ${new Date(period.endDate).toLocaleDateString("es-CL")}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTogglePeriod(period.id, period.isActive)}
                    className={`text-xs h-8 ${period.isActive ? "text-orange-600 border-orange-200 hover:bg-orange-50" : "text-green-600 border-green-200 hover:bg-green-50"}`}
                  >
                    {period.isActive ? "Desactivar" : "Activar"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeletePeriod(period.id)}
                    className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal año */}
      <Dialog open={yearModal} onOpenChange={(v) => { if (!v) setYearModal(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nuevo año académico</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Año *</label>
              <Input type="number" value={newYear} onChange={(e) => setNewYear(e.target.value)} placeholder="2025" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Nombre (opcional)</label>
              <Input value={newYearName} onChange={(e) => setNewYearName(e.target.value)} placeholder={`Año ${newYear}`} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setYearModal(false)} disabled={savingYear}>Cancelar</Button>
            <Button onClick={handleCreateYear} disabled={savingYear} className="bg-blue-950 hover:bg-blue-900">
              {savingYear ? "Creando..." : "Crear año"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal período */}
      <Dialog open={periodModal} onOpenChange={(v) => { if (!v) setPeriodModal(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nuevo período</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Nombre *</label>
              <Input value={periodName} onChange={(e) => setPeriodName(e.target.value)} placeholder="Ej: Semestre 1, Trimestre 1" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">Número de período *</label>
              <Input type="number" min="1" value={periodNumber} onChange={(e) => setPeriodNumber(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Fecha inicio</label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">Fecha fin</label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPeriodModal(false)} disabled={savingPeriod}>Cancelar</Button>
            <Button onClick={handleCreatePeriod} disabled={savingPeriod} className="bg-blue-950 hover:bg-blue-900">
              {savingPeriod ? "Creando..." : "Crear período"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}