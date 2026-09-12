"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type AtmosphereGlow = "thermal" | "cyan" | "emerald" | "amber";

interface PageAtmosphereProps {
  imageSrc: string;
  glowColor?: AtmosphereGlow;
  className?: string;
  children: React.ReactNode;
}

const GLOW_GRADIENTS: Record<AtmosphereGlow, string> = {
  thermal: "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(249, 115, 22, 0.14), transparent 70%)",
  cyan: "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(6, 182, 212, 0.13), transparent 70%)",
  emerald: "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(16, 185, 129, 0.13), transparent 70%)",
  amber: "radial-gradient(ellipse 80% 45% at 50% -5%, rgba(245, 158, 11, 0.14), transparent 70%)",
};

export function PageAtmosphere({
  imageSrc,
  glowColor = "thermal",
  className,
  children,
}: PageAtmosphereProps) {
  return (
    <div className={cn("relative min-h-screen w-full text-steel-100", className)}>
      {/* 1. Fixed Industrial Background Image */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 will-change-transform"
        style={{
          backgroundImage: `url('${imageSrc}')`,
          filter: "brightness(0.20) contrast(1.15) saturate(1.15)",
        }}
      />

      {/* 2. Technical Blueprint Grid Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-industrial-grid-subtle opacity-30" />

      {/* 3. Vertical Atmospheric Fog & Shadow (Obsidian Gradient) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-obsidian-950/75 via-obsidian-950/85 to-obsidian-950/98"
      />

      {/* 4. Radial Ambient Domain Spotlight Glow */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: GLOW_GRADIENTS[glowColor],
        }}
      />

      {/* 5. Peripheral Vignette (Focuses eye on data center) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,8,15,0.75)_100%)]"
      />

      {/* 6. Page Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}

export default PageAtmosphere;
