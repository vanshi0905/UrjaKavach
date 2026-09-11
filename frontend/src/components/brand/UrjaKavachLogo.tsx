"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type LogoDesign = "shield" | "reactor" | "flame" | "monogram";

export interface UrjaKavachLogoProps {
  variant?: "full" | "compact" | "iconOnly" | "hero";
  design?: LogoDesign;
  className?: string;
  iconSize?: number;
  glow?: boolean;
  interactive?: boolean;
}

export function UrjaKavachLogo({
  variant = "full",
  design = "shield",
  className,
  iconSize = 38,
  glow = true,
  interactive = false,
}: UrjaKavachLogoProps) {
  const [currentDesign, setCurrentDesign] = useState<LogoDesign>(design);

  const cycleDesign = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
    const designs: LogoDesign[] = ["shield", "reactor", "flame", "monogram"];
    const nextIdx = (designs.indexOf(currentDesign) + 1) % designs.length;
    setCurrentDesign(designs[nextIdx]);
  };

  // DESIGN 1: THE METALLURGICAL SHIELD (Kavach - Protective Carbon Armor)
  const renderShield = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform duration-300 group-hover:scale-105">
      <defs>
        <linearGradient id="ukShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="ukCoreGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="60%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
        <linearGradient id="ukArcGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="ukShieldBg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#050709" />
        </radialGradient>
      </defs>
      <path d="M50 8 L85 22 V50 C85 71 70 88 50 94 C30 88 15 71 15 50 V22 L50 8 Z" fill="url(#ukShieldBg)" stroke="url(#ukShieldGrad)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M50 16 L77 28 V48 C77 65 65 79 50 84 C35 79 23 65 23 48 V28 L50 16 Z" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1.5" strokeDasharray="4 2" />
      <path d="M50 28 C56 38 64 45 64 56 C64 64 58 70 50 70 C42 70 36 64 36 56 C36 47 43 40 50 28 Z" fill="url(#ukCoreGrad)" opacity="0.95" />
      <path d="M52 34 L43 51 H51 L48 66 L59 47 H50 L52 34 Z" fill="url(#ukArcGrad)" stroke="#ffffff" strokeWidth="0.8" />
      <circle cx="50" cy="50" r="2.5" fill="#ffffff" opacity="0.95" />
    </svg>
  );

  // DESIGN 2: THE EAF PLASMA REACTOR (Hexagonal Smelter & 3 Converging Arcs)
  const renderReactor = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform duration-300 group-hover:scale-105">
      <defs>
        <linearGradient id="ukHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <radialGradient id="ukReactorCore" cx="50%" cy="50%" r="45%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#fde047" />
          <stop offset="70%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#050709" />
        </radialGradient>
      </defs>
      <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="#070a0f" stroke="url(#ukHexGrad)" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="50" cy="50" r="27" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="1.5" strokeDasharray="6 3" />
      <line x1="50" y1="10" x2="50" y2="34" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="47,34 53,34 50,42" fill="#38bdf8" />
      <line x1="18" y1="68" x2="37" y2="57" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="36,54 40,59 43,53" fill="#f97316" />
      <line x1="82" y1="68" x2="63" y2="57" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />
      <polygon points="64,54 60,59 57,53" fill="#06b6d4" />
      <circle cx="50" cy="50" r="14" fill="url(#ukReactorCore)" />
      <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
    </svg>
  );

  // DESIGN 3: THE DUAL KINETIC VORTEX (Urja Molten & Cyan Arc Intertwined)
  const renderFlame = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform duration-300 group-hover:scale-105">
      <defs>
        <linearGradient id="ukFlameOrange" x1="0%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#b91c1c" />
          <stop offset="40%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
        <linearGradient id="ukFlameCyan" x1="100%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#a5f3fc" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill="#070a0f" stroke="rgba(249, 115, 22, 0.25)" strokeWidth="2" />
      <path d="M32 78 C24 64 25 44 38 32 C42 42 45 46 50 52 C45 62 42 70 32 78 Z" fill="url(#ukFlameOrange)" />
      <path d="M68 78 C76 64 75 44 62 32 C58 42 55 46 50 52 C55 62 58 70 68 78 Z" fill="url(#ukFlameCyan)" />
      <path d="M50 12 L55 35 L50 30 L45 35 Z" fill="#ffffff" />
      <circle cx="50" cy="52" r="5" fill="#ffffff" />
      <circle cx="50" cy="52" r="10" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );

  // DESIGN 4: THE UK INDUSTRIAL MONOGRAM (Interlocked U + K Steel Plate)
  const renderMonogram = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full transform transition-transform duration-300 group-hover:scale-105">
      <defs>
        <linearGradient id="ukMonoMetal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="ukMonoHearth" x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="84" height="84" rx="20" fill="#070a0f" stroke="url(#ukMonoMetal)" strokeWidth="3.5" />
      <path d="M24 26 V56 C24 68 34 74 44 74 C48 74 52 72 54 70 V60 C51 62 48 63 44 63 C39 63 35 59 35 53 V26 H24 Z" fill="url(#ukMonoHearth)" />
      <path d="M56 26 H67 V44 L77 26 H90 L76 49 L90 74 H77 L67 55 V74 H56 V26 Z" fill="#ffffff" />
      <circle cx="67" cy="49" r="3.5" fill="#38bdf8" />
    </svg>
  );

  const renderIcon = () => {
    switch (currentDesign) {
      case "reactor":
        return renderReactor();
      case "flame":
        return renderFlame();
      case "monogram":
        return renderMonogram();
      case "shield":
      default:
        return renderShield();
    }
  };

  const IconWrapper = (
    <div
      onClick={cycleDesign}
      className={cn(
        "relative flex items-center justify-center shrink-0 group select-none",
        interactive && "cursor-pointer",
        glow && "filter drop-shadow-[0_0_14px_rgba(249,115,22,0.45)]"
      )}
      style={{ width: iconSize, height: iconSize }}
      title={interactive ? `UrjaKavach Logo (${currentDesign.toUpperCase()}) — Click to cycle style` : undefined}
    >
      {renderIcon()}
    </div>
  );

  if (variant === "iconOnly") {
    return IconWrapper;
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2.5 font-sans", className)}>
        {IconWrapper}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-white text-base tracking-tight">
              URJA<span className="text-thermal-400">KAVACH</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-steel-400 tracking-wider uppercase">
            Decarb Cockpit
          </span>
        </div>
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col items-center text-center gap-3 font-sans", className)}>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-thermal-500/30 via-orange-500/20 to-cyanPulse-500/30 rounded-full blur-2xl opacity-70 animate-pulse" />
          {IconWrapper}
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-heading">
            URJA<span className="bg-gradient-to-r from-thermal-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">KAVACH</span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-cyanPulse-400 tracking-widest uppercase mt-1">
            Pyrometallurgical Carbon & Energy Shield • UrjaKavach Digital Twin
          </p>
        </div>
      </div>
    );
  }

  // Default Full Variant (Navbar & Header)
  return (
    <div className={cn("flex items-center gap-3 font-sans group select-none", className)}>
      {IconWrapper}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-black tracking-tight text-white text-lg">
            URJA<span className="text-thermal-400">KAVACH</span>
          </span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            Decarb Shield
          </span>
        </div>
        <span className="text-[11px] font-medium text-steel-400 tracking-tight leading-none">
          Pyrometallurgical Carbon & Energy Cockpit
        </span>
      </div>
    </div>
  );
}

export default UrjaKavachLogo;