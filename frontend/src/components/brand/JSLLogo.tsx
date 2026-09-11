"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface JSLLogoProps {
  variant?: "mark" | "badge" | "full";
  className?: string;
  size?: number;
  showSubtitle?: boolean;
}

export function JSLLogo({
  variant = "badge",
  className,
  size = 28,
  showSubtitle = true,
}: JSLLogoProps) {
  // SVG Stainless Emblem
  const renderMark = () => (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
      className="shrink-0"
    >
      <defs>
        <linearGradient id="jslMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        <linearGradient id="jslBluePlate" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        <linearGradient id="jslThermalAccent" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>

      {/* Industrial Base Ingot Plate */}
      <rect x="3" y="3" width="42" height="42" rx="10" fill="url(#jslBluePlate)" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />

      {/* Twin Stainless Steel Flow Ribbon / JSL Monogram Silhouette */}
      <path
        d="M12 14 H22 V28 C22 33 18 35 14 35 C12 35 10 34.5 9 33.5"
        stroke="url(#jslMetalGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M23 20 C23 16 27 14 32 14 C36 14 39 16.5 39 20 C39 24 33 25 30 26 C26 27 24 29 24 33 C24 35 28 35 34 35"
        stroke="url(#jslMetalGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Orange Molten Thermal Spark Indicator Dot */}
      <circle cx="39" cy="33" r="2.5" fill="url(#jslThermalAccent)" />
    </svg>
  );

  if (variant === "mark") {
    return <div className={cn("inline-flex items-center", className)}>{renderMark()}</div>;
  }

  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border border-steel-700/60 bg-steel-900/80 px-2.5 py-1 backdrop-blur-sm shadow-sm select-none hover:border-steel-600 transition-colors",
          className
        )}
      >
        {renderMark()}
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs tracking-wider text-white">JSL</span>
            <span className="text-[10px] font-semibold text-steel-300">JINDAL STAINLESS</span>
          </div>
          {showSubtitle && (
            <span className="text-[9px] font-mono text-cyanPulse-400 tracking-tight">
              JAJPUR • HISAR • RAIGARH
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full Variant
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-xl border border-steel-700/70 bg-obsidian-900/90 p-2.5 backdrop-blur-md shadow-md select-none",
        className
      )}
    >
      {renderMark()}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm tracking-wide text-white">JINDAL STAINLESS</span>
          <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] font-mono font-bold text-cyan-400 border border-cyan-500/30">
            JSL TWIN
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-medium text-steel-400 mt-0.5">
            Target Melt Complex: Jajpur, Odisha (3.0 MTPA)
          </span>
        )}
      </div>
    </div>
  );
}

export default JSLLogo;
