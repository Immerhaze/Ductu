// app/estado/page.jsx
import Link from "next/link";

const SERVICES = [
  { name: "Plataforma web",          status: "operational", latency: "142 ms" },
  { name: "API principal",           status: "operational", latency: "98 ms"  },
  { name: "Base de datos",           status: "operational", latency: "34 ms"  },
  { name: "Autenticación",           status: "operational", latency: "61 ms"  },
  { name: "Almacenamiento de archivos", status: "operational", latency: "210 ms" },
  { name: "Envío de notificaciones", status: "operational", latency: "305 ms" },
];

const INCIDENTS = [
  {
    date: "15 Abr 2026",
    title: "Latencia elevada en importación de archivos",
    status: "Resuelto",
    desc: "Durante 22 minutos se registró un aumento en los tiempos de procesamiento de importaciones Excel. El problema fue causado por un pico de tráfico y se resolvió escalando los recursos del servidor.",
  },
];

const statusConfig = {
  operational: { label: "Operacional", color: "text-green-600", dot: "bg-green-500", bar: "bg-green-100 text-green-700" },
  degraded:    { label: "Degradado",   color: "text-amber-600", dot: "bg-amber-500", bar: "bg-amber-100 text-amber-700" },
  outage:      { label: "Interrupción", color: "text-red-600",  dot: "bg-red-500",   bar: "bg-red-100 text-red-700"   },
};

export default function EstadoPage() {
  const allOperational = SERVICES.every(s => s.status === "operational");

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
        <p className="text-xs font-semibold tracking-[0.2em] text-blue-500 uppercase mb-3">Estado</p>
        <h1 className="text-4xl font-bold text-blue-950 mb-4 tracking-tight">Estado del sistema</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-10">
          Monitoreo en tiempo real de todos los servicios de DUCTU.
        </p>

        {/* Banner global */}
        <div className={`flex items-center gap-3 rounded-xl px-5 py-4 mb-12 ${allOperational ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"}`}>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${allOperational ? "bg-green-500" : "bg-amber-500"}`} />
          <p className={`text-sm font-semibold ${allOperational ? "text-green-700" : "text-amber-700"}`}>
            {allOperational ? "Todos los sistemas operan con normalidad." : "Algunos servicios presentan inconvenientes."}
          </p>
        </div>

        {/* Servicios */}
        <div className="flex flex-col gap-3 mb-16">
          {SERVICES.map((svc) => {
            const cfg = statusConfig[svc.status] || statusConfig.operational;
            return (
              <div key={svc.name} className="flex items-center justify-between border border-gray-100 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className="text-sm font-medium text-blue-950">{svc.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">{svc.latency}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bar}`}>{cfg.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Incidentes recientes */}
        <h2 className="text-lg font-bold text-blue-950 mb-6">Historial de incidentes</h2>
        {INCIDENTS.length === 0 ? (
          <p className="text-sm text-gray-400">No hay incidentes registrados en los últimos 90 días.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {INCIDENTS.map((inc) => (
              <div key={inc.title} className="border-l-2 border-gray-100 pl-5">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-gray-400">{inc.date}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{inc.status}</span>
                </div>
                <p className="text-sm font-semibold text-blue-950 mb-1">{inc.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{inc.desc}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 pt-10 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            ¿Detectas un problema no reportado?{" "}
            <Link href="/contacto" className="text-blue-600 hover:underline font-medium">Repórtalo aquí</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
