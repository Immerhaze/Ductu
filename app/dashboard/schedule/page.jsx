// app/dashboard/schedule/page.jsx
import { redirect } from "next/navigation";
import { requireAppUser } from "@/lib/authz";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  try {
    await requireAppUser({ requireProfileCompleted: true });
    return (
      <div className="p-12">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Horarios</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Horario de clases</h1>
        <div className="bg-white border border-gray-200 rounded-2xl py-16 text-center">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-sm font-semibold text-gray-700">Próximamente</p>
          <p className="text-xs text-gray-400 mt-2">El módulo de horarios está en construcción.</p>
        </div>
      </div>
    );
  } catch (e) {
    redirect("/auth?mode=login");
  }
}