// app/auth/components/InvitedRegisterForm.jsx
"use client";

import React, { useState } from "react";
import { useStackApp } from "@stackframe/stack";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Recomendado: pásale inviteToken desde tu /auth/page.jsx cuando mode=invite
export default function InvitedRegisterForm({ lockedEmail, inviteToken }) {
  const app = useStackApp();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInvitedSignUp = async () => {
    setError("");
    setLoading(true);

    try {
      if (!password || password.trim().length < 1) {
        setError("Debes ingresar una contraseña.");
        return;
      }

      // Crea cuenta en Stack (redirige a app.urls.afterSignUp si está configurado)
      const result = await app.signUpWithCredential({
        email: lockedEmail,
        password,
      });

      if (result.status === "error") {
        setError(result.error?.message || "No se pudo crear la cuenta.");
        return;
      }

      // Si tu Stack está configurado con afterSignUp=/post-auth, normalmente no necesitas hacer nada aquí.
      // Si en algún caso usas noRedirect, aquí harías un router.push("/post-auth").
    } catch (e) {
      setError(e?.message || "Error creando cuenta.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setOauthLoading(true);

    try {
      // OAuth redirige. Guarda el token de invitación para que /post-auth lo recoja.
      if (inviteToken) sessionStorage.setItem("inviteToken", inviteToken);
      sessionStorage.setItem("inviteEmail", lockedEmail);

      await app.signInWithOAuth("google");
    } catch (e) {
      setError(e?.message || "Error iniciando con Google.");
      setOauthLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Correo (invitación)</Label>
        <Input value={lockedEmail} disabled />
      </div>

      <div>
        <Label>Contraseña</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading || oauthLoading}
          placeholder="Crea una contraseña segura"
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <Button
        onClick={handleInvitedSignUp}
        disabled={loading || oauthLoading || !password}
        className="w-full"
      >
        {loading ? "Creando..." : "Crear cuenta y continuar"}
      </Button>

      <div className="relative py-2">
        <div className="h-px bg-gray-200" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-1.5 bg-white px-3 text-xs text-gray-500">
          o
        </span>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        disabled={loading || oauthLoading}
        className="w-full"
      >
        {oauthLoading ? "Redirigiendo..." : "Continuar con Google"}
      </Button>
    </div>
  );
}
