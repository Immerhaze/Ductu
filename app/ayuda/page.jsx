// app/ayuda/page.jsx
import Link from "next/link";

const FAQS = [
  {
    category: "Cuenta y acceso",
    items: [
      {
        q: "¿Cómo me registro en DUCTU?",
        a: "Ve a la página principal y haz clic en «Registrarse». Ingresa tu correo y crea una contraseña. Si tu institución ya está registrada, usa el enlace de invitación que te enviaron.",
      },
      {
        q: "Olvidé mi contraseña, ¿qué hago?",
        a: "En la pantalla de inicio de sesión, haz clic en «¿Olvidaste tu contraseña?». Recibirás un correo con un enlace para restablecerla en menos de 5 minutos.",
      },
      {
        q: "¿Puedo usar DUCTU desde el celular?",
        a: "Sí. DUCTU es una aplicación web responsiva que funciona en cualquier dispositivo con navegador moderno. No requiere instalación.",
      },
    ],
  },
  {
    category: "Calificaciones",
    items: [
      {
        q: "¿Cómo importo notas desde Excel?",
        a: "Ve a Calificaciones → Importar. Descarga la plantilla, llénala con los datos de tus estudiantes y sube el archivo. El sistema validará el formato antes de guardar.",
      },
      {
        q: "¿Puedo corregir una nota ya registrada?",
        a: "Sí, siempre que tengas permisos de docente o administrador en esa asignatura. Busca la nota en el registro y usa la opción de edición.",
      },
    ],
  },
  {
    category: "Horarios y calendario",
    items: [
      {
        q: "¿Quién puede crear horarios?",
        a: "Solo los administradores de la institución pueden crear y modificar la grilla de horarios. Los docentes y estudiantes pueden consultarlos.",
      },
      {
        q: "¿Cómo agrego un evento al calendario?",
        a: "Desde el módulo Calendario, haz clic en «Nuevo evento». Puedes elegir a quién va dirigido: toda la institución, un curso específico o un rol.",
      },
    ],
  },
];

export default function AyudaPage() {
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
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">Ayuda</p>
        <h1 className="text-4xl font-bold text-blue-950 mb-4 tracking-tight">Centro de ayuda</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-16">
          Respuestas a las preguntas más frecuentes sobre el uso de DUCTU.
        </p>

        <div className="flex flex-col gap-12">
          {FAQS.map((section) => (
            <div key={section.category}>
              <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-5">{section.category}</h2>
              <div className="flex flex-col gap-5">
                {section.items.map((item) => (
                  <div key={item.q} className="border-b border-gray-100 pb-5">
                    <p className="text-sm font-semibold text-blue-950 mb-2">{item.q}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400 mb-4">¿Tu pregunta no está aquí?</p>
          <Link href="/contacto" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            <span className="icon-[lucide--send] text-base" />
            Escríbenos directamente
          </Link>
        </div>
      </main>
    </div>
  );
}
