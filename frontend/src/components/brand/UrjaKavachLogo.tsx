"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface UrjaKavachLogoProps {
  variant?: "full" | "compact" | "iconOnly" | "hero";
  className?: string;
  iconSize?: number;
  glow?: boolean;
}

export function UrjaKavachLogo({
  variant = "compact",
  className,
  iconSize = 36,
  glow = true,
}: UrjaKavachLogoProps) {
  // Iconic Faceted Shield & Plasma Arc Emblem
  const renderEmblem = () => (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: iconSize, height: iconSize }}
      className="shrink-0 transform transition-all duration-300 group-hover:scale-105"
    >
      <defs>
        <linearGradient id="ukOuterShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="45%" stopColor="#ea580c" />
          <stop offset="85%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="ukInnerFacetGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#050709" />
        </linearGradient>
        <linearGradient id="ukFlameCoreGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#f97316" />
          <stop offset="85%" stopColor="#c2410c" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id="ukPlasmaArcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Outer Armor Bevel (Faceted Shield) */}
      <path
        d="M22 3 L38 9 V22 C38 31.5 31 38 22 41 C13 38 6 31.5 6 22 V9 L22 3 Z"
        fill="url(#ukInnerFacetGrad)"
        stroke="url(#ukOuterShieldGrad)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Subtle Inset Facet Line */}
      <path
        d="M22 7 L34 11.5 V21.5 C34 28.5 28.5 34 22 36.5 C15.5 34 10 28.5 10 21.5 V11.5 L22 7 Z"
        stroke="rgba(148, 163, 184, 0.28)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />

      {/* Pyrometallurgical Molten Urja Flame (Center Core) */}
      <path
        d="M22 13 C25.5 18 29 21.5 29 26.5 C29 30.5 25.8 33 22 33 C18.2 33 15 30.5 15 26.5 C15 22 19 18.5 22 13 Z"
        fill="url(#ukFlameCoreGrad)"
      />

      {/* Electric Arc Decarbonization Spark (Cyan Plasma Lightning) */}
      <path
        d="M23 16 L18.5 24 H22.5 L20.5 31 L26.5 22.5 H22.5 L23 16 Z"
        fill="url(#ukPlasmaArcGrad)"
        stroke="#ffffff"
        strokeWidth="0.6"
      />

      {/* Central Luminous Fusion Spark */}
      <circle cx="22" cy="23.5" r="1.5" fill="#ffffff" />
    </svg>
  );

  const IconWrapper = (
    <div
      className={cn(
        "relative flex items-center justify-center shrink-0 group select-none",
        glow && "filter drop-shadow-[0_0_12px_rgba(249,115,22,0.45)]"
      )}
    >
      {renderEmblem()}
    </div>
  );

  if (variant === "iconOnly") {
    return IconWrapper;
  }

  // Compact Variant (Standard for Navbar)
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3 font-sans select-none", className)}>
        {IconWrapper}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white text-base leading-tight">
              URJA<span className="text-thermal-400">KAVACH</span>
            </span>
          </div>
          <span className="text-[11px] font-medium text-steel-400 tracking-tight leading-tight">
            Carbon &amp; Energy Pyrometallurgical Cockpit
          </span>
        </div>
      </div>
    );
  }

  // Hero Variant
  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col items-center text-center gap-3 font-sans select-none", className)}>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-thermal-500/30 via-orange-500/20 to-cyanPulse-500/30 rounded-full blur-2xl opacity-70 animate-pulse" />
          {IconWrapper}
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-heading">
            URJA<span className="bg-gradient-to-r from-thermal-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">KAVACH</span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-cyanPulse-400 tracking-widest uppercase mt-1">
            Pyrometallurgical Decarbonization Shield • Digital Twin
          </p>
        </div>
      </div>
    );
  }

  // Full Variant
  return (
    <div className={cn("flex items-center gap-3.5 font-sans select-none", className)}>
      {IconWrapper}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-tight text-white text-lg">
            URJA<span className="text-thermal-400">KAVACH</span>
          </span>
          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            Decarb Shield
          </span>
        </div>
        <span className="text-[11px] font-medium text-steel-400 tracking-tight">
          Pyrometallurgical Carbon &amp; Energy Cockpit
        </span>
      </div>
    </div>
  );
}

export default UrjaKavachLogo;