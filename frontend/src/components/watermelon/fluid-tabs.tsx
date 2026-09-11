"use client";

import React, { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface FluidTabItem {
  id: string;
  label: string;
  badge?: string;
  icon?: ReactNode;
}

export interface FluidTabsProps {
  tabs: FluidTabItem[];
  defaultActive?: string;
  activeId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function FluidTabs({
  tabs,
  defaultActive,
  activeId: controlledActiveId,
  onChange,
  className,
}: FluidTabsProps) {
  const [internalActive, setInternalActive] = useState<string>(
    defaultActive || tabs[0]?.id || ""
  );

  const active = controlledActiveId !== undefined ? controlledActiveId : internalActive;

  const handleChange = (id: string) => {
    setInternalActive(id);
    onChange?.(id);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 p-1 rounded-2xl border border-steel-800 bg-obsidian-950/90 backdrop-blur-md shadow-inner",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            type="button"
            className="group relative flex items-center justify-center rounded-xl px-3.5 py-2 text-xs font-semibold outline-none transition-colors"
          >
            {isActive && (
              <motion.div
                layoutId="fluid-active-pill"
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 26,
                  mass: 0.8,
                }}
                className="absolute inset-0 rounded-xl bg-gradient-to-b from-steel-800/90 to-obsidian-800 border border-steel-700 shadow-md"
              />
            )}

            <div
              className={cn(
                "relative z-10 flex items-center gap-2 transition-colors duration-200",
                isActive ? "text-white font-bold" : "text-steel-400 group-hover:text-steel-200"
              )}
            >
              {tab.icon && (
                <motion.span
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className={cn(
                    "flex shrink-0 items-center justify-center transition-colors",
                    isActive ? "text-cyanPulse-400" : "text-steel-500 group-hover:text-steel-300"
                  )}
                >
                  {tab.icon}
                </motion.span>
              )}
              <span className="whitespace-nowrap tracking-wide text-xs">{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[9px] font-mono border",
                    isActive
                      ? "bg-thermal-500/20 border-thermal-500/40 text-thermal-300"
                      : "bg-steel-800/40 border-steel-700 text-steel-500"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default FluidTabs;
