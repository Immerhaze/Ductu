// components/landing/introPage.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import loginImage from "@/public/ellipses.png";

export default function IntroPage({ onAnimationComplete }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setIsExiting(true), 1800);
    const completeTimer = setTimeout(() => {
      onAnimationComplete?.();
    }, 2300);

    return () => { clearTimeout(exitTimer); clearTimeout(completeTimer); };
  }, [onAnimationComplete]);

  return (
    <div className={`
      relative w-screen h-screen bg-blue-950 flex justify-center items-center overflow-hidden
      ${isExiting ? "animate-fade-out duration-500" : "animate-blurred-fade-in duration-300"}
    `}>
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <h1 className="text-9xl font-bold text-white tracking-widest z-20 select-none">
        <span className="inline-block animate-slide-in-top duration-300 delay-250">D</span>
        <span className="inline-block animate-slide-in-bottom duration-300 delay-400">U</span>
        <span className="inline-block animate-slide-in-top duration-300 delay-700">C</span>
        <span className="inline-block animate-slide-in-bottom duration-300 delay-800">T</span>
        <span className="inline-block animate-slide-in-top duration-300 delay-900">U</span>
      </h1>

      <Image
        src={loginImage}
        className="absolute left-0 bottom-0 w-1/2 h-auto z-10 animate-zoom-in duration-300 delay-500 opacity-30"
        alt="background"
      />
    </div>
  );
}