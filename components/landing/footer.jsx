"use client";

import { TextHoverEffect } from "../ui/text-hover-effect";
import { useEffect, useState } from "react";

const LINKS = {
  Producto: ["Características", "Precios", "Solicitar demo", "Novedades"],
  Soporte: ["Documentación", "Centro de ayuda", "Contacto", "Estado del sistema"],
  Legal: ["Privacidad", "Términos de uso", "Cookies"],
};

export default function FooterSection() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-blue-950 text-white w-full">

      <div className="max-w-7xl mx-auto px-8 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          <div className="lg:col-span-2 space-y-5">
            <div className="w-36 -ml-2">
              <TextHoverEffect text="DUCTU" duration={0.4} />
            </div>
            <p className="text-sm text-blue-200 leading-relaxed max-w-xs">
              Plataforma de gestión académica diseñada para colegios modernos. Simple, poderosa y segura.
            </p>
            
             <a  href="mailto:contacto@ductu.app"
              className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-white transition-colors">
              <span className="icon-[material-symbols--mail-outline] text-base" />
              contacto@ductu.app
            </a>
          </div>

          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <h4 className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-300">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-blue-200 hover:text-white transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>
      </div>

      <div className="border-t border-white/10" />

      <div className="max-w-7xl mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-blue-400">
          © {year} DUCTU. Todos los derechos reservados.
        </p>
        <div className="flex items-center gap-6">
          {["Privacidad", "Términos", "Cookies"].map((item) => (
            <a key={item} href="#" className="text-xs text-blue-400 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>

    </footer>
  );
}