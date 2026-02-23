"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
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
  const user = useUser();              // null/undefined if not signed in
  const stackApp = useStackApp();      // gives you signOut()
  const [isSwitching, setIsSwitching] = useState(false);

  const logoClasses = `text-blue-950 tracking-widest text-2xl font-semibold absolute`;

  function NavItem({ children }) {
    return <li className="cursor-pointer hover:text-blue-950">{children}</li>;
  }

  const words = [
    { text: "Conexion" },
    { text: "real", className: "text-blue-500 dark:text-blue-500" },
    { text: "con" },
    { text: "el" },
    { text: "ambiente" },
    { text: "educativo." },
  ];

  async function handleSwitchAccount(target = "register") {
    try {
      setIsSwitching(true);
      await stackApp.signOut(); // clears Stack session cookie
      router.push(`/auth?mode=${target}`);
    } finally {
      setIsSwitching(false);
    }
  }

  const isAuthed = !!user;

  return (
    <div className="relative w-full min-h-screen h-auto">
      {/* HEADER */}
      <div className="w-full h-16 flex flex-row">
        <div className="w-1/3 h-16 flex justify-start items-center pl-8">
          <h1 className={logoClasses}>DUCTU</h1>
        </div>

        <div className="w-2/3 h-16 flex flex-row justify-center items-end">
          <div className="w-1/2 min-h-16 flex justify-center items-center">
            <ul className="w-full text-gray-400 tracking-wide flex flex-row justify-around text-sm">
              <NavItem>Características</NavItem>
              <NavItem>Precios</NavItem>
              <NavItem>Contacto</NavItem>
            </ul>
          </div>

          <div className="w-1/2 min-h-16 flex justify-center items-center space-x-8">
            {!isAuthed ? (
              <>
                <Button className="bg-blue-950 cursor-pointer" asChild>
                  <Link href="/auth?mode=login">Ingresar</Link>
                </Button>

                <Button
                  className="bg-blue-500 text-white hover:text-blue-950 cursor-pointer"
                  variant="outline"
                  asChild
                >
                  <Link href="/auth?mode=register">Registrarse</Link>
                </Button>
              </>
            ) : (
              <>
   <Button
  className="bg-blue-950 h-9  md:w-[100px] px-3 text-xs flex items-center gap-2 overflow-hidden"
  asChild
>
  <Link
    href="/post-auth"
    title={user?.primaryEmail ?? ""}
    className="flex items-center gap-2  min-w-0"
  >
    <span className="icon-[material-symbols--arrow-circle-right-outline] shrink-0 text-base" />
    <span className="truncate min-w-0">{user?.primaryEmail}</span>
  </Link>
</Button>


                <Button
                  className="bg-blue-500 text-white hover:text-blue-950 cursor-pointer"
                  variant="outline"
                  disabled={isSwitching}
                  onClick={() => handleSwitchAccount("register")}
                >
                  {isSwitching ? "Cambiando..." : "Cambiar cuenta"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="animate-fade-in duration-300 overflow-hidden">
        <MacbookScroll
          title={<TypewriterEffectSmooth words={words} />}
          src={"/screenshot.png"}
          showGradient={false}
        />
      </div>

      <FeaturesSection />
      <div className="w-full min-h-[100vh] h-screen">
        <CallToActionSection />
        <FooterSection />
      </div>
    </div>
  );
}
