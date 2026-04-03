// components/landing/callToAction.jsx
"use client";

import Link from "next/link";

export default function CallToActionSection() {
  return (
    <section className="bg-white py-32 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">

        {/* Label */}
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">
            Disponible ahora
          </span>
        </div>

        <h2 className="text-4xl md:text-6xl font-bold text-blue-950 leading-tight tracking-tight">
          La gestión académica
          <br />
          <span className="text-blue-500">que tu colegio merece</span>
        </h2>

        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          Únete a docentes y administradores que ya optimizan su tiempo y mejoran la experiencia educativa con DUCTU.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap pt-2">
          <Link
            href="/auth?mode=register"
            className="bg-blue-950 text-white text-sm font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-950/20 hover:shadow-xl hover:shadow-blue-950/30 hover:-translate-y-0.5"
          >
            Comenzar gratis
          </Link>
          <Link
            href="#demo"
            className="text-sm font-semibold text-blue-950 border border-gray-200 px-8 py-3.5 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all"
          >
            Solicitar demo →
          </Link>
        </div>

        {/* Social proof */}
        <p className="text-xs text-gray-400 pt-2">
          Sin tarjeta de crédito · Configuración en minutos · Soporte incluido
        </p>
      </div>
    </section>
  );
}