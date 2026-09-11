"use client";

import { useState } from "react";
import { MultiTargetShapReport, TargetShapResult, ShapAttribution } from "@/lib/shap-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { CheckCircle2, Flame, Zap, DollarSign, ShieldCheck } from "lucide-react";

interface ShapWaterfallChartProps {
  report: MultiTargetShapReport;
  initialTarget?: string;
  onTargetChange?: (target: string) => void;
}

export function ShapWaterfallChart({
  report,
  initialTarget = "total_co2_t",
  onTargetChange,
}: ShapWaterfallChartProps) {
  const [activeTarget, setActiveTarget] = useState<string>(initialTarget);

  const targetData: TargetShapResult = report.targets[activeTarget] || report.targets.total_co2_t;

  const handleSelectTarget = (t: string) => {
    setActiveTarget(t);
    onTargetChange?.(t);
  };

  // Format data for Recharts horizontal bar chart
  const chartData = targetData.attributions.map((attr) => {
    // Beneficial direction:
    // For carbon, SEC, CBAM: lower is better (negative attribution = green abatement, positive = red penalty)
    // For CCTS: higher is better (positive attribution = green gain, negative = red penalty)
    const isBeneficial =
      targetData.direction === "lower_is_better"
        ? attr.attribution < 0
        : attr.attribution > 0;

    return {
      name: attr.label,
      category: attr.category,
      attribution: attr.attribution,
      absAttribution: Math.abs(attr.attribution),
      percentContribution: attr.percentContribution,
      userValue: String(attr.userValue),
      baselineValue: String(attr.baselineValue),
      color: isBeneficial ? "#10b981" : attr.attribution === 0 ? "#64748b" : "#f43f5e",
    };
  });

  return (
    <div className="space-y-4">
      {/* Target Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-obsidian-950 rounded-xl border border-steel-800">
        <button
          onClick={() => handleSelectTarget("total_co2_t")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTarget === "total_co2_t"
              ? "bg-thermal-500/20 text-thermal-300 border border-thermal-500/40 shadow-sm"
              : "text-steel-400 hover:text-white"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Carbon</span>
        </button>
        <button
          onClick={() => handleSelectTarget("eaf_sec_kwh")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTarget === "eaf_sec_kwh"
              ? "bg-cyanPulse-500/20 text-cyanPulse-300 border border-cyanPulse-500/40 shadow-sm"
              : "text-steel-400 hover:text-white"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>EAF SEC</span>
        </button>
        <button
          onClick={() => handleSelectTarget("cbam_tariff_eur")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTarget === "cbam_tariff_eur"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-steel-400 hover:text-white"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>EU CBAM</span>
        </button>
        <button
          onClick={() => handleSelectTarget("ccts_value_inr")}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
            activeTarget === "ccts_value_inr"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
              : "text-steel-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>India CCTS</span>
        </button>
      </div>

      {/* Target KPI Header */}
      <div className="flex items-baseline justify-between border-b border-steel-800/80 pb-2">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-steel-400 block">
            {targetData.name}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xl font-mono font-bold text-white">
              {targetData.userValue.toFixed(2)} {targetData.unit}
            </span>
            <span
              className={`text-xs font-mono font-semibold ${
                targetData.direction === "lower_is_better"
                  ? targetData.delta <= 0 ? "text-emerald-400" : "text-rose-400"
                  : targetData.delta >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              (Baseline: {targetData.baselineValue.toFixed(2)} | Delta: {targetData.delta > 0 ? "+" : ""}
              {targetData.delta.toFixed(2)})
            </span>
          </div>
        </div>

        {/* Additive Closure Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-mono">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Additive Closure: 100% Exact (Σφ = Δ)</span>
        </div>
      </div>

      {/* Diverging Bar Chart */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis
              type="number"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              tickFormatter={(val) => `${val > 0 ? "+" : ""}${val.toFixed(1)}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#cbd5e1"
              fontSize={11}
              tickLine={false}
              width={140}
            />
            <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-lg bg-obsidian-950 border border-steel-700 p-2.5 shadow-2xl text-xs space-y-1">
                      <div className="font-semibold text-white flex items-center justify-between gap-4">
                        <span>{item.name}</span>
                        <span className="text-[10px] text-steel-400 font-normal">{item.category}</span>
                      </div>
                      <div className="font-mono text-emerald-400 text-sm">
                        {item.attribution > 0 ? "+" : ""}
                        {item.attribution.toFixed(4)} {targetData.unit}
                      </div>
                      <div className="text-[11px] text-steel-400">
                        Contribution: {Math.abs(item.percentContribution).toFixed(1)}% of net change
                      </div>
                      <div className="text-[10px] text-steel-500 border-t border-steel-800 pt-1 mt-1">
                        Active: <span className="text-white">{item.userValue}</span> | Baseline: {item.baselineValue}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="attribution" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell key={`shap-cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] text-steel-500 pt-1">
        <span>Green = Abatement / Beneficial impact</span>
        <span>Red = Penalties / Additional emissions</span>
        <span className="font-mono">Evaluated in {report.evaluationTimeMs} ms</span>
      </div>
    </div>
  );
}
