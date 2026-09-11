"use client";

import React, { useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  disabled?: boolean;
}

export interface Select1Props extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  options?: SelectOption[];
  onChange?: (value: string) => void;
  className?: string;
  selectClassName?: string;
  children?: React.ReactNode;
}

export function Select1({
  label,
  description,
  badge,
  badgeColor = "text-thermal-400 bg-thermal-500/10 border-thermal-500/30",
  options,
  value,
  onChange,
  id,
  className,
  selectClassName,
  children,
  ...props
}: Select1Props) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className={cn("w-full space-y-1.5 font-sans", className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-steel-300 block select-none"
          >
            {label}
          </label>
          {badge && (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-mono font-semibold tracking-wide",
                badgeColor
              )}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Select Container with Custom Watermelon UI Chevron */}
      <div className="relative group">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full appearance-none rounded-xl border border-steel-700/80 bg-obsidian-950 px-3.5 py-2.5 pr-10",
            "text-xs font-medium text-white shadow-inner transition-all duration-200 cursor-pointer",
            "hover:border-steel-600 focus:border-thermal-500 focus:ring-2 focus:ring-thermal-500/20 focus:outline-none",
            "[&_option]:bg-obsidian-950 [&_option]:text-white [&_option]:py-1.5",
            selectClassName
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  className="bg-obsidian-950 text-white font-sans py-2"
                >
                  {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ""}
                </option>
              ))
            : children}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-steel-400 group-hover:text-steel-200 transition-colors">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-steel-500 leading-normal block">
          {description}
        </p>
      )}
    </div>
  );
}

export default Select1;
