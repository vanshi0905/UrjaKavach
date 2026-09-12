"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface JSLLogoProps {
  variant?: "mark" | "badge" | "full" | "arch";
  className?: string;
  size?: number;
  showSubtitle?: boolean;
}

export function JSLLogo({
  variant = "badge",
  className,
  size = 22,
  showSubtitle = true,
}: JSLLogoProps) {
  // Official JSL Dual Arch
  if (variant === "arch") {
    return (
      <img
        src="/images/jsl-official-arch.png"
        alt="Jindal Stainless Emblem"
        style={{ height: size }}
        className={cn("w-auto object-contain shrink-0 select-none", className)}
      />
    );
  }

  // Official JSL Wordmark + Arch
  if (variant === "mark") {
    return (
      <img
        src="/images/jsl-official-mark.png"
        alt="Jindal Stainless (JSL)"
        style={{ height: size }}
        className={cn("w-auto object-contain shrink-0 select-none", className)}
      />
    );
  }

  // Full Official Brand Lockup (JSL + Arch + JINDAL STAINLESS)
  if (variant === "full") {
    return (
      <div className={cn("inline-flex items-center gap-3 select-none", className)}>
        <img
          src="/images/jsl-official-logo.png"
          alt="Jindal Stainless Limited"
          style={{ height: size * 1.5 }}
          className="w-auto object-contain shrink-0"
        />
        {showSubtitle && (
          <span className="text-[10px] font-mono text-cyanPulse-400 border-l border-steel-800 pl-2">
            JAJPUR • HISAR • RAIGARH
          </span>
        )}
      </div>
    );
  }

  // Default Badge Variant (Official Mark in polished container)
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-steel-800/90 bg-obsidian-900/90 px-2.5 py-1 backdrop-blur-sm shadow-sm select-none hover:border-steel-700 transition-colors",
        className
      )}
    >
      <img
        src="/images/jsl-official-mark.png"
        alt="Jindal Stainless Limited (JSL)"
        style={{ height: size }}
        className="w-auto object-contain shrink-0"
      />
      {showSubtitle && (
        <span className="text-[9px] font-mono text-cyanPulse-400 tracking-tight border-l border-steel-800 pl-2 hidden sm:inline-block">
          JAJPUR • HISAR • RAIGARH
        </span>
      )}
    </div>
  );
}

export default JSLLogo;

