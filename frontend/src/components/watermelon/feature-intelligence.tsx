"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  ShieldCheck,
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FeatureIntelligence({ className }: { className?: string }) {
  return (
    <section className={cn("flex w-full flex-col items-center justify-center px-4 sm:px-6 py-10 md:py-14 font-sans relative", className)}>
      {/* Top Header */}
      <div className="text-center max-w-3xl mb-10 sm:mb-12 space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-thermal-500/30 bg-thermal-500/10 px-3.5 py-1 text-xs font-semibold text-thermal-300">
          <Sparkles className="h-3.5 w-3.5 text-thermal-400" />
          <span>REAL-TIME METALLURGICAL INTELLIGENCE</span>
        </span>
        <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-heading">
          Understand Faster, Decarbonize Smarter
        </h2>
        <p className="text-steel-400 text-sm sm:text-base leading-relaxed">
          High-frequency melt-shop telemetry, closed-loop tramp element containment, and statutory carbon accounting — with sub-2ms algorithmic responsiveness.
        </p>
      </div>

      {/* 3-Card Grid (feature-4 layout) */}
      <div className="grid w-full max-w-6xl items-stretch gap-6 md:grid-cols-3">
        {/* Card 1: EAF Arc & Enthalpy Stream */}
        <Card className="bg-obsidian-900/70 border-steel-800/80 flex h-full flex-col rounded-[32px] sm:rounded-[40px] p-0 shadow-xl hover:border-thermal-500/40 transition-all duration-300 group">
          <CardContent className="flex h-full flex-col gap-6 sm:gap-8 p-5 sm:p-6">
            <div className="text-center space-y-2">
              <h3 className="text-white text-xl sm:text-2xl font-bold font-heading group-hover:text-thermal-300 transition-colors">
                Furnace Enthalpy Stream
              </h3>
              <p className="text-steel-400 text-xs sm:text-sm leading-relaxed">
                Track real-time specific electrical consumption (SEC) and hot-metal sensible heat transfer across Jajpur EAF operations in real time.
              </p>
            </div>

            <div className="bg-obsidian-950/90 border border-steel-800/80 flex min-h-[360px] flex-col justify-between rounded-3xl p-5 shadow-inner">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-steel-400 flex items-center gap-1.5 text-xs font-medium">
                  <Activity className="text-thermal-400 h-4 w-4" />
                  EAF Heat Telemetry
                </span>
                <span className="text-thermal-400 text-xs font-mono flex items-center gap-1 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-thermal-400 animate-pulse" />
                  Live SAF Ladle
                </span>
              </div>

              {/* Big Metric */}
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <div className="text-white text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                    487 <span className="text-xs font-sans text-steel-400 font-normal">kWh/t</span>
                  </div>
                  <div className="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    -113 kWh/t Credit
                  </div>
                </div>
                <p className="text-[11px] text-steel-500 font-mono">
                  1,650°C Molten FeCr Direct Charging
                </p>
              </div>

              {/* 7-Bar Chart (Heat progression) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-steel-500">
                  <span>Heat #1 (Cold FeCr)</span>
                  <span>Heat #7 (100% Hot FeCr)</span>
                </div>
                <div className="flex h-20 items-end gap-2 bg-obsidian-900/60 p-2 rounded-xl border border-steel-900">
                  {[
                    { h: 100, val: "600" },
                    { h: 93, val: "580" },
                    { h: 84, val: "545" },
                    { h: 77, val: "520" },
                    { h: 72, val: "505" },
                    { h: 63, val: "487" },
                    { h: 63, val: "487" },
                  ].map((bar, i) => (
                    <div
                      key={i}
                      className="group/bar relative flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <div
                        className={cn(
                          "w-full rounded-md transition-all duration-300",
                          i >= 5
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                            : "bg-gradient-to-t from-thermal-600 to-thermal-400/80"
                        )}
                        style={{ height: `${bar.h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Latency & Error Stat Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
                <div className="bg-obsidian-900/80 border border-steel-800/80 rounded-xl p-2.5">
                  <div className="text-steel-400 flex items-center gap-1 text-[11px] mb-1">
                    <Clock className="h-3 w-3 text-cyanPulse-400" />
                    Latency
                  </div>
                  <div className="text-white font-mono font-bold text-base">
                    1.6 ms
                  </div>
                  <span className="text-[10px] text-steel-500 block">Sub-4ms Edge LP</span>
                </div>

                <div className="bg-obsidian-900/80 border border-steel-800/80 rounded-xl p-2.5">
                  <div className="text-steel-400 flex items-center gap-1 text-[11px] mb-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Closure Error
                  </div>
                  <div className="text-emerald-400 font-mono font-bold text-base">
                    0.0000
                  </div>
                  <span className="text-[10px] text-steel-500 block">Exact SHAP Sum</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Tramp Element Containment */}
        <Card className="bg-obsidian-900/70 border-steel-800/80 flex h-full flex-col rounded-[32px] sm:rounded-[40px] p-0 shadow-xl hover:border-cyanPulse-500/40 transition-all duration-300 group">
          <CardContent className="flex h-full flex-col gap-6 sm:gap-8 p-5 sm:p-6">
            <div className="text-center space-y-2">
              <h3 className="text-white text-xl sm:text-2xl font-bold font-heading group-hover:text-cyanPulse-300 transition-colors">
                Tramp Element Ceilings
              </h3>
              <p className="text-steel-400 text-xs sm:text-sm leading-relaxed">
                Enforce thermodynamic non-removal boundaries for copper, tin, and phosphorus to eliminate hot-shortness surface tearing.
              </p>
            </div>

            <div className="bg-obsidian-950/90 border border-steel-800/80 flex min-h-[360px] flex-col justify-between rounded-3xl p-5 shadow-inner">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-steel-400 flex items-center gap-1.5 text-xs font-medium">
                  <ShieldCheck className="text-cyanPulse-400 h-4 w-4" />
                  Tramp Audit [J304]
                </span>
                <span className="text-steel-400 text-xs font-mono">
                  43 Grades Active
                </span>
              </div>

              {/* Radial Donut Gauge */}
              <div className="flex items-center justify-center my-1">
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-steel-800/80"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-cyanPulse-400 transition-all duration-500"
                      strokeDasharray="68, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-white font-mono font-bold text-lg leading-none">
                      0.27%
                    </span>
                    <span className="text-[9px] text-steel-400 font-mono mt-0.5">
                      [Cu] / 0.40%
                    </span>
                    <span className="text-[8px] text-emerald-400 font-semibold uppercase mt-0.5">
                      68% Safe
                    </span>
                  </div>
                </div>
              </div>

              {/* Tramp Breakdown List */}
              <div className="space-y-2">
                {[
                  { name: "Tramp Copper [Cu]", actual: "0.272%", limit: "<= 0.400%", status: "Nominal" },
                  { name: "Tramp Tin [Sn]", actual: "0.018%", limit: "<= 0.030%", status: "Nominal" },
                  { name: "Phosphorus [P]", actual: "0.031%", limit: "<= 0.040%", status: "eta_P = 0.99" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs bg-obsidian-900/60 px-2.5 py-1.5 rounded-lg border border-steel-900"
                  >
                    <span className="text-steel-300 font-mono text-[11px]">{item.name}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-white font-semibold text-[11px]">{item.actual}</span>
                      <span className="text-[10px] text-steel-500">({item.limit})</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Segmented Metallics Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-steel-400">
                  <span>Circular Scrap (65%)</span>
                  <span>Gas-DRI (25%)</span>
                  <span>Alloys (10%)</span>
                </div>
                <div className="flex gap-1.5 h-2 w-full">
                  <div className="bg-cyanPulse-400 h-2 rounded-full flex-[65]" title="Scrap 65%" />
                  <div className="bg-emerald-400 h-2 rounded-full flex-[25]" title="Gas-DRI 25%" />
                  <div className="bg-amber-400 h-2 rounded-full flex-[10]" title="Alloys 10%" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Compliance & EBITDA Momentum */}
        <Card className="bg-obsidian-900/70 border-steel-800/80 flex h-full flex-col rounded-[32px] sm:rounded-[40px] p-0 shadow-xl hover:border-emerald-500/40 transition-all duration-300 group">
          <CardContent className="flex h-full flex-col gap-6 sm:gap-8 p-5 sm:p-6">
            <div className="text-center space-y-2">
              <h3 className="text-white text-xl sm:text-2xl font-bold font-heading group-hover:text-emerald-300 transition-colors">
                Compliance & EBITDA
              </h3>
              <p className="text-steel-400 text-xs sm:text-sm leading-relaxed">
                Monitor real-time decarbonization pace, Indian BEE CCTS certificate surplus, and European CBAM Article 9 deductions.
              </p>
            </div>

            <div className="bg-obsidian-950/90 border border-steel-800/80 flex min-h-[360px] flex-col justify-between rounded-3xl p-5 shadow-inner">
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-steel-400 flex items-center gap-1.5 text-xs font-medium">
                  <BarChart3 className="text-emerald-400 h-4 w-4" />
                  Abatement Momentum
                </span>
                <span className="text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-full px-2 py-0.5 text-xs font-mono font-bold">
                  +₹38.2 Cr/yr
                </span>
              </div>

              {/* Big Metric */}
              <div className="space-y-1">
                <div className="text-white text-4xl sm:text-5xl font-black font-mono tracking-tight">
                  -67.2%
                </div>
                <p className="text-[11px] text-steel-400 font-mono">
                  Net CO₂ Intensity (4.17 → 1.37 tCO₂/t)
                </p>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                {[
                  { label: "Circular Scrap Abatement", value: 94.6, color: "bg-emerald-400" },
                  { label: "Renewable PPA Displacement", value: 85.0, color: "bg-cyanPulse-400" },
                  { label: "Molten FeCr Heat Credit", value: 76.0, color: "bg-thermal-400" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-steel-400 flex justify-between text-xs font-mono">
                      <span className="text-[11px]">{item.label}</span>
                      <span className="text-white font-semibold text-[11px]">{item.value}%</span>
                    </div>
                    <div className="bg-obsidian-900 h-2 w-full rounded-full overflow-hidden border border-steel-900">
                      <div
                        className={cn("h-2 rounded-full transition-all duration-500", item.color)}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Trend Pill */}
              <div className="bg-obsidian-900/80 border border-steel-800/80 flex items-center justify-between rounded-xl p-3 text-xs">
                <span className="text-steel-400 flex items-center gap-1.5 text-[11px]">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>EU CBAM Tariff Exposure</span>
                </span>
                <span className="text-emerald-400 font-mono font-bold text-xs">
                  €0.00/t (Art. 9 Insulated)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
