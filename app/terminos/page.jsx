// app/terminos/page.jsx
import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Aceptación de los términos",
    body: `Al registrarte o usar DUCTU, aceptas estos Términos de Uso en su totalidad. Si no estás de acuerdo con alguna parte, no debes usar el servicio. El uso continuado de la plataforma tras la publicación de cambios implica la aceptación de los nuevos términos.`,
  },
  {
    title: "2. Descripción del servicio",
    body: `DUCTU es una plataforma de gestión académica diseñada para instituciones educativas. Ofrece módulos de calificaciones, horarios, comunicados, calendario y administración de usuarios, bajo un modelo multi-tenant donde cada institución opera de forma aislada.`,
  },
  {
    title: "3. Registro y cuentas",
    body: `Debes proporcionar información verídica al registrarte. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran en tu cuenta. Notifícanos de inmediato ante cualquier uso no autorizado.`,
  },
  {
    title: "4. Uso aceptable",
    body: `Aceptas no usar DUCTU para: (a) actividades ilegales o fraudulentas; (b) distribuir contenido dañino, engañoso o que infrinja derechos de terceros; (c) intentar acceder sin autorización a sistemas o datos; (d) interferir con el funcionamiento normal de la plataforma.`,
  },
  {
    title: "5. Propiedad intelectual",
    body: `Todo el código, diseño, marca y contenido de DUCTU son propiedad de sus creadores y están protegidos por las leyes de propiedad intelectual aplicables. Los datos académicos ingresados por las instituciones son propiedad de la institución correspondiente.`,
  },
  {
    title: "6. Limitación de responsabilidad",
    body: `DUCTU se provee «tal cual». No garantizamos disponibilidad ininterrumpida, ni que el servicio esté libre de errores. En ningún caso seremos responsables por daños indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la plataforma.`,
  },
  {
    title: "7. Modificaciones",
    body: `Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios significativos serán notificados por correo electrónico con al menos 15 días de anticipación. El uso continuado del servicio tras la notificación implica la aceptación de los cambios.`,
  },
  {
    title: "8. Ley aplicable",
    body: `Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se someterá a los tribunales competentes de Bogotá D.C., Colombia.`,
  },
];

export default function TerminosPage() {
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
        <h1 className="text-4xl font-bold text-blue-950 mb-4 tracking-tight">Términos de uso</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-2">
          Lee estos términos cuidadosamente antes de usar la plataforma DUCTU.
        </p>
        <p className="text-xs text-gray-400 mb-16">Última actualización: Mayo 2026</p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-base font-bold text-blue-950 mb-3">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            ¿Tienes dudas sobre estos términos?{" "}
            <Link href="/contacto" className="text-blue-600 hover:underline font-medium">Escríbenos</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
