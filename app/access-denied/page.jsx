// app/access-denied/page.jsx
import Link from "next/link";
import { stackServerApp } from "@/stack/server";

export const dynamic = "force-dynamic";

export default function AccessDeniedPage() {
  return (
    <main className="min-h-[calc(100vh-0px)] bg-gradient-to-b from-background to-muted/30 px-6 py-12">
      <div className="mx-auto w-full max-w-lg">
        {/* Brand header */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 ring-1 ring-primary/15 flex items-center justify-center">
            <span className="text-primary font-semibold">D</span>
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground leading-none">DUCTU</p>
            <p className="text-lg font-semibold leading-tight">Acceso restringido</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border bg-card shadow-sm">
          <div className="p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-10 w-10 rounded-2xl bg-destructive/10 ring-1 ring-destructive/15 flex items-center justify-center">
                <span className="text-destructive font-semibold">!</span>
              </div>

              <div className="flex-1">
                <h1 className="text-xl font-semibold tracking-tight">
                  No tienes acceso a esta institución
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Tu cuenta está autenticada, pero aún no está registrada en DUCTU.
                  Para ingresar necesitas una invitación de un administrador.
                </p>
              </div>
            </div>

            {/* Info box */}
            <div className="mt-5 rounded-xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">¿Qué puedes hacer ahora?</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Solicita una invitación al administrador de tu institución.</li>
                <li>• Si estás en un computador compartido, cierra sesión para usar otra cuenta.</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2">
              {/* Key fix: clear Stack session so next login isn't sticky */}
              <Link
                href={stackServerApp.urls.signOut}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95"
              >
                Usar otra cuenta (cerrar sesión)
              </Link>

              <Link
                href="/support"
                className="inline-flex h-11 items-center justify-center rounded-xl border bg-background px-4 text-sm font-medium hover:bg-muted/40"
              >
                Contactar soporte / administrador
              </Link>

              <Link
                href="/"
                className="mt-1 inline-flex items-center justify-center text-sm text-muted-foreground hover:text-foreground"
              >
                Volver al inicio
              </Link>
            </div>
          </div>

          <div className="border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">
              Consejo: si el navegador sigue entrando con la misma cuenta de Google,
              esta opción cierra tu sesión en DUCTU para permitir seleccionar otra cuenta.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DUCTU · Gestión académica moderna
        </p>
      </div>
    </main>
  );
}
