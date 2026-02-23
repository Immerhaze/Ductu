import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function InviteInvalidPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white">
      <div className="w-full max-w-lg border rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Invitación no disponible</h1>
        <p className="text-sm text-muted-foreground">
          Esta invitacion ya no es valida, puede que ya haya sido usada o la invitación haya expirado.
        </p>

        <div className="flex gap-3">
          <Button asChild>
            <Link href="/">Regresar a la pagina principal</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth??mode=login">Ir a iniciar sesion</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
