// components/landing/featureSection.jsx
"use client";

import { BentoGrid, BentoGridItem } from "../ui/bentogrid";
import { ThreeDMarquee } from "../ui/3d-marquee";

const FEATURES = [
  {
    title: "Gestión de Calificaciones",
    description: "Agrega, edita e importa notas con precisión. Sin hojas de cálculo, sin papel.",
    className: "md:col-span-2",
    icon: "icon-[ic--twotone-history-edu]",
  },
  {
    title: "Paneles por Rol",
    description: "Vistas distintas para docentes, jefes de curso y administradores.",
    className: "md:col-span-1",
    icon: "icon-[ic--twotone-manage-accounts]",
  },
  {
    title: "Importación Masiva",
    description: "Carga evaluaciones y usuarios en segundos con Excel.",
    className: "md:col-span-1",
    icon: "icon-[ph--microsoft-excel-logo-duotone]",
  },
  {
    title: "Retroalimentación Individual",
    description: "Anotaciones, logros y planes de mejora personalizados por alumno.",
    className: "md:col-span-2",
    icon: "icon-[solar--notes-bold-duotone]",
  },
  {
    title: "Datos en Tiempo Real",
    description: "Tablero de analytics para entender el rendimiento escolar global.",
    className: "md:col-span-1",
    icon: "icon-[solar--database-bold-duotone]",
  },
  {
    title: "Seguridad y Control",
    description: "Notas editables solo por sus autores. Roles y permisos granulares.",
    className: "md:col-span-2",
    icon: "icon-[solar--lock-keyhole-unlocked-bold-duotone]",
  },
];

const images = [
  "https://assets.aceternity.com/cloudinary_bkp/3d-card.png",
  "https://assets.aceternity.com/animated-modal.png",
  "https://assets.aceternity.com/animated-testimonials.webp",
  "https://assets.aceternity.com/cloudinary_bkp/Tooltip_luwy44.png",
  "https://assets.aceternity.com/github-globe.png",
  "https://assets.aceternity.com/glare-card.png",
  "https://assets.aceternity.com/layout-grid.png",
  "https://assets.aceternity.com/flip-text.png",
  "https://assets.aceternity.com/hero-highlight.png",
  "https://assets.aceternity.com/carousel.webp",
  "https://assets.aceternity.com/placeholders-and-vanish-input.png",
  "https://assets.aceternity.com/shooting-stars-and-stars-background.png",
  "https://assets.aceternity.com/signup-form.png",
  "https://assets.aceternity.com/cloudinary_bkp/stars_sxle3d.png",
  "https://assets.aceternity.com/spotlight-new.webp",
  "https://assets.aceternity.com/cloudinary_bkp/Spotlight_ar5jpr.png",
  "https://assets.aceternity.com/tabs.png",
  "https://assets.aceternity.com/cloudinary_bkp/Tracing_Beam_npujte.png",
  "https://assets.aceternity.com/glowing-effect.webp",
  "https://assets.aceternity.com/hover-border-gradient.png",
  "https://assets.aceternity.com/macbook-scroll.png",
  "https://assets.aceternity.com/wobble-card.png",
];

export default function FeaturesSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-blue-950">
      <div className="absolute inset-0 z-0 opacity-30">
        <ThreeDMarquee images={images} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-28">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="h-px w-12 bg-blue-400 opacity-60" />
          <span className="text-xs font-semibold tracking-[0.2em] text-blue-300 uppercase">
            Plataforma educativa
          </span>
          <div className="h-px w-12 bg-blue-400 opacity-60" />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4 leading-tight tracking-tight">
          Todo lo que necesita
          <br />
          <span className="text-blue-300">tu institución</span>
        </h2>

        <p className="text-center text-blue-200 text-lg mb-16 max-w-xl mx-auto leading-relaxed">
          Una sola plataforma para gestionar calificaciones, comunicación y seguimiento académico.
        </p>

        <BentoGrid className="max-w-4xl mx-auto md:auto-rows-[15rem]">
          {FEATURES.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}