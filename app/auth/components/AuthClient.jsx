// app/auth/components/AuthClient.jsx
"use client";

import React, { useMemo, useState } from "react";
import LoginForm from "./loginForm";
import RegisterForm from "./resgiterForm";
import InvitedRegisterForm from "./InvitedRegisterForm"; // 👈 nuevo
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import loginImage from "@/public/ellipses.png";

export default function AuthClient({
  isLoginDefault = true,
  mode = "normal", // "normal" | "invite"
  invitedEmail,
  invitedRole,
  institutionName,
}) {
  const isInvite = mode === "invite";

  // En invitación: por defecto queremos que el usuario "cree cuenta" (sign up),
  // pero también puede iniciar sesión si ya tenía cuenta con ese correo.
  const initialIsLogin = useMemo(() => {
    return isInvite ? Boolean(isLoginDefault) : Boolean(isLoginDefault);
  }, [isInvite, isLoginDefault]);

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const handleToggleForm = () => setIsLogin((v) => !v);

  return (
    <div className="flex w-screen min-h-screen overflow-hidden">
      {/* Lado izquierdo */}
      <div className="relative w-1/2 h-screen bg-gradient-to-b from-blue-500 to-blue-950 flex flex-col justify-center items-start px-24 space-y-4">
        <h1 className="text-white font-semibold text-4xl tracking-widest">DUCTU</h1>

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
          <Button className="bg-blue-500 rounded-3xl p-5 px-6 text-lg font-medium tracking-widest" asChild>
            <Link href="/">Leer más</Link>
          </Button>
        )}

        <Image src={loginImage} alt="Blue borders" className="absolute -bottom-10 left-0 w-xl h-auto" />

        <div className="mt-8 text-white">
          {isInvite ? (
            <p>
              {isLogin ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button onClick={handleToggleForm} className="font-semibold underline">
                    Crear cuenta
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button onClick={handleToggleForm} className="font-semibold underline">
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
                  <button onClick={handleToggleForm} className="font-semibold underline">
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes una cuenta?{" "}
                  <button onClick={handleToggleForm} className="font-semibold underline">
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Lado derecho */}
      <div className="w-1/2 flex justify-center items-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {isInvite ? (
            isLogin ? (
              <LoginForm lockedEmail={invitedEmail} />
            ) : (
              <InvitedRegisterForm lockedEmail={invitedEmail} invitedRole={invitedRole} />
            )
          ) : (
            isLogin ? <LoginForm /> : <RegisterForm />
          )}
        </div>
      </div>
    </div>
  );
}
