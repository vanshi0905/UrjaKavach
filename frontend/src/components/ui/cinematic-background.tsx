"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CinematicBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  showVideo?: boolean;
  intensity?: "subtle" | "medium" | "vivid";
}

export function CinematicBackground({
  className,
  children,
}: CinematicBackgroundProps) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-obsidian-950", className)}>
      {/* 1. Base Cinematic Furnace Photograph with Subtle Ken Burns Pan/Zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 will-change-transform animate-ken-burns scale-105 pointer-events-none"
        style={{
          backgroundImage: "url('/images/furnace-bg.jpg')",
          filter: "brightness(0.48) contrast(1.18) saturate(1.15)",
        }}
      />

      {/* 2. Deep Obsidian Ambient Gradients for Maximum Contrast and Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian-950/80 via-obsidian-950/45 to-obsidian-950 pointer-events-none" />

      {/* 3. Deep Thermal Vignette & Text-Readability Radial Mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(5, 7, 9, 0.25) 0%, rgba(5, 7, 9, 0.70) 75%, #050709 100%)",
        }}
      />

      {/* 4. Subtle Molten Orange Horizon Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-thermal-500/40 to-transparent pointer-events-none" />

      {/* 5. Foreground Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
