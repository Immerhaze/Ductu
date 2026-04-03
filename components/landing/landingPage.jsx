// components/landing/landingPage.jsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useStackApp } from "@stackframe/stack";
import { MacbookScroll } from "../ui/macbook-scroll";
import { TypewriterEffectSmooth } from "../ui/typewriter-effect";
import FeaturesSection from "./featureSection";
import CallToActionSection from "./callToAction";
import FooterSection from "./footer";

export default function LandingPageContent() {
  const router = useRouter();
  const user = useUser();
  const stackApp = useStackApp();
  const [isSwitching, setIsSwitching] = useState(false);

  const words = [
    { text: "Conexión" },
    { text: "real", className: "text-blue-400" },
    { text: "con" },
    { text: "el" },
    { text: "ambiente" },
    { text: "educativo." },
  ];

  async function handleSwitchAccount() {
    try {
      setIsSwitching(true);
      await stackApp.signOut();
      router.push("/auth?mode=register");
    } finally {
      setIsSwitching(false);
    }
  }

  const isAuthed = !!user;

  return (
    <div className="relative w-full min-h-screen bg-white">

      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-widest text-blue-950">DUCTU</span>

          <nav className="hidden md:flex items-center gap-8">
            {["Características", "Precios", "Contacto"].map(item => (
              <span key={item} className="text-sm text-gray-500 hover:text-blue-950 cursor-pointer transition-colors">
                {item}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!isAuthed ? (
              <>
                <Link
                  href="/auth?mode=login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-950 transition-colors px-4 py-2"
                >
                  Ingresar
                </Link>
                <Link
                  href="/auth?mode=register"
                  className="text-sm font-semibold bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/post-auth"
                  className="text-sm font-medium text-gray-600 hover:text-blue-950 transition-colors px-4 py-2 flex items-center gap-2"
                >
                  <span className="icon-[material-symbols--arrow-circle-right-outline] text-base" />
                  <span className="truncate max-w-[140px]">{user?.primaryEmail}</span>
                </Link>
                <button
                  onClick={handleSwitchAccount}
                  disabled={isSwitching}
                  className="text-sm font-semibold bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50"
                >
                  {isSwitching ? "Cambiando..." : "Cambiar cuenta"}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="pt-16 overflow-hidden">
        <MacbookScroll
          title={<TypewriterEffectSmooth words={words} />}
          src="/screenshot.png"
          showGradient={false}
        />
      </div>

      <FeaturesSection />

      <div className="w-full">
        <CallToActionSection />
        <FooterSection />
      </div>
    </div>
  );
}