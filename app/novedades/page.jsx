// app/novedades/page.jsx
import Link from "next/link";

const RELEASES = [
  {
    version: "v0.1.0",
    date: "Mayo 2026",
    tag: "Lanzamiento",
    tagColor: "bg-blue-100 text-blue-700",
    items: [
      { type: "new", text: "Sistema completo de calificaciones con registro manual e importación desde Excel." },
      { type: "new", text: "Horarios semanales configurables por institución, curso y docente." },
      { type: "new", text: "Notificaciones automáticas al registrar notas, publicaciones y eventos." },
      { type: "new", text: "Perfil del estudiante con anotaciones de conducta, logros y planes de mejora." },
      { type: "new", text: "Panel de configuración académica: años lectivos, períodos, asignaturas y asignaciones docentes." },
      { type: "new", text: "Arquitectura multi-tenant: cada institución opera sobre datos completamente aislados." },
      { type: "new", text: "Control de acceso por roles: Administrador, Docente y Estudiante." },
      { type: "new", text: "Campana de notificaciones con contador de no leídas en tiempo real." },
    ],
  },
  {
    version: "v0.0.3",
    date: "Abril 2026",
    tag: "Beta",
    tagColor: "bg-yellow-100 text-yellow-700",
    items: [
      { type: "new", text: "Feed de comunicados con visibilidad configurable por curso y rol." },
      { type: "new", text: "Calendario de eventos académicos con filtros por destinatario." },
      { type: "new", text: "Sistema de invitaciones con token seguro y expiración configurable." },
      { type: "fix", text: "Corrección de redirección tras login en rutas con parámetros dinámicos." },
    ],
  },
  {
    version: "v0.0.2",
    date: "Enero 2026",
    tag: "Alpha",
    tagColor: "bg-purple-100 text-purple-700",
    items: [
      { type: "new", text: "Onboarding guiado en 4 pasos para nuevas instituciones." },
      { type: "new", text: "Autenticación con Stack Auth: registro, login y verificación de email." },
      { type: "new", text: "Dashboard inicial con sidebar adaptable por rol." },
      { type: "fix", text: "Corrección de bucle infinito en la verificación de perfil incompleto." },
    ],
  },
  {
    version: "v0.0.1",
    date: "Julio 2025",
    tag: "Inicio",
    tagColor: "bg-gray-100 text-gray-600",
    items: [
      { type: "new", text: "Estructura inicial del proyecto con Next.js 15, React 19 y Prisma ORM." },
      { type: "new", text: "Landing page con secciones hero, características, precios y contacto." },
      { type: "new", text: "Esquema de base de datos PostgreSQL con modelos de institución y usuario." },
    ],
  },
];

const typeIcon = {
  new: { icon: "icon-[lucide--sparkles]", color: "text-blue-500" },
  fix: { icon: "icon-[lucide--wrench]",   color: "text-amber-500" },
  imp: { icon: "icon-[lucide--trending-up]", color: "text-green-500" },
};

export default function NovedadesPage() {
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
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">Novedades</p>
        <h1 className="text-4xl font-bold text-blue-950 mb-4 tracking-tight">Historial de versiones</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-16">
          Todas las mejoras, nuevas funcionalidades y correcciones de DUCTU, ordenadas de la más reciente a la más antigua.
        </p>

        <div className="flex flex-col gap-12">
          {RELEASES.map((release) => (
            <div key={release.version}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-lg font-bold text-blue-950">{release.version}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${release.tagColor}`}>{release.tag}</span>
                <span className="text-sm text-gray-400 ml-auto">{release.date}</span>
              </div>
              <div className="border-l-2 border-gray-100 pl-6 flex flex-col gap-3">
                {release.items.map((item, i) => {
                  const t = typeIcon[item.type] || typeIcon.new;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <span className={`${t.icon} ${t.color} text-base mt-0.5 shrink-0`} />
                      <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            ¿Tienes una sugerencia para una próxima versión?{" "}
            <Link href="/contacto" className="text-blue-600 hover:underline font-medium">Cuéntanos</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
