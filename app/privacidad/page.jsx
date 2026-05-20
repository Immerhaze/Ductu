// app/privacidad/page.jsx
import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Información que recopilamos",
    body: `Recopilamos la información que proporcionas directamente al registrarte: nombre completo, correo electrónico e institución educativa. Durante el uso de la plataforma también registramos datos de actividad como calificaciones, asistencia y comunicados, asociados a tu perfil dentro de la institución.`,
  },
  {
    title: "2. Cómo usamos tu información",
    body: `Usamos tu información exclusivamente para operar y mejorar la plataforma. Esto incluye: mostrar tu perfil a los miembros autorizados de tu institución, enviar notificaciones académicas, generar reportes para administradores y docentes, y mantener la seguridad de la cuenta.`,
  },
  {
    title: "3. Aislamiento de datos por institución",
    body: `DUCTU opera bajo una arquitectura multi-tenant. Los datos de cada institución están completamente aislados entre sí. Ningún usuario puede acceder a datos de una institución a la que no pertenece. Los administradores de cada institución solo acceden a los datos de su propia institución.`,
  },
  {
    title: "4. Compartir información con terceros",
    body: `No vendemos, alquilamos ni compartimos tu información personal con terceros con fines comerciales. Podemos compartir datos con proveedores de servicios técnicos (bases de datos, almacenamiento en la nube, autenticación) únicamente en la medida necesaria para operar la plataforma, bajo contratos de confidencialidad.`,
  },
  {
    title: "5. Seguridad",
    body: `Implementamos medidas técnicas y organizativas estándar de la industria para proteger tu información, incluyendo cifrado en tránsito (TLS), autenticación segura y acceso restringido por roles. Sin embargo, ningún sistema es 100 % infalible y no podemos garantizar la seguridad absoluta.`,
  },
  {
    title: "6. Retención de datos",
    body: `Conservamos tu información mientras tu cuenta esté activa o mientras sea necesaria para prestarte el servicio. Puedes solicitar la eliminación de tu cuenta contactándonos. Algunos datos pueden conservarse por requisitos legales o legítimos intereses del negocio durante un período adicional.`,
  },
  {
    title: "7. Tus derechos",
    body: `Tienes derecho a acceder, corregir o eliminar tu información personal. Para ejercer cualquiera de estos derechos, escríbenos a contacto@ductu.app con el asunto «Solicitud de privacidad». Responderemos en un plazo máximo de 30 días hábiles.`,
  },
  {
    title: "8. Cambios a esta política",
    body: `Podemos actualizar esta política periódicamente. Te notificaremos por correo electrónico ante cambios significativos. La fecha de última actualización aparece al pie de este documento.`,
  },
];

export default function PrivacidadPage() {
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
        <h1 className="text-4xl font-bold text-blue-950 mb-4 tracking-tight">Política de privacidad</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-2">
          Esta política describe cómo DUCTU recopila, usa y protege tu información personal.
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
            ¿Tienes preguntas sobre esta política?{" "}
            <Link href="/contacto" className="text-blue-600 hover:underline font-medium">Contáctanos</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
