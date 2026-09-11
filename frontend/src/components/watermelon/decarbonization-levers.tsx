"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Flame, Zap, ShieldCheck, TrendingDown, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { MathFormula } from "@/components/ui/math-formula";

interface LeverItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  visual: React.ReactNode;
}

const LEVER_ITEMS: LeverItem[] = [
  {
    id: "scrap-copper",
    badge: "METALLURGICAL SAFEGUARD • SCOPE 1",
    title: "Circular Scrap Blending & Tramp Copper Containment",
    description:
      "Recycled stainless scrap cuts carbon emissions by up to 58%, but copper cannot be oxidized during refining. Our engine calculates real-time solubility and mass-balance boundaries, locking scrap inputs safely below the 0.40% copper cracking threshold.",
    ctaLabel: "Inspect Tramp Boundary",
    href: "/calculator",
    visual: (
      <div className="flex h-full w-full flex-col items-center justify-center p-5 bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-steel-950 border border-steel-800/80 rounded-3xl text-center space-y-2">
        <div className="h-10 w-10 rounded-xl bg-thermal-500/10 border border-thermal-500/30 flex items-center justify-center text-thermal-400">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="text-xs font-mono font-bold text-thermal-300 flex items-center justify-center gap-1">
          <span>Tramp</span>
          <MathFormula displayMode={false} latex="[\mathrm{Cu}] \le 0.40\%" className="text-thermal-300 font-bold" />
        </div>
        <div className="text-[10px] text-steel-400">Hot-Shortness Phase Safe</div>
        <div className="w-full bg-steel-900 rounded-full h-1.5 overflow-hidden mt-1">
          <div className="bg-gradient-to-r from-emerald-500 to-thermal-500 h-full w-[65%]" />
        </div>
      </div>
    ),
  },
  {
    id: "sensible-heat",
    badge: "THERMODYNAMICS & HEAT RECOVERY • -113 KWH/T",
    title: "Molten Ferrochrome Sensible Heat & SAF Liquid Charging",
    description:
      "Direct liquid hot metal charging from Jajpur's captive Submerged Arc Furnaces preserves sensible heat, slashing EAF Specific Electrical Consumption by up to 113 kWh/t and displacing fossil reduction preheaters.",
    ctaLabel: "Explore Heat Balance",
    href: "/methodology",
    visual: (
      <div className="flex h-full w-full flex-col items-center justify-center p-5 bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-steel-950 border border-steel-800/80 rounded-3xl text-center space-y-2">
        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Zap className="h-5 w-5" />
        </div>
        <div className="text-xs font-mono font-bold text-cyan-300">-113 kWh/t EAF SEC</div>
        <div className="text-[10px] text-steel-400">1,650°C Liquid FeCr Charge</div>
        <div className="w-full bg-steel-900 rounded-full h-1.5 overflow-hidden mt-1">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[80%]" />
        </div>
      </div>
    ),
  },
  {
    id: "exact-shap",
    badge: "EXPLAINABLE AI • 100% ADDITIVE CLOSURE",
    title: "Instant Multi-Target Shapley Attribution Engine",
    description:
      "Evaluates every furnace charge sheet with 100% exact additive closure (Σφ = Δ). Simultaneously predicts Carbon Footprint, EAF SEC, EU CBAM liabilities, and India CCTS credits in 1.6 milliseconds without neural network hallucination.",
    ctaLabel: "Test Attribution Cockpit",
    href: "/calculator",
    visual: (
      <div className="flex h-full w-full flex-col items-center justify-center p-5 bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-steel-950 border border-steel-800/80 rounded-3xl text-center space-y-2">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Cpu className="h-5 w-5" />
        </div>
        <div className="text-xs font-mono font-bold text-emerald-300 flex items-center justify-center gap-1">
          <MathFormula displayMode={false} latex="\sum \phi_i = \Delta" className="text-emerald-300 font-bold" />
          <span>(0.0000 Error)</span>
        </div>
        <div className="text-[10px] text-steel-400">Evaluated in 1.6 ms</div>
        <div className="w-full bg-steel-900 rounded-full h-1.5 overflow-hidden mt-1">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[100%]" />
        </div>
      </div>
    ),
  },
  {
    id: "compliance-ccts",
    badge: "POLICY & TRADING • +₹38 CR/YR",
    title: "Dual EU CBAM & India CCTS Financial Optimization",
    description:
      "Harmonizes export border tariffs with India's domestic Carbon Credit Trading Scheme. Dynamic linear programming extracts scrap shadow prices, maximizing EBITDA gains under evolving cross-sectoral correction factors.",
    ctaLabel: "Run Compliance Scenario",
    href: "/optimizer",
    visual: (
      <div className="flex h-full w-full flex-col items-center justify-center p-5 bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-steel-950 border border-steel-800/80 rounded-3xl text-center space-y-2">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <TrendingDown className="h-5 w-5" />
        </div>
        <div className="text-xs font-mono font-bold text-amber-300">CBAM Net Zero Free Allocation</div>
        <div className="text-[10px] text-steel-400">Art. 9 Price Offset Deductions</div>
        <div className="w-full bg-steel-900 rounded-full h-1.5 overflow-hidden mt-1">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full w-[72%]" />
        </div>
      </div>
    ),
  },
];

export function DecarbonizationLevers({ className }: { className?: string }) {
  return (
    <section className={cn("bg-obsidian-950 w-full px-4 py-8 sm:px-6 md:py-12 border-b border-steel-800/80", className)}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 md:gap-8">
        {/* Header Section */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-thermal-500/30 bg-thermal-500/10 px-3 py-1 text-xs font-semibold text-thermal-300">
            <Flame className="h-3.5 w-3.5 text-thermal-400" />
            <span>CORE DECARBONIZATION MECHANISMS</span>
          </div>

          <h2 className="text-white max-w-2xl text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-heading">
            Four Engineering Levers Delivering{" "}
            <span className="bg-gradient-to-r from-thermal-400 to-orange-400 bg-clip-text text-transparent">
              67.2% Net Abatement
            </span>
          </h2>

          <p className="text-steel-400 max-w-xl text-sm leading-relaxed">
            Every lever is mathematically modeled from first-principles pyrometallurgy and verified against METEC industrial campaign baselines.
          </p>
        </div>

        {/* Stacked Cards Layout (blog-3 architecture) */}
        <div className="flex w-full flex-col gap-4">
          {LEVER_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex flex-col sm:flex-row gap-3 overflow-hidden rounded-3xl border border-steel-800 bg-obsidian-900/60 p-2.5 transition-all duration-300 hover:border-thermal-500/40 hover:bg-obsidian-900"
            >
              {/* Left Column: Metadata & Copy */}
              <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-6">
                <div className="space-y-2">
                  <span className="text-thermal-400 text-xs font-mono font-bold tracking-wider">
                    {item.badge}
                  </span>

                  <h3 className="text-white text-lg sm:text-xl font-bold leading-snug font-heading group-hover:text-thermal-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-steel-400 text-xs sm:text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start rounded-full border border-steel-700 bg-steel-900 px-3.5 py-1.5 text-xs font-semibold text-steel-200 group-hover:border-thermal-500/50 group-hover:text-white transition-all">
                  <span>{item.ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 text-thermal-400" />
                </div>
              </div>

              {/* Right Column: Visual Component Card */}
              <div className="relative aspect-video sm:aspect-auto sm:w-56 md:w-64 rounded-2xl overflow-hidden shrink-0">
                {item.visual}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Link */}
        <div className="flex items-center justify-center pt-2">
          <Link
            href="/calculator"
            className="group/cta text-steel-400 hover:text-white inline-flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            <span>Open Interactive Pyrometallurgical Cockpit</span>
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 text-thermal-400" />
          </Link>
        </div>
      </div>
    </section>
  );
}
