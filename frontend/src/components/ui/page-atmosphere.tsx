"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type AtmosphereGlow = "thermal" | "cyan" | "emerald" | "amber";

interface PageAtmosphereProps {
  imageSrc?: string;
  glowColor?: AtmosphereGlow;
  className?: string;
  children: React.ReactNode;
}

const GLOW_CONFIG: Record<
  AtmosphereGlow,
  {
    beamPrimary: string;
    beamSecondary: string;
    strokeColor: string;
    topHorizonLine: string;
  }
> = {
  thermal: {
    beamPrimary:
      "radial-gradient(ellipse 75% 40% at 50% -5%, rgba(249, 115, 22, 0.18), transparent 70%)",
    beamSecondary:
      "radial-gradient(ellipse 45% 25% at 50% 0%, rgba(245, 158, 11, 0.12), transparent 60%)",
    strokeColor: "#f97316",
    topHorizonLine: "bg-gradient-to-r from-transparent via-thermal-500/50 to-transparent",
  },
  cyan: {
    beamPrimary:
      "radial-gradient(ellipse 75% 40% at 50% -5%, rgba(6, 182, 212, 0.17), transparent 70%)",
    beamSecondary:
      "radial-gradient(ellipse 45% 25% at 50% 0%, rgba(59, 130, 246, 0.12), transparent 60%)",
    strokeColor: "#06b6d4",
    topHorizonLine: "bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent",
  },
  emerald: {
    beamPrimary:
      "radial-gradient(ellipse 75% 40% at 50% -5%, rgba(16, 185, 129, 0.17), transparent 70%)",
    beamSecondary:
      "radial-gradient(ellipse 45% 25% at 50% 0%, rgba(20, 184, 166, 0.12), transparent 60%)",
    strokeColor: "#10b981",
    topHorizonLine: "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent",
  },
  amber: {
    beamPrimary:
      "radial-gradient(ellipse 75% 40% at 50% -5%, rgba(245, 158, 11, 0.18), transparent 70%)",
    beamSecondary:
      "radial-gradient(ellipse 45% 25% at 50% 0%, rgba(217, 119, 6, 0.12), transparent 60%)",
    strokeColor: "#f59e0b",
    topHorizonLine: "bg-gradient-to-r from-transparent via-amber-500/50 to-transparent",
  },
};

export function PageAtmosphere({
  glowColor = "thermal",
  className,
  children,
}: PageAtmosphereProps) {
  const config = GLOW_CONFIG[glowColor];

  return (
    <div className={cn("relative min-h-screen w-full bg-[#080c14] text-steel-100 selection:bg-thermal-500/30 selection:text-white", className)}>
      {/* 1. Deep Obsidian Base Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0a0e17] via-[#070b12] to-[#05080e]" />

      {/* 2. Precision Technical Blueprint Dual-Scale Grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)",
          backgroundSize: "24px 24px, 96px 96px, 96px 96px",
        }}
      />

      {/* 3. Primary Directional Domain Glow Beam (Molten/Cyan/Emerald/Amber) */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: config.beamPrimary,
        }}
      />

      {/* 4. Secondary Concentrated Ambient Spotlight */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: config.beamSecondary,
        }}
      />

      {/* 5. Razor-Sharp Pyrometallurgical SVG Isotherm Contours */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-iso-${glowColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.strokeColor} stopOpacity="0.8" />
            <stop offset="50%" stopColor={config.strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Phase boundary & isothermal melt curves */}
        <path
          d="M-100,100 Q450,-20 900,140 T1900,80 T2900,140"
          fill="none"
          stroke={`url(#grad-iso-${glowColor})`}
          strokeWidth="1.5"
          strokeDasharray="6 3"
        />
        <path
          d="M-100,240 Q550,100 1100,260 T2200,180 T3200,260"
          fill="none"
          stroke={`url(#grad-iso-${glowColor})`}
          strokeWidth="1.2"
        />
        <path
          d="M-100,420 Q650,280 1300,460 T2500,340 T3500,440"
          fill="none"
          stroke={`url(#grad-iso-${glowColor})`}
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <path
          d="M-100,640 Q750,480 1500,680 T2800,520 T3800,660"
          fill="none"
          stroke={`url(#grad-iso-${glowColor})`}
          strokeWidth="0.8"
        />
      </svg>

      {/* 6. Peripheral Vignette (Keeps Center Focused & Legible) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,8,14,0.85)_100%)]" />

      {/* 7. Top Horizon Luminous Accent Line */}
      <div className={cn("fixed top-0 left-0 right-0 h-[1px] pointer-events-none z-10", config.topHorizonLine)} />

      {/* 8. Page Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}

export default PageAtmosphere;
