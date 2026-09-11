"use client";

import { Sparkles } from "lucide-react";
import { CalculatorInputs } from "@/lib/calculator";

export const OPEN_ASSISTANT_EVENT = "open-jsl-assistant";
export const SYNC_ASSISTANT_INPUTS_EVENT = "sync-jsl-assistant-inputs";
export const APPLY_COCKPIT_PARAMS_EVENT = "apply-cockpit-params";

export function dispatchApplyCockpitParams(params: Partial<CalculatorInputs>) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(APPLY_COCKPIT_PARAMS_EVENT, { detail: params }));
    window.dispatchEvent(new CustomEvent("APPLY_COCKPIT_PARAMS", { detail: params }));
  }
}

export interface OpenAssistantDetail {
  target?: string;
  query?: string;
  tab?: "chat" | "voice";
  mode?: "chat" | "voice";
  inputs?: CalculatorInputs;
}

export function triggerAssistant(detail: OpenAssistantDetail) {
  if (typeof window !== "undefined") {
    const tab = detail.tab || detail.mode || "chat";
    const mode = detail.mode || detail.tab || "chat";
    window.dispatchEvent(new CustomEvent(OPEN_ASSISTANT_EVENT, { detail: { ...detail, tab, mode } }));
  }
}

export function syncAssistantInputs(inputs: CalculatorInputs) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_ASSISTANT_INPUTS_EVENT, { detail: { inputs } }));
  }
}

interface InlineExplainButtonProps {
  target?: "total_co2_t" | "eaf_sec_kwh" | "cbam_tariff_eur" | "ccts_value_inr";
  query?: string;
  label?: string;
  variant?: "pill" | "icon" | "micro";
  className?: string;
  inputs?: CalculatorInputs;
}

export function InlineExplainButton({
  target,
  query,
  label = "Explain This (SHAP)",
  variant = "pill",
  className = "",
  inputs,
}: InlineExplainButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerAssistant({ target, query, tab: "chat", inputs });
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        title={label}
        className={`p-1 rounded-md text-steel-400 hover:text-thermal-300 hover:bg-thermal-500/10 transition-colors ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-thermal-400" />
      </button>
    );
  }

  if (variant === "micro") {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-[10px] font-semibold text-thermal-400 hover:text-thermal-300 hover:underline transition-all ${className}`}
      >
        <Sparkles className="w-2.5 h-2.5" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-thermal-500/10 border border-thermal-500/30 text-[10px] font-semibold text-thermal-300 hover:bg-thermal-500/20 hover:border-thermal-400 transition-all ${className}`}
    >
      <Sparkles className="w-3 h-3 text-thermal-400" />
      <span>{label}</span>
    </button>
  );
}
