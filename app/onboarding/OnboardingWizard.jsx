"use client";

import { useMemo, useState } from "react";

const LEVEL_OPTIONS = [
  { code: "B1", label: "1° Básico" },
  { code: "B2", label: "2° Básico" },
  { code: "B3", label: "3° Básico" },
  { code: "B4", label: "4° Básico" },
  { code: "B5", label: "5° Básico" },
  { code: "B6", label: "6° Básico" },
  { code: "B7", label: "7° Básico" },
  { code: "B8", label: "8° Básico" },
  { code: "M1", label: "1° Medio" },
  { code: "M2", label: "2° Medio" },
  { code: "M3", label: "3° Medio" },
  { code: "M4", label: "4° Medio" },
];

const STEP_TITLES = [
  "Institución",
  "Administrador principal",
  "Estructura de cursos",
  "Política académica",
  "Año académico",
  "Asignaturas",
  "Revisión final",
];

export default function OnboardingWizard({ action, initialData }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);

  const totalSteps = STEP_TITLES.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const payload = useMemo(() => JSON.stringify(data), [data]);

  function updateSection(section, values) {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values,
      },
    }));
  }

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 0));
  }

  function toggleLevel(levelCode) {
    setData((prev) => {
      const exists = prev.courseConfig.activeLevels.includes(levelCode);
      return {
        ...prev,
        courseConfig: {
          ...prev.courseConfig,
          activeLevels: exists
            ? prev.courseConfig.activeLevels.filter((code) => code !== levelCode)
            : [...prev.courseConfig.activeLevels, levelCode],
        },
      };
    });
  }

  function updateSubject(index, key, value) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) =>
        i === index ? { ...subject, [key]: value } : subject
      ),
    }));
  }

  function addSubject() {
    setData((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", code: "" }],
    }));
  }

  function removeSubject(index) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  }

  function canContinue() {
    if (step === 0) {
      return Boolean(data.institution.name.trim());
    }

    if (step === 1) {
      return Boolean(data.superAdmin.fullName.trim() && data.superAdmin.email.trim());
    }

    if (step === 2) {
      return data.courseConfig.activeLevels.length > 0;
    }

    if (step === 3) {
      return Boolean(
        data.academicPolicy.academicRegime &&
        data.academicPolicy.gradingScaleMin !== "" &&
        data.academicPolicy.gradingScaleMax !== "" &&
        data.academicPolicy.passingGrade !== ""
      );
    }

    if (step === 4) {
      return Boolean(
        data.academicYear.year &&
        data.academicYear.startDate &&
        data.academicYear.endDate
      );
    }

    if (step === 5) {
      return data.subjects.some((subject) => subject.name.trim());
    }

    return true;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-10">
      <div className="w-full rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Paso {step + 1} de {totalSteps}
            </p>
            <p className="text-sm font-medium text-slate-700">
              {STEP_TITLES[step]}
            </p>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form action={action} className="p-6 md:p-8">
          <input type="hidden" name="payload" value={payload} />

          {step === 0 && (
            <section className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Empecemos por tu institución
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Configuraremos la base académica de tu colegio paso a paso.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nombre de la institución
                </label>
                <input
                  value={data.institution.name}
                  onChange={(e) =>
                    updateSection("institution", { name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Colegio San Martín"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email de contacto institucional
                </label>
                <input
                  type="email"
                  value={data.institution.contactEmail}
                  onChange={(e) =>
                    updateSection("institution", { contactEmail: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="contacto@colegio.cl"
                />
              </div>
            </section>
          )}

          {step === 1 && (
            <section className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Ahora definamos el administrador principal
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Esta persona será el superadministrador inicial de la institución.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nombre completo
                </label>
                <input
                  value={data.superAdmin.fullName}
                  onChange={(e) =>
                    updateSection("superAdmin", { fullName: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Nombre y apellido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email de acceso
                </label>
                <input
                  type="email"
                  value={data.superAdmin.email}
                  onChange={(e) =>
                    updateSection("superAdmin", { email: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="admin@institucion.cl"
                />
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Estructura de cursos
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Selecciona los niveles que actualmente imparte tu institución.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {LEVEL_OPTIONS.map((level) => {
                  const selected = data.courseConfig.activeLevels.includes(level.code);

                  return (
                    <button
                      key={level.code}
                      type="button"
                      onClick={() => toggleLevel(level.code)}
                      className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Tipo de paralelo
                  </label>
                  <select
                    value={data.courseConfig.sectionNaming}
                    onChange={(e) =>
                      updateSection("courseConfig", {
                        sectionNaming: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="LETTERS">Letras (A, B, C)</option>
                    <option value="NUMBERS">Números (1, 2, 3)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Cantidad de paralelos por nivel
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={data.courseConfig.sectionCount}
                    onChange={(e) =>
                      updateSection("courseConfig", {
                        sectionCount: Number(e.target.value || 1),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Formato de nombre
                  </label>
                  <select
                    value={data.courseConfig.nameFormat}
                    onChange={(e) =>
                      updateSection("courseConfig", {
                        nameFormat: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="CHILE_TRADITIONAL">Chile tradicional</option>
                    <option value="COMPACT">Compacto</option>
                    <option value="HUNDREDS">Centenas</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Política académica base
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Dejaremos una configuración inicial compatible con Chile, pero editable más adelante.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Régimen académico
                  </label>
                  <select
                    value={data.academicPolicy.academicRegime}
                    onChange={(e) =>
                      updateSection("academicPolicy", {
                        academicRegime: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="SEMESTER">Semestral</option>
                    <option value="TRIMESTER">Trimestral</option>
                    <option value="QUARTER">Cuatrimestral / por períodos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Decimales en notas
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    value={data.academicPolicy.gradeDecimals}
                    onChange={(e) =>
                      updateSection("academicPolicy", {
                        gradeDecimals: Number(e.target.value || 1),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nota mínima
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.academicPolicy.gradingScaleMin}
                    onChange={(e) =>
                      updateSection("academicPolicy", {
                        gradingScaleMin: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nota máxima
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.academicPolicy.gradingScaleMax}
                    onChange={(e) =>
                      updateSection("academicPolicy", {
                        gradingScaleMax: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Nota mínima de aprobación
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={data.academicPolicy.passingGrade}
                    onChange={(e) =>
                      updateSection("academicPolicy", {
                        passingGrade: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Asistencia mínima (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={data.academicPolicy.minimumAttendancePercent}
                    onChange={(e) =>
                      updateSection("academicPolicy", {
                        minimumAttendancePercent: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={data.academicPolicy.useAttendanceForPromotion}
                  onChange={(e) =>
                    updateSection("academicPolicy", {
                      useAttendanceForPromotion: e.target.checked,
                    })
                  }
                />
                Considerar asistencia en la promoción académica
              </label>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Año académico inicial
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Este será el año académico activo al terminar el onboarding.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Año
                  </label>
                  <input
                    type="number"
                    value={data.academicYear.year}
                    onChange={(e) =>
                      updateSection("academicYear", {
                        year: Number(e.target.value),
                        name: `Año Académico ${e.target.value}`,
                      })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Nombre visible
                  </label>
                  <input
                    value={data.academicYear.name}
                    onChange={(e) =>
                      updateSection("academicYear", { name: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={data.academicYear.startDate}
                    onChange={(e) =>
                      updateSection("academicYear", { startDate: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Fecha de término
                  </label>
                  <input
                    type="date"
                    value={data.academicYear.endDate}
                    onChange={(e) =>
                      updateSection("academicYear", { endDate: e.target.value })
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Asignaturas iniciales
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Puedes dejar la base sugerida y luego ajustarla en configuración.
                </p>
              </div>

              <div className="space-y-3">
                {data.subjects.map((subject, index) => (
                  <div key={index} className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-[1fr_140px_auto]">
                    <input
                      value={subject.name}
                      onChange={(e) => updateSubject(index, "name", e.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Nombre de la asignatura"
                    />
                    <input
                      value={subject.code || ""}
                      onChange={(e) => updateSubject(index, "code", e.target.value)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Código"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addSubject}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Agregar asignatura
              </button>
            </section>
          )}

          {step === 6 && (
            <section className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Revisión final
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Esto es lo que se creará al terminar el onboarding.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SummaryCard
                  title="Institución"
                  rows={[
                    ["Nombre", data.institution.name || "—"],
                    ["Email contacto", data.institution.contactEmail || data.superAdmin.email || "—"],
                  ]}
                />

                <SummaryCard
                  title="Administrador principal"
                  rows={[
                    ["Nombre", data.superAdmin.fullName || "—"],
                    ["Email", data.superAdmin.email || "—"],
                  ]}
                />

                <SummaryCard
                  title="Estructura"
                  rows={[
                    ["Niveles activos", data.courseConfig.activeLevels.length],
                    ["Paralelos", `${data.courseConfig.sectionCount} por nivel`],
                    ["Nombrado", data.courseConfig.nameFormat],
                  ]}
                />

                <SummaryCard
                  title="Política académica"
                  rows={[
                    ["Régimen", data.academicPolicy.academicRegime],
                    ["Escala", `${data.academicPolicy.gradingScaleMin} a ${data.academicPolicy.gradingScaleMax}`],
                    ["Aprobación", data.academicPolicy.passingGrade],
                  ]}
                />

                <SummaryCard
                  title="Año académico"
                  rows={[
                    ["Nombre", data.academicYear.name || "—"],
                    ["Inicio", data.academicYear.startDate || "—"],
                    ["Término", data.academicYear.endDate || "—"],
                  ]}
                />

                <SummaryCard
                  title="Asignaturas"
                  rows={[
                    ["Cantidad inicial", data.subjects.filter((s) => s.name.trim()).length],
                  ]}
                />
              </div>
            </section>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 0}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Volver
            </button>

            {step < totalSteps - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canContinue()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar
              </button>
            ) : (
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white"
              >
                Crear institución
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function SummaryCard({ title, rows }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-3 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="text-right font-medium text-slate-800">{String(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}