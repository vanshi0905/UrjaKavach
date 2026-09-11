"use client";

import React, { useMemo } from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

export interface MathFormulaProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
  equationNumber?: number | string;
}

export function MathFormula({
  latex,
  displayMode = true,
  className,
  equationNumber,
}: MathFormulaProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return latex;
    }
  }, [latex, displayMode]);

  if (displayMode) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-between w-full overflow-x-auto py-2.5 px-4 my-2 rounded-xl bg-obsidian-900/90 border border-steel-800/90 text-steel-100 shadow-inner group/math",
          className
        )}
      >
        <div
          className="flex-1 text-center text-sm sm:text-base leading-relaxed tracking-wide overflow-x-auto py-0.5 text-cyan-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {equationNumber !== undefined && (
          <span className="font-mono text-[11px] text-steel-400 pl-3 shrink-0 select-none opacity-80 group-hover/math:opacity-100 transition-opacity">
            ({equationNumber})
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={cn("inline-block text-steel-100 mx-1 align-baseline", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
