// app/onboarding/complete/page.jsx
import Link from "next/link";

export default function OnboardingCompletePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 space-y-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          ¡Institución registrada!
        </h1>
        <p className="text-sm text-slate-600">
          Hemos registrado la institución en DUCTU y creado el primer
          administrador. Esa persona podrá acceder al panel usando el email
          que definiste durante el registro.
        </p>
        <p className="text-xs text-slate-500">
          Si eres tú mismo el administrador, inicia sesión con ese correo
          desde la página de acceso.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/"
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Volver al inicio
          </Link>
          <Link
            href="/auth?mode=login"
            className="inline-flex justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
