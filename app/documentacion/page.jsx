// app/documentacion/page.jsx
import Link from "next/link";

const SECTIONS = [
  {
    title: "Primeros pasos",
    icon: "icon-[lucide--rocket]",
    items: [
      { title: "¿Qué es DUCTU?", desc: "Visión general de la plataforma y sus módulos principales." },
      { title: "Crear una institución", desc: "Cómo configurar tu institución en el proceso de onboarding inicial." },
      { title: "Invitar usuarios", desc: "Generar tokens de invitación y asignar roles a docentes y estudiantes." },
    ],
  },
  {
    title: "Módulos",
    icon: "icon-[lucide--layout-grid]",
    items: [
      { title: "Calificaciones", desc: "Registro manual, importación desde Excel y reportes por período." },
      { title: "Horarios", desc: "Configuración de bloques, grilla semanal y vistas por rol." },
      { title: "Comunicados", desc: "Feed de noticias con visibilidad configurable por curso y rol." },
      { title: "Calendario", desc: "Eventos académicos con filtros por destinatario y tipo." },
    ],
  },
  {
    title: "Administración",
    icon: "icon-[lucide--settings]",
    items: [
      { title: "Años lectivos y períodos", desc: "Crear y gestionar la estructura temporal del calendario académico." },
      { title: "Cursos y asignaturas", desc: "Organizar grupos, materias y asignaciones docentes." },
      { title: "Perfil del estudiante", desc: "Anotaciones de conducta, logros y planes de mejora." },
    ],
  },
];

export default function DocumentacionPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-widest text-blue-950">DUCTU</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-blue-950 transition-colors flex items-center gap-1">
          <span className="icon-[lucide--arrow-left] text-base" />
          Volver al inicio
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">Documentación</p>
        <h1 className="text-4xl font-bold text-blue-950 mb-4 tracking-tight">Centro de documentación</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-16">
          Todo lo que necesitas saber para aprovechar al máximo DUCTU en tu institución.
        </p>

        <div className="flex flex-col gap-12">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`${section.icon} text-blue-500 text-xl`} />
                <h2 className="text-lg font-bold text-blue-950">{section.title}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item) => (
                  <div key={item.title} className="border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:bg-blue-50/30 transition-colors cursor-pointer">
                    <h3 className="text-sm font-semibold text-blue-950 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-gray-100 bg-blue-50 rounded-2xl p-8 text-center">
          <span className="icon-[lucide--message-circle] text-blue-400 text-3xl mb-3 block" />
          <h3 className="text-lg font-bold text-blue-950 mb-2">¿No encuentras lo que buscas?</h3>
          <p className="text-sm text-gray-500 mb-4">Nuestro equipo de soporte está listo para ayudarte.</p>
          <Link href="/contacto" className="inline-flex items-center gap-2 bg-blue-950 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-900 transition-colors">
            <span className="icon-[lucide--send] text-base" />
            Contactar soporte
          </Link>
        </div>
      </main>
    </div>
  );
}
