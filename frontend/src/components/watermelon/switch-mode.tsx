"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SwitchModeProps {
  leftLabel?: string;
  rightLabel?: string;
  defaultMode?: "ccts" | "cbam";
  mode?: "ccts" | "cbam";
  onChange?: (mode: "ccts" | "cbam") => void;
  className?: string;
}

export function SwitchMode({
  leftLabel = "BEE India CCTS",
  rightLabel = "EU CBAM Article 9",
  defaultMode = "cbam",
  mode: controlledMode,
  onChange,
  className,
}: SwitchModeProps) {
  const [internalMode, setInternalMode] = useState<"ccts" | "cbam">(defaultMode);
  const currentMode = controlledMode !== undefined ? controlledMode : internalMode;

  const handleToggle = () => {
    const next = currentMode === "cbam" ? "ccts" : "cbam";
    setInternalMode(next);
    onChange?.(next);
  };

  return (
    <div className={cn("inline-flex items-center gap-2 font-sans", className)}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative flex items-center h-8 rounded-full border border-steel-700 bg-obsidian-950 p-1 cursor-pointer transition-all hover:border-steel-600 focus:outline-none"
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className={cn(
            "absolute h-6 rounded-full shadow-md z-0",
            currentMode === "cbam"
              ? "right-1 w-28 bg-gradient-to-r from-cyanPulse-600/80 to-cyanPulse-500 border border-cyanPulse-400/40"
              : "left-1 w-32 bg-gradient-to-r from-thermal-600/80 to-thermal-500 border border-thermal-400/40"
          )}
        />

        <div
          className={cn(
            "relative z-10 flex items-center justify-center gap-1.5 px-3 h-full text-[11px] font-bold transition-colors select-none",
            currentMode === "ccts" ? "text-white" : "text-steel-400 hover:text-steel-200"
          )}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>{leftLabel}</span>
        </div>

        <div
          className={cn(
            "relative z-10 flex items-center justify-center gap-1.5 px-3 h-full text-[11px] font-bold transition-colors select-none",
            currentMode === "cbam" ? "text-white" : "text-steel-400 hover:text-steel-200"
          )}
        >
          <Globe className="w-3 h-3" />
          <span>{rightLabel}</span>
        </div>
      </button>
    </div>
  );
}

export default SwitchMode;
