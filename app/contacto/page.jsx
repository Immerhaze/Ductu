// app/contacto/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Nav mínimo */}
      <header className="border-b border-gray-100 px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-widest text-blue-950">DUCTU</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-950 transition-colors flex items-center gap-1">
          <span className="icon-[lucide--arrow-left] text-base" />
          Volver al inicio
        </Link>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Info */}
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">Contacto</p>
            <h1 className="text-4xl font-bold text-blue-950 mb-4 leading-tight tracking-tight">
              Hablemos de tu institución
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10">
              Cuéntanos qué necesita tu colegio y un especialista de DUCTU te
              responderá en menos de 24 horas hábiles.
            </p>

            <div className="flex flex-col gap-6">
              {[
                {
                  icon: "icon-[material-symbols--mail-outline]",
                  label: "Email",
                  value: "contacto@ductu.app",
                  href: "mailto:contacto@ductu.app",
                },
                {
                  icon: "icon-[material-symbols--schedule-outline]",
                  label: "Tiempo de respuesta",
                  value: "Menos de 24 horas hábiles",
                  href: null,
                },
                {
                  icon: "icon-[material-symbols--location-on-outline]",
                  label: "Disponibilidad",
                  value: "Colombia y Latinoamérica",
                  href: null,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <span className={`${item.icon} text-blue-600 text-xl`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-blue-950 font-medium hover:text-blue-600 transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-blue-950 font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
            {status === "sent" ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="icon-[lucide--check] text-green-600 text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-blue-950 mb-2">¡Mensaje enviado!</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Te responderemos en menos de 24 horas hábiles.
                </p>
                <button
                  onClick={() => { setStatus("idle"); setForm({ nombre: "", email: "", asunto: "", mensaje: "" }); }}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <h3 className="text-lg font-bold text-blue-950 mb-1">Envíanos un mensaje</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Nombre completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      value={form.nombre}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 transition-colors"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Asunto <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={form.asunto}
                    onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="¿En qué podemos ayudarte?"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Mensaje <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.mensaje}
                    onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400 transition-colors resize-none"
                    placeholder="Cuéntanos sobre tu institución, cuántos estudiantes tienen, qué necesitan..."
                  />
                </div>

                {status === "error" && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    Ocurrió un error al enviar. Intenta de nuevo o escríbenos directamente a contacto@ductu.app
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="bg-blue-950 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <span className="icon-[lucide--send] text-base" />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
