import { Geist, Geist_Mono } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "Ductu",
  description:
    "Software por inscripcion  de Sistema de administrativo para instituciones educativas",
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const theme = {
  light: {
    primary: '#3b82f6',
  },
  dark: {
    primary: '#3b82f6',
  },
  radius: '8px',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <StackProvider
          app={stackClientApp}
          lang="es-ES" // puedes usar "es-ES" o "es-419
          translationOverrides={{
            // TÍTULOS / BOTONES
            "Sign in": "Iniciar sesión",
            "Sign In": "Iniciar sesión",
            "Sign up": "Regístrate",
            "Sign Up": "Regístrate",

            // TEXTOS LARGOS
            "Sign in to your account": "Inicia sesión en tu cuenta",
            "Don't have an account?": "¿No tienes una cuenta?",
            "Already have an account?": "¿Ya tienes una cuenta?",

            // Otros textos del UI
            "Or continue with": "O continuar con",
            "Email & Password": "Correo y contraseña",
            "Email": "Correo electrónico",
            "Send email": "Enviar correo",
          }}
        >
          <StackTheme theme={theme}>{children}</StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
