"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Coins,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MetricIconType = "coins" | "shield" | "zap" | "trending";

export interface MetricItem {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  changePercent: number;
  icon: MetricIconType;
}

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  status: string;
  statusColor: string;
}

export interface PeriodData {
  id: string;
  label: string;
  metrics: MetricItem[];
  activities: ActivityItem[];
}

const DEFAULT_PERIODS: PeriodData[] = [
  {
    id: "annual",
    label: "FY 2026-27 Projection",
    metrics: [
      {
        id: "ccts",
        label: "India CCTS Net EBITDA",
        value: "+₹38.2 Cr",
        sublabel: "380,000 CCCs @ ₹1,000/t",
        changePercent: 14.8,
        icon: "coins",
      },
      {
        id: "cbam",
        label: "EU CBAM Exposure",
        value: "€0.00 /t",
        sublabel: "100% SEFA & Art. 9 Hedged",
        changePercent: -100,
        icon: "shield",
      },
      {
        id: "sec",
        label: "Furnace Power Savings",
        value: "-₹18.4 Cr",
        sublabel: "-113 kWh/t Hot SAF FeCr",
        changePercent: -22.6,
        icon: "zap",
      },
      {
        id: "co2",
        label: "J304 Net Abatement",
        value: "-67.2%",
        sublabel: "2.87 → 0.94 tCO2/t",
        changePercent: 67.2,
        icon: "trending",
      },
    ],
    activities: [
      {
        id: "act-1",
        title: "Jajpur EAF Heat #8492: Scrap locked at 65% ([Cu] = 0.28%)",
        timestamp: "Just now",
        status: "Verified Safe",
        statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      },
      {
        id: "act-2",
        title: "315.6 MW Hybrid Wind-Solar PPA dispatched at 85% blend",
        timestamp: "4m ago",
        status: "Zero Penalties",
        statusColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      },
      {
        id: "act-3",
        title: "BEE Carbon Credit surplus banked: +380,000 CCCs registered",
        timestamp: "12m ago",
        status: "+₹38 Cr Group EBITDA",
        statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      },
    ],
  },
];

const metricIconMap: Record<MetricIconType, React.ElementType> = {
  coins: Coins,
  shield: ShieldCheck,
  zap: Zap,
  trending: TrendingUp,
};

export function CommercialCta({ className }: { className?: string }) {
  const [periods] = useState<PeriodData[]>(DEFAULT_PERIODS);
  const activeData = periods[0];

  return (
    <section className={cn("w-full py-8 md:py-12 bg-obsidian-950 border-t border-steel-800/80 font-sans", className)}>
      <div className="group relative isolate mx-auto flex h-auto min-h-[460px] max-w-7xl items-center justify-center overflow-hidden rounded-3xl border border-steel-800/90 bg-gradient-to-br from-obsidian-950 via-steel-950/80 to-obsidian-900 px-4 py-10 sm:px-8 md:px-12 lg:h-[490px]">
        {/* Molten Glow Polygons (cta-4 design) */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-[max(-7rem,calc(50%-48rem))] -z-10 -translate-y-1/2 transform-gpu blur-3xl pointer-events-none"
        >
          <div
            style={{
              clipPath:
                "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
            }}
            className="aspect-[577/310] w-[32rem] bg-gradient-to-r from-thermal-500/20 via-orange-500/15 to-amber-500/20 opacity-40"
          />
        </div>

        <div
          aria-hidden="true"
          className="absolute top-1/2 right-[max(-7rem,calc(50%-48rem))] -z-10 -translate-y-1/2 transform-gpu blur-3xl pointer-events-none"
        >
          <div
            style={{
              clipPath:
                "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
            }}
            className="aspect-[577/310] w-[32rem] bg-gradient-to-l from-emerald-500/20 via-cyan-500/15 to-thermal-500/20 opacity-30"
          />
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Value Proposition & Call to Action (Span 6) */}
          <div className="flex flex-col items-center gap-4 text-center lg:col-span-6 lg:items-start lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FINANCIAL SOVEREIGNTY • ROI ENGINE</span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl font-heading leading-tight">
              Turn Decarbonization Mandates Into{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Multi-Crore Profit.
              </span>
            </h2>

            <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-steel-300">
              Every heat evaluated in our cockpit transforms rigid environmental constraints into clear commercial gain. Maximize circular scrap safely beneath ASTM tramp thresholds, monetize surplus India CCTS credits, and eliminate EU CBAM border tax exposure.
            </p>

            {/* Quick Proof Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 w-full text-xs">
              <div className="flex items-center gap-2 text-steel-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">+₹38 Cr/yr</strong> CCTS Surplus EBITDA</span>
              </div>
              <div className="flex items-center gap-2 text-steel-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span><strong className="text-white">€0</strong> Unhedged EU CBAM Tariffs</span>
              </div>
              <div className="flex items-center gap-2 text-steel-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span><strong className="text-white">-113 kWh/t</strong> SAF Sensible Heat Credit</span>
              </div>
              <div className="flex items-center gap-2 text-steel-300">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />
                <span><strong className="text-white">100% Exact</strong> SHAP Additive Closure</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 lg:justify-start">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-thermal-500 to-orange-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl hover:from-thermal-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5"
              >
                <span>Launch Financial Cockpit</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/optimizer"
                className="inline-flex items-center gap-2 rounded-xl border border-steel-700 bg-obsidian-950 px-5 py-3 text-xs sm:text-sm font-semibold text-steel-200 hover:bg-steel-900 hover:text-white transition-all"
              >
                <span>Inspect Shadow Prices</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Watermelon cta-4 Telemetry Frame (Span 6) */}
          <div className="flex justify-center transition-transform duration-500 ease-out group-hover:-translate-y-1 lg:col-span-6 lg:justify-end">
            <div className="relative mx-auto w-full max-w-[370px]">
              {/* Device Frame */}
              <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-steel-800 bg-obsidian-950 shadow-2xl">
                {/* Top Notch */}
                <div className="absolute top-2 left-1/2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-steel-900 border border-steel-800/80 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  <span className="text-[9px] font-mono text-steel-400 font-bold uppercase tracking-wider">JSL Live</span>
                </div>

                {/* Device Screen Body */}
                <div className="relative h-[430px] overflow-y-auto px-4 pt-9 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden space-y-4">
                  {/* Financial KPI Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-steel-400">
                        {activeData.label}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Converged
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {activeData.metrics.map((metric) => {
                        const Icon = metricIconMap[metric.icon];
                        const isPositiveChange = metric.changePercent >= 0;

                        return (
                          <div
                            key={metric.id}
                            className="rounded-xl border border-steel-800 bg-obsidian-900/90 p-3 hover:border-steel-700 transition-colors"
                          >
                            <div className="mb-2 flex items-center gap-1.5">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-steel-800 text-thermal-400">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-steel-400 text-[10px] font-medium truncate">
                                {metric.label}
                              </span>
                            </div>

                            <div className="text-white text-base font-black font-mono">
                              {metric.value}
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-steel-800/60 text-[10px]">
                              <span className="text-steel-500 truncate text-[9px]">{metric.sublabel}</span>
                              <span
                                className={cn(
                                  "font-mono font-bold shrink-0 ml-1",
                                  isPositiveChange ? "text-emerald-400" : "text-cyan-400"
                                )}
                              >
                                {metric.changePercent > 0 ? "+" : ""}
                                {metric.changePercent}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Telemetry Heat Activity Feed */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-steel-400">
                        Recent Furnace Telemetry
                      </span>
                      <Link
                        href="/calculator"
                        className="text-[10px] font-bold text-thermal-400 hover:text-thermal-300"
                      >
                        Inspect Cockpit
                      </Link>
                    </div>

                    <div className="space-y-2">
                      {activeData.activities.map((act) => (
                        <div
                          key={act.id}
                          className="rounded-xl border border-steel-800/90 bg-obsidian-900/70 p-2.5 flex flex-col gap-1 text-left"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-white text-[11px] font-medium truncate">
                              {act.title}
                            </span>
                            <span className="text-steel-500 text-[10px] shrink-0 font-mono flex items-center gap-1">
                              <Clock className="h-2.5 w-2.5" />
                              {act.timestamp}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "self-start text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border",
                              act.statusColor
                            )}
                          >
                            {act.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Home Indicator */}
                <div className="absolute bottom-1.5 left-1/2 z-20 h-1 w-20 -translate-x-1/2 rounded-full bg-steel-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
