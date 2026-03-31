// app/auth/components/AuthClient.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import LoginForm from "./loginForm";
import RegisterForm from "./registerForm";
import InvitedRegisterForm from "./InvitedRegisterForm";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import loginImage from "@/public/ellipses.png";

async function setSignupIntent(intent) {
  await fetch("/api/set-signup-intent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ intent }),
  });
}

async function clearSignupIntent() {
  await fetch("/api/set-signup-intent", {
    method: "DELETE",
  });
}

export default function AuthClient({
  isLoginDefault = true,
  mode = "normal",
  invitedEmail,
  invitedRole,
  institutionName,
}) {
  const isInvite = mode === "invite";

  const initialIsLogin = useMemo(() => Boolean(isLoginDefault), [isLoginDefault]);
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [errorMsg, setErrorMsg] = useState("");

  const handleToggleForm = () => setIsLogin((v) => !v);

  // Leer error del query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "registration_incomplete") {
      setErrorMsg(
        "No encontramos una cuenta asociada a este usuario. Si tienes una invitación, úsala para registrarte. Si eres administrador, regístrate con el correo institucional."
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncIntent() {
      try {
        if (isLogin) {
          await clearSignupIntent();
          return;
        }
        if (!isInvite) {
          await setSignupIntent("institution");
          return;
        }
        await setSignupIntent("invited");
      } catch {
        if (!cancelled) {
          // no-op
        }
      }
    }

    syncIntent();

    return () => {
      cancelled = true;
    };
  }, [isLogin, isInvite]);

  return (
    <div className="flex w-screen min-h-screen overflow-hidden">
      {/* Panel izquierdo */}
      <div className="relative w-1/2 h-screen bg-gradient-to-b from-blue-500 to-blue-950 flex flex-col justify-center items-start px-24 space-y-4">
        <h1 className="text-white font-semibold text-4xl tracking-widest">
          DUCTU
        </h1>

        {isInvite ? (
          <p className="text-white font-normal text-lg tracking-widest">
            Has sido invitado a unirte a{" "}
            <span className="font-semibold">
              {institutionName || "tu institución"}
            </span>
            .
            <br />
            Correo: <span className="font-semibold">{invitedEmail}</span>
            {invitedRole ? (
              <>
                <br />
                Rol: <span className="font-semibold">{invitedRole}</span>
              </>
            ) : null}
          </p>
        ) : (
          <p className="text-white font-normal text-lg tracking-widest">
            Conexión real con el ambiente educativo
          </p>
        )}

        {!isInvite && (
          <Button
            className="bg-blue-500 rounded-3xl p-5 px-6 text-lg font-medium tracking-widest"
            asChild
          >
            <Link href="/">Leer más</Link>
          </Button>
        )}

        <Image
          src={loginImage}
          alt="Blue borders"
          className="absolute -bottom-10 left-0 w-xl h-auto"
        />

        <div className="mt-8 text-white">
          {isInvite ? (
            <p>
              {isLogin ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={handleToggleForm}
                    className="font-semibold underline"
                  >
                    Crear cuenta
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={handleToggleForm}
                    className="font-semibold underline"
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </p>
          ) : (
            <p>
              {isLogin ? (
                <>
                  ¿No tienes una cuenta?{" "}
                  <button
                    onClick={handleToggleForm}
                    className="font-semibold underline"
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes una cuenta?{" "}
                  <button
                    onClick={handleToggleForm}
                    className="font-semibold underline"
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-900 gap-4">

        {/* Banner de error */}
        {errorMsg && (
          <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}

        <div className="w-full max-w-md">
          {isInvite ? (
            isLogin ? (
              <LoginForm lockedEmail={invitedEmail} />
            ) : (
              <InvitedRegisterForm
                lockedEmail={invitedEmail}
                invitedRole={invitedRole}
              />
            )
          ) : isLogin ? (
            <LoginForm />
          ) : (
            <RegisterForm />
          )}
        </div>
      </div>
    </div>
  );
}