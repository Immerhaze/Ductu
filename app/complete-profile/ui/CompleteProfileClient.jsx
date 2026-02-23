"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeProfileAction } from "../actions";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function roleLabel(role) {
  if (role === "ADMINISTRATIVE") return "Administrativo";
  if (role === "TEACHER") return "Docente";
  if (role === "STUDENT") return "Estudiante";
  return role;
}

export default function CompleteProfileClient({ initial }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initial.fullName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const readOnlyRoleText = initial.isSuperAdmin
    ? "Super Administrador"
    : roleLabel(initial.role);

  const showPosition = initial.role === "ADMINISTRATIVE" && !initial.isSuperAdmin;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await completeProfileAction({ fullName });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err?.message || "No se pudo completar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6">
      <Card className="w-full max-w-xl border shadow-sm rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-blue-950 text-2xl">Completar perfil</CardTitle>
          <CardDescription>
            Para ingresar a DUCTU, confirma tu nombre. El rol y cargo los asigna tu institución.
          </CardDescription>

          <div className="text-sm text-gray-600 space-y-1 pt-2">
            <p>
              <span className="font-medium text-gray-800">Institución:</span> {initial.institutionName}
            </p>
            <p>
              <span className="font-medium text-gray-800">Cuenta:</span> {initial.email || "—"}
            </p>
            <p>
              <span className="font-medium text-gray-800">Rol:</span> {readOnlyRoleText}
            </p>
            {showPosition && (
              <p>
                <span className="font-medium text-gray-800">Cargo:</span>{" "}
                {initial.positionTitle || "—"}
              </p>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Nombre completo *</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Nicolás Romero"
                disabled={saving}
              />
              <p className="text-xs text-gray-500">
                Este nombre se usará en el dashboard y registros internos.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md p-3">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar y continuar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
