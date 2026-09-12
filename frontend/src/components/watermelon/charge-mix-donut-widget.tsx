"use client";

import React, { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MetallicFeedItem {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  percentage: number;
  fill: string;
  badge?: string;
}

export interface ChargeMixDonutWidgetProps {
  title?: string;
  subtitle?: string;
  data?: MetallicFeedItem[];
  totalMassKg?: number;
  className?: string;
}

const defaultChargeMix: MetallicFeedItem[] = [
  {
    id: "ss_scrap",
    label: "Recycled SS Scrap (J304 / J316)",
    value: "680 kg/t",
    numericValue: 680,
    percentage: 68.0,
    fill: "#06b6d4",
    badge: "Circular",
  },
  {
    id: "fecr",
    label: "Molten / Solid Ferrochrome",
    value: "210 kg/t",
    numericValue: 210,
    percentage: 21.0,
    fill: "#f97316",
    badge: "-86 kWh/t credit",
  },
  {
    id: "gas_dri",
    label: "Gas-Based Direct Reduced Iron",
    value: "70 kg/t",
    numericValue: 70,
    percentage: 7.0,
    fill: "#a855f7",
    badge: "Low Gangue",
  },
  {
    id: "nickel",
    label: "Class-1 Pure Nickel / FeNi",
    value: "25 kg/t",
    numericValue: 25,
    percentage: 2.5,
    fill: "#3b82f6",
    badge: "High Purity",
  },
  {
    id: "fluxes",
    label: "Slag Formers (Burnt Lime / Doloma)",
    value: "15 kg/t",
    numericValue: 15,
    percentage: 1.5,
    fill: "#10b981",
    badge: "Basicity B2 > 1.8",
  },
];

export function ChargeMixDonutWidget({
  title = "Metallic Charge Architecture",
  subtitle = "Optimized burden distribution per metric tonne of crude stainless steel",
  data = defaultChargeMix,
  totalMassKg = 1000,
  className,
}: ChargeMixDonutWidgetProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      name: item.label,
    }));
  }, [data]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-steel-800 bg-obsidian-900/90 p-5 shadow-xl backdrop-blur-md flex flex-col justify-between overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-wide text-white font-sans uppercase">
              {title}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyanPulse-500/10 border border-cyanPulse-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-cyanPulse-400">
              <Sparkles className="w-3 h-3" />
              HiGHS Solved
            </span>
          </div>
          <p className="text-xs text-steel-400 mt-1 font-sans">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6 my-auto">
        <div className="relative h-44 w-44 shrink-0 mx-auto min-h-[176px]">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="68%"
                  outerRadius="96%"
                  paddingAngle={4}
                  dataKey="numericValue"
                  stroke="none"
                  cornerRadius={5}
                >
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={entry.fill}
                    className="cursor-pointer transition-all duration-300 outline-none hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as MetallicFeedItem;
                    return (
                      <div className="border border-steel-700 bg-obsidian-950/95 p-2.5 rounded-xl shadow-xl backdrop-blur-md min-w-[150px]">
                        <span className="text-steel-400 text-[10px] font-mono block uppercase">
                          {item.label}
                        </span>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-white text-xs font-bold font-mono">
                            {item.value}
                          </span>
                          <span className="text-cyanPulse-400 text-xs font-bold font-mono">
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center text-steel-500 font-mono text-xs">
            Loading Burden...
          </div>
        )}

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase tracking-wider text-steel-400 font-mono">
              Total Yield
            </span>
            <span className="text-lg font-bold font-mono text-white leading-none mt-0.5">
              {totalMassKg.toLocaleString()}
            </span>
            <span className="text-[9px] text-steel-500 font-mono">kg / t steel</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          {chartData.map((item) => (
            <div
              key={item.id}
              className="flex w-full items-center justify-between gap-3 p-2 rounded-xl bg-obsidian-950/60 border border-steel-800/60 hover:border-steel-700 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="h-3 w-3 shrink-0 rounded-xs"
                  style={{ backgroundColor: item.fill }}
                />
                <div className="truncate">
                  <span className="text-white text-xs font-medium block truncate">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-[9px] text-steel-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-white text-xs font-mono font-bold block tabular-nums">
                  {item.value}
                </span>
                <span className="text-cyanPulse-400 text-[10px] font-mono font-semibold block">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChargeMixDonutWidget;
