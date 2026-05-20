// app/cookies/page.jsx
import Link from "next/link";

const COOKIE_TYPES = [
  {
    type: "Esenciales",
    required: true,
    icon: "icon-[lucide--shield-check]",
    color: "text-blue-500",
    desc: "Necesarias para el funcionamiento básico de la plataforma. Sin estas cookies, servicios como el inicio de sesión o la navegación segura no funcionarían correctamente.",
    examples: [
      { name: "session_token", purpose: "Mantiene tu sesión iniciada de forma segura." },
      { name: "csrf_token",    purpose: "Protege contra ataques de falsificación de solicitudes." },
    ],
  },
  {
    type: "Funcionales",
    required: false,
    icon: "icon-[lucide--settings-2]",
    color: "text-purple-500",
    desc: "Mejoran la experiencia de uso recordando tus preferencias, como el idioma o el estado del panel lateral.",
    examples: [
      { name: "sidebar_collapsed", purpose: "Recuerda si tienes el menú lateral expandido o contraído." },
      { name: "ui_theme",          purpose: "Guarda tus preferencias de visualización." },
    ],
  },
  {
    type: "Analíticas",
    required: false,
    icon: "icon-[lucide--bar-chart-2]",
    color: "text-green-500",
    desc: "Nos ayudan a entender cómo se usa la plataforma para mejorarla. Los datos se procesan de forma anónima y no se comparten con terceros.",
    examples: [
      { name: "_analytics_id", purpose: "Identifica sesiones únicas de forma anónima." },
    ],
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-widest text-blue-950">DUCTU</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-950 transition-colors flex items-center gap-1">
          <span className="icon-[lucide--arrow-left] text-base" />
          Volver al inicio
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">Legal</p>
        <h1 className="text-4xl font-bold text-blue-950 mb-4 tracking-tight">Política de cookies</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-2">
          Explicamos qué cookies usamos, para qué sirven y cómo puedes controlarlas.
        </p>
        <p className="text-xs text-gray-400 mb-16">Última actualización: Mayo 2026</p>

        <div className="mb-12 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <p className="text-sm text-blue-900 leading-relaxed">
            Las cookies son pequeños archivos de texto que se almacenan en tu navegador cuando visitas DUCTU. Usamos cookies exclusivamente para operar la plataforma de forma segura y mejorar tu experiencia. No usamos cookies para publicidad.
          </p>
        </div>

        <div className="flex flex-col gap-10">
          {COOKIE_TYPES.map((ct) => (
            <div key={ct.type}>
              <div className="flex items-center gap-3 mb-4">
                <span className={`${ct.icon} ${ct.color} text-xl`} />
                <h2 className="text-base font-bold text-blue-950">{ct.type}</h2>
                {ct.required && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 ml-auto">Siempre activas</span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{ct.desc}</p>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Cookie</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Propósito</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ct.examples.map((ex, i) => (
                      <tr key={ex.name} className={i < ct.examples.length - 1 ? "border-b border-gray-100" : ""}>
                        <td className="px-4 py-3 font-mono text-xs text-blue-700 whitespace-nowrap">{ex.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{ex.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-base font-bold text-blue-950 mb-3">Cómo controlar las cookies</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Puedes configurar tu navegador para que bloquee o elimine cookies en cualquier momento. Ten en cuenta que desactivar las cookies esenciales puede impedir el funcionamiento correcto de la plataforma.
          </p>
          <p className="text-sm text-gray-400">
            ¿Tienes preguntas sobre nuestra política de cookies?{" "}
            <Link href="/contacto" className="text-blue-600 hover:underline font-medium">Contáctanos</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
