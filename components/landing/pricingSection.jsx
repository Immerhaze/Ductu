// components/landing/pricingSection.jsx
"use client";

import Link from "next/link";

const PLANS = [
  {
    name: "Básico",
    price: "Gratis",
    period: "",
    description: "Para instituciones que están empezando con la gestión digital.",
    features: [
      "Hasta 3 docentes",
      "Hasta 60 estudiantes",
      "Calificaciones y horarios",
      "Feed de comunicados",
      "Soporte por email",
    ],
    cta: "Comenzar gratis",
    href: "/auth?mode=register",
    highlight: false,
  },
  {
    name: "Profesional",
    price: "$29",
    period: "/ mes",
    description: "Para colegios con equipos docentes medianos que necesitan más control.",
    features: [
      "Hasta 20 docentes",
      "Hasta 500 estudiantes",
      "Todo lo del plan Básico",
      "Importación masiva Excel",
      "Notificaciones automáticas",
      "Perfil completo del estudiante",
      "Soporte prioritario",
    ],
    cta: "Solicitar acceso",
    href: "/contacto",
    highlight: true,
  },
  {
    name: "Institución",
    price: "$79",
    period: "/ mes",
    description: "Para colegios grandes con múltiples sedes y necesidades avanzadas.",
    features: [
      "Docentes y estudiantes ilimitados",
      "Todo lo del plan Profesional",
      "Panel de administración avanzado",
      "Reportes y analítica",
      "API de integración",
      "SLA de soporte garantizado",
      "Implementación asistida",
    ],
    cta: "Hablar con ventas",
    href: "/contacto",
    highlight: false,
  },
];

export default function PricingSection() {
  return (
    <section id="precios" className="bg-white py-28 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center gap-3 mb-4 justify-center">
            <div className="h-px w-12 bg-blue-200" />
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-500 uppercase">Planes</span>
            <div className="h-px w-12 bg-blue-200" />
          </div>
          <h2 className="text-4xl font-bold text-blue-950 mb-4 tracking-tight">
            Elige el plan para tu institución
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Sin contratos a largo plazo. Puedes cambiar o cancelar en cualquier momento.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-8 flex flex-col gap-6 transition-shadow ${
                plan.highlight
                  ? "border-blue-950 bg-blue-950 text-white shadow-2xl shadow-blue-950/20 scale-[1.02]"
                  : "border-gray-200 bg-white text-blue-950 hover:shadow-lg"
              }`}
            >
              {plan.highlight && (
                <span className="self-start text-xs font-bold tracking-widest uppercase bg-blue-500 text-white px-3 py-1 rounded-full">
                  Popular
                </span>
              )}

              <div>
                <p className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-blue-300" : "text-gray-400"}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlight ? "text-blue-300" : "text-gray-400"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mt-2 leading-relaxed ${plan.highlight ? "text-blue-200" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-blue-100" : "text-gray-600"}`}>
                    <span className={`icon-[lucide--check] text-base mt-0.5 shrink-0 ${plan.highlight ? "text-blue-300" : "text-blue-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center text-sm font-semibold px-6 py-3 rounded-xl transition-all ${
                  plan.highlight
                    ? "bg-white text-blue-950 hover:bg-blue-50"
                    : "bg-blue-950 text-white hover:bg-blue-900"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Nota */}
        <p className="text-center text-sm text-gray-400 mt-12">
          ¿Tienes necesidades especiales?{" "}
          <Link href="/contacto" className="text-blue-600 hover:underline font-medium">
            Contáctanos
          </Link>{" "}
          y diseñamos un plan a tu medida.
        </p>
      </div>
    </section>
  );
}
