"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { Zap, TrendingDown, Gauge, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export type EnergyCampaignRange = "7h" | "14h" | "30d";

export interface EnergyDataPoint {
  label: string;
  sec: number;
  sensibleCredit: number;
}

export interface EnergyOverviewWidgetProps {
  title?: string;
  subtitle?: string;
  defaultRange?: EnergyCampaignRange;
  onCtaClick?: () => void;
  className?: string;
}

const campaignDatasets: Record<EnergyCampaignRange, EnergyDataPoint[]> = {
  "7h": [
    { label: "Heat 1", sec: 442, sensibleCredit: 0 },
    { label: "Heat 2", sec: 410, sensibleCredit: 30 },
    { label: "Heat 3", sec: 388, sensibleCredit: 54 },
    { label: "Heat 4", sec: 364, sensibleCredit: 86 },
    { label: "Heat 5", sec: 359, sensibleCredit: 86 },
    { label: "Heat 6", sec: 362, sensibleCredit: 86 },
    { label: "Heat 7", sec: 356, sensibleCredit: 86 },
  ],
  "14h": [
    { label: "H-01", sec: 450, sensibleCredit: 0 },
    { label: "H-03", sec: 420, sensibleCredit: 40 },
    { label: "H-05", sec: 390, sensibleCredit: 60 },
    { label: "H-07", sec: 368, sensibleCredit: 86 },
    { label: "H-09", sec: 362, sensibleCredit: 86 },
    { label: "H-11", sec: 358, sensibleCredit: 86 },
    { label: "H-13", sec: 354, sensibleCredit: 86 },
    { label: "H-14", sec: 350, sensibleCredit: 86 },
  ],
  "30d": [
    { label: "W1", sec: 435, sensibleCredit: 20 },
    { label: "W2", sec: 385, sensibleCredit: 75 },
    { label: "W3", sec: 365, sensibleCredit: 86 },
    { label: "W4", sec: 352, sensibleCredit: 86 },
  ],
};

function EnergyTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const secVal = payload[0]?.value;
  return (
    <div className="bg-obsidian-950/95 border border-steel-700 p-2.5 rounded-xl shadow-xl backdrop-blur-md">
      <p className="text-steel-400 text-xs font-mono">{label}</p>
      <p className="text-white text-sm font-bold font-mono mt-0.5">
        {secVal} <span className="text-xs text-steel-400">kWh/t</span>
      </p>
      <p className="text-emerald-400 text-[10px] font-mono mt-0.5 flex items-center gap-1">
        <span>-86 kWh/t Sensible Credit Applied</span>
      </p>
    </div>
  );
}

export function EnergyTrendWidget({
  title = "Specific Energy Consumption (SEC)",
  subtitle = "EAF Electrical Consumption and Hot Molten FeCr Heat Credit Curve",
  defaultRange = "7h",
  onCtaClick,
  className,
}: EnergyOverviewWidgetProps) {
  const [activeRange, setActiveRange] = useState<EnergyCampaignRange>(defaultRange);
  const data = campaignDatasets[activeRange];

  return (
    <div
      className={cn(
        "rounded-2xl border border-steel-800 bg-obsidian-900/90 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide text-white font-sans uppercase">
              {title}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-400">
              <Zap className="w-3 h-3" />
              Thermal Twin
            </span>
          </div>
          <p className="text-xs text-steel-400 mt-1 font-sans">{subtitle}</p>
        </div>

        <div className="flex items-center bg-obsidian-950 p-1 rounded-xl border border-steel-800 shrink-0">
          {(["7h", "14h", "30d"] as EnergyCampaignRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={cn(
                "px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-all",
                activeRange === range
                  ? "bg-steel-800 text-white shadow-sm"
                  : "text-steel-400 hover:text-white"
              )}
            >
              {range === "7h" ? "7 Heats" : range === "14h" ? "14 Heats" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
          356 <span className="text-base font-normal text-steel-400">kWh/t</span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
          <TrendingDown className="w-3.5 h-3.5" />
          -86 kWh/t (-19.1%) Hot Charging
        </span>
      </div>

      <div className="mt-4 h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
            />
            <YAxis
              domain={[320, 480]}
              axisLine={{ stroke: "#334155" }}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 9 }}
              unit="k"
            />
            <Tooltip content={<EnergyTooltip />} />
            <Area
              type="monotone"
              dataKey="sec"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fill="url(#energyGrad)"
              dot={{ fill: "#f59e0b", r: 3 }}
              activeDot={{ fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2, r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-3 border-t border-steel-800/80 grid grid-cols-3 gap-2 text-left">
        <div className="p-2 rounded-xl bg-obsidian-950/60 border border-steel-800/50">
          <div className="flex items-center gap-1.5 text-steel-400 text-[10px]">
            <Gauge className="w-3 h-3 text-cyanPulse-400" />
            <span>Avg SEC</span>
          </div>
          <div className="text-white text-xs font-bold font-mono mt-0.5">368 kWh/t</div>
        </div>

        <div className="p-2 rounded-xl bg-obsidian-950/60 border border-steel-800/50">
          <div className="flex items-center gap-1.5 text-steel-400 text-[10px]">
            <Flame className="w-3 h-3 text-thermal-400" />
            <span>Power-On</span>
          </div>
          <div className="text-white text-xs font-bold font-mono mt-0.5">42.5 min/heat</div>
        </div>

        <div className="p-2 rounded-xl bg-obsidian-950/60 border border-steel-800/50">
          <div className="flex items-center gap-1.5 text-steel-400 text-[10px]">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Electrodes</span>
          </div>
          <div className="text-white text-xs font-bold font-mono mt-0.5">1.38 kg/t</div>
        </div>
      </div>
    </div>
  );
}

export default EnergyTrendWidget;
