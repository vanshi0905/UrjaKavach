"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  X,
  Sliders,
  Flame,
  Zap,
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CockpitActionItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onClick?: () => void;
}

export interface FloatingCockpitToolbarProps {
  onSelectPreset?: (presetId: string) => void;
  className?: string;
}

export function FloatingCockpitToolbar({
  onSelectPreset,
  className,
}: FloatingCockpitToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: CockpitActionItem[] = [
    {
      id: "baseline",
      title: "Statutory Baseline Preset",
      description: "Reset to 2.32 tCO2/t Indian BF-BOF benchmark",
      icon: <RotateCcw className="w-4 h-4 text-steel-400" />,
      badge: "2.32 t",
      onClick: () => onSelectPreset?.("baseline"),
    },
    {
      id: "jajpur_optimum",
      title: "Jajpur Hot FeCr Route",
      description: "Molten FeCr charging (-86 kWh/t & 72% scrap)",
      icon: <Flame className="w-4 h-4 text-thermal-400" />,
      badge: "Optimum",
      onClick: () => onSelectPreset?.("jajpur_optimum"),
    },
    {
      id: "max_scrap",
      title: "Max Scrap Circularity (92%)",
      description: "Push recycled alloy scrap to physical chemistry cap",
      icon: <Zap className="w-4 h-4 text-cyanPulse-400" />,
      badge: "0.91 tCO2",
      onClick: () => onSelectPreset?.("max_scrap"),
    },
    {
      id: "cbam_export",
      title: "CBAM & CCTS Audit Pack",
      description: "Export full verification dossier with Article 9 rules",
      icon: <FileSpreadsheet className="w-4 h-4 text-emerald-400" />,
      badge: "Audited",
      onClick: () => onSelectPreset?.("cbam_export"),
    },
  ];

  return (
    <div className={cn("fixed bottom-6 left-6 z-50 font-sans", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-3 w-80 rounded-2xl border border-steel-700/80 bg-obsidian-950/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-steel-800 pb-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyanPulse-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Cockpit Presets & Actions
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-steel-400 hover:text-white p-1 rounded-lg hover:bg-steel-800/50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5">
              {actions.map((act) => (
                <button
                  key={act.id}
                  onClick={() => {
                    act.onClick?.();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 p-2 rounded-xl text-left hover:bg-steel-900/80 border border-transparent hover:border-steel-700/60 transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-lg bg-obsidian-900 border border-steel-800 group-hover:border-steel-700 shrink-0">
                      {act.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-cyanPulse-300 transition-colors truncate">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-steel-400 truncate">
                        {act.description}
                      </div>
                    </div>
                  </div>
                  {act.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-steel-800/80 text-steel-300 shrink-0 border border-steel-700">
                      {act.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full border border-steel-700/80 bg-obsidian-900/90 px-4 py-3 shadow-xl backdrop-blur-md text-white hover:border-cyanPulse-500/50 hover:shadow-cyanPulse-500/20 transition-all"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-cyanPulse-400" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyanPulse-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyanPulse-500"></span>
          </span>
        </div>
        <span className="text-xs font-bold tracking-wide">Quick Actions</span>
      </motion.button>
    </div>
  );
}

export default FloatingCockpitToolbar;
