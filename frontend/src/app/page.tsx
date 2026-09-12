"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Flame,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  DollarSign,
  Cpu,
  BarChart3,
  ChevronRight,
  Layers,
  Sparkles,
  BookOpen,
  Users,
  Sliders,
  AlertTriangle,
} from "lucide-react";
import { JSLLogo } from "@/components/brand/JSLLogo";
import { IntegrationsStack } from "@/components/watermelon/integrations-stack";
import { BentoGrid } from "@/components/watermelon/bento-grid";
import { CinematicBackground } from "@/components/ui/cinematic-background";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"baseline" | "optimized">("optimized");

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0e17] text-steel-100 relative selection:bg-thermal-500/30 selection:text-white">
      {/* ========================================================================= */}
      {/* BEAT 1: CINEMATIC HERO & HOOK                                             */}
      {/* ========================================================================= */}
      <CinematicBackground className="pt-8 pb-10 md:pt-14 md:pb-14 border-b border-steel-800/80">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
            {/* UrjaKavach & JSL Deployment Twin Badge */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full border border-thermal-500/40 bg-obsidian-950/80 px-4 py-1.5 text-xs font-semibold backdrop-blur-md shadow-lg">
              <span className="flex items-center gap-1.5 text-thermal-300">
                <Flame className="h-3.5 w-3.5 text-thermal-400" />
                <span>URJAKAVACH</span>
              </span>
              <span className="h-3 w-px bg-steel-700 hidden sm:inline-block" />
              <JSLLogo variant="mark" size={18} />
              <span className="text-steel-200 font-medium hidden sm:inline-block">JINDAL STAINLESS TWIN</span>
              <span className="h-3 w-px bg-steel-700 hidden sm:inline-block" />
              <span className="text-[10px] font-mono text-cyanPulse-400">
                JAJPUR • HISAR • RAIGARH
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight font-heading">
              The Stainless Steel{" "}
              <span className="bg-gradient-to-r from-thermal-400 via-orange-500 to-amber-300 bg-clip-text text-transparent">
                Trilemma
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-steel-300 max-w-3xl leading-relaxed">
              Decarbonization, Pyrometallurgical Phase Integrity, and Financial Sovereignty.
              An industrial digital twin engineered for UrjaKavach&apos;s 3+ MTPA
              manufacturing and supply complexes across{" "}
              <span className="text-white font-semibold">Jajpur (Odisha)</span>,{" "}
              <span className="text-white font-semibold">Hisar (Haryana)</span>, and{" "}
              <span className="text-white font-semibold">Raigarh (Chhattisgarh)</span>.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/calculator"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-thermal-500 to-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:from-thermal-600 hover:to-orange-700 hover:shadow-thermal-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Cpu className="h-4 w-4" />
                <span>Launch Calculator Cockpit</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/optimizer"
                className="flex items-center gap-2 rounded-xl border border-steel-700 bg-steel-900/80 px-6 py-3.5 text-sm font-semibold text-steel-100 hover:bg-steel-800 hover:border-steel-600 transition-all"
              >
                <BarChart3 className="h-4 w-4 text-cyanPulse-400" />
                <span>Pareto Optimizer & Risk</span>
              </Link>
              <Link
                href="/methodology"
                className="flex items-center gap-2 rounded-xl border border-steel-800/80 bg-obsidian-950/60 px-5 py-3.5 text-sm font-medium text-steel-400 hover:text-white hover:bg-steel-900 transition-all"
              >
                <span>Audit & Evidence</span>
              </Link>
            </div>

            {/* 4 Grounded Metric Counters */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t border-steel-800/80 w-full text-center">
              <div className="p-3.5 sm:p-4 rounded-xl bg-obsidian-950/50 border border-steel-800/60 hover:border-steel-700 transition-colors shadow-sm">
                <p className="text-2xl sm:text-3xl font-black font-mono text-white">43</p>
                <p className="text-xs font-medium text-steel-400 mt-1">Authentic Master Grades</p>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-obsidian-950/50 border border-steel-800/60 hover:border-thermal-500/40 transition-colors shadow-sm">
                <p className="text-2xl sm:text-3xl font-black font-mono text-thermal-400">-67.2%</p>
                <p className="text-xs font-medium text-steel-400 mt-1">Proven CO2 Abatement</p>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-obsidian-950/50 border border-steel-800/60 hover:border-emerald-500/40 transition-colors shadow-sm">
                <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">+₹38 Cr/yr</p>
                <p className="text-xs font-medium text-steel-400 mt-1">India CCTS Surplus</p>
              </div>
              <div className="p-3.5 sm:p-4 rounded-xl bg-obsidian-950/50 border border-steel-800/60 hover:border-cyanPulse-500/40 transition-colors shadow-sm">
                <p className="text-2xl sm:text-3xl font-black font-mono text-cyanPulse-400">&lt; 4 ms</p>
                <p className="text-xs font-medium text-steel-400 mt-1">In-Browser Thermodynamic Latency</p>
              </div>
            </div>
          </div>
        </div>
      </CinematicBackground>

      {/* ========================================================================= */}
      {/* BEAT 2: THE THREE HARD TRUTHS OF STAINLESS STEEL                          */}
      {/* ========================================================================= */}
      <section className="py-12 md:py-16 bg-[#0a0e17] border-b border-steel-800/80 relative overflow-hidden">
        {/* Subtle Real Steel Mill EAF backdrop layer */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-10 mix-blend-luminosity"
          style={{ backgroundImage: "url('/images/bg-eaf-tapping.jpg')" }}
        />
        <div className="absolute inset-0 bg-industrial-grid opacity-30 pointer-events-none" />
        <div className="absolute inset-0 glow-thermal-ambient pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyanPulse-500/30 bg-cyanPulse-500/10 px-3.5 py-1 text-xs font-semibold text-cyanPulse-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>METALLURGICAL & REGULATORY REALITY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              The Three Hard Truths of Stainless Steel
            </h2>
            <p className="text-sm sm:text-base text-steel-400 max-w-2xl mx-auto">
              Generic carbon accounting tools treat steelmaking like a linear spreadsheet.
              Real-world industrial stainless steel production is dictated by non-negotiable physical and financial boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hard Truth 1 */}
            <Link
              href="/calculator"
              className="group glass-card rounded-2xl p-6 md:p-7 space-y-4 border border-steel-800/80 hover:border-thermal-500/60 bg-obsidian-900/40 hover:bg-obsidian-900/80 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-thermal-500/10 border border-thermal-500/30 flex items-center justify-center text-thermal-400 group-hover:scale-105 transition-transform">
                  <Flame className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-heading group-hover:text-thermal-300 transition-colors">
                  1. The Tramp Element Ceiling
                </h3>
                <p className="text-xs sm:text-sm text-steel-300 leading-relaxed">
                  Generic models assume scrap can simply scale to 100%. In reality, recycled stainless scrap
                  concentrates tramp copper (Cu) and tin (Sn). In high-nickel austenitic grades, Cu cannot exceed{" "}
                  <strong className="text-white font-mono">0.40%</strong> or Sn <strong className="text-white font-mono">0.030%</strong>{" "}
                  without causing catastrophic hot shortness during hot strip rolling. Our engine mathematically caps scrap per grade to prevent rolling tears while maximizing recycled content.
                </p>
              </div>
              <div className="pt-4 border-t border-steel-800/80 flex items-center justify-between text-xs font-semibold text-thermal-400">
                <span>Phase-Balanced Scrap Limits</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Hard Truth 2 */}
            <Link
              href="/methodology"
              className="group glass-card rounded-2xl p-6 md:p-7 space-y-4 border border-steel-800/80 hover:border-cyanPulse-500/60 bg-obsidian-900/40 hover:bg-obsidian-900/80 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-cyanPulse-500/10 border border-cyanPulse-500/30 flex items-center justify-center text-cyanPulse-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-heading group-hover:text-cyanPulse-300 transition-colors">
                  2. EU CBAM 2026 vs 2034 Cliff
                </h3>
                <p className="text-xs sm:text-sm text-steel-300 leading-relaxed">
                  The European CBAM takes definitive effect in 2026, but the Specific Embedded Free Allocation (SEFA)
                  formula cushions 97.5% of carbon costs in year one. The true existential cliff strikes between 2028 and 2034
                  as free allowances fall to zero, confronting unhedged exporters with full <strong className="text-white font-mono">€180/t</strong> tariffs.
                  Our dual-horizon model hedges UrjaKavach&apos;s 600,000 MT/yr European export corridor against this cliff.
                </p>
              </div>
              <div className="pt-4 border-t border-steel-800/80 flex items-center justify-between text-xs font-semibold text-cyanPulse-400">
                <span>Dual-Horizon EU Liability Model</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Hard Truth 3 */}
            <Link
              href="/optimizer"
              className="group glass-card rounded-2xl p-6 md:p-7 space-y-4 border border-steel-800/80 hover:border-emerald-500/60 bg-obsidian-900/40 hover:bg-obsidian-900/80 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white font-heading group-hover:text-emerald-300 transition-colors">
                  3. India CCTS BEE June 2026 Mandate
                </h3>
                <p className="text-xs sm:text-sm text-steel-300 leading-relaxed">
                  The Bureau of Energy Efficiency (BEE) has notified a strict specific emissions intensity trajectory of{" "}
                  <strong className="text-white font-mono">0.8222 tCO2e/t</strong> for Kalinga Nagar (Jajpur Works).
                  Beating this statutory trajectory generates tradeable Carbon Credit Certificates (CCCs) valued at ₹1,500/t,
                  converting regulatory compliance from a penalty burden into an EBITDA driver of over <strong className="text-white font-mono">+₹38 Cr/yr</strong>.
                </p>
              </div>
              <div className="pt-4 border-t border-steel-800/80 flex items-center justify-between text-xs font-semibold text-emerald-400">
                <span>Direct EBITDA Monetization</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BEAT 2.5: TRAMP ELEMENTS & PLATFORM CAPABILITIES BENTO GRID               */}
      {/* ========================================================================= */}
      <BentoGrid />

      {/* ========================================================================= */}
      {/* BEAT 3: INTERACTIVE PROOF OF VALUE (FLAGSHIP J304 HEAT)                   */}
      {/* ========================================================================= */}
      <section className="py-12 md:py-16 bg-[#0c1220] border-b border-steel-800/80 relative overflow-hidden">
        {/* Real Continuous Caster strand photo */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-12 mix-blend-luminosity"
          style={{ backgroundImage: "url('/images/bg-continuous-caster.jpg')" }}
        />
        <div className="absolute inset-0 bg-industrial-grid-subtle opacity-35 pointer-events-none" />
        <div className="absolute inset-0 glow-cyan-ambient pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-thermal-500/30 bg-thermal-500/10 px-3.5 py-1 text-xs font-semibold text-thermal-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>INTERACTIVE PROOF OF VALUE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
              Decarbonizing Flagship Grade J304 at Jajpur Works
            </h2>
            <p className="text-sm sm:text-base text-steel-400 max-w-2xl mx-auto">
              Comparing standard fossil-intensive operating baseline against our closed-loop
              thermodynamically optimized charge sheet.
            </p>
          </div>

          {/* Interactive Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto shadow-2xl border border-steel-700/60 bg-obsidian-950/80">
            {/* Toggle Switch */}
            <div className="flex justify-center mb-8">
              <div
                role="tablist"
                aria-label="J304 Operating Scenarios"
                className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex rounded-xl bg-obsidian-900 p-1.5 border border-steel-800 shadow-inner max-w-full"
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-baseline"
                  aria-selected={activeTab === "baseline"}
                  aria-controls="heat-panel"
                  onClick={() => setActiveTab("baseline")}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-bold transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thermal-500 ${
                    activeTab === "baseline"
                      ? "bg-steel-800 text-white shadow-md border border-steel-700/60"
                      : "text-steel-400 hover:text-white"
                  }`}
                >
                  <span className="sm:hidden">20% Baseline</span>
                  <span className="hidden sm:inline">Unoptimized Baseline (20% Scrap, Coal DRI, CPP)</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-optimized"
                  aria-selected={activeTab === "optimized"}
                  aria-controls="heat-panel"
                  onClick={() => setActiveTab("optimized")}
                  className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-bold transition-all text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thermal-500 ${
                    activeTab === "optimized"
                      ? "bg-gradient-to-r from-thermal-500 to-orange-600 text-white shadow-lg"
                      : "text-steel-400 hover:text-white"
                  }`}
                >
                  <span className="sm:hidden">85% Decarbonized</span>
                  <span className="hidden sm:inline">Decarbonized Heat (85% Scrap, Gas DRI, PPA, Hot FeCr)</span>
                </button>
              </div>
            </div>

            {/* Content Display */}
            <div
              id="heat-panel"
              role="tabpanel"
              aria-labelledby={activeTab === "baseline" ? "tab-baseline" : "tab-optimized"}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch transition-all duration-300"
            >
              {/* Left Column: Physical Metrics */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="rounded-xl bg-obsidian-950 p-5 border border-steel-800 flex-1">
                  <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider">
                    Total Carbon Footprint (Scope 1+2+3)
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono ${
                        activeTab === "optimized" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {activeTab === "optimized" ? "0.94" : "2.87"}
                    </span>
                    <span className="text-xs text-steel-400 font-medium">tCO2 / t finished steel</span>
                  </div>
                  <div className="mt-3 text-xs flex items-center gap-1.5">
                    {activeTab === "optimized" ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingDown className="h-4 w-4" /> -67.2% Net CO2 Decarbonization
                      </span>
                    ) : (
                      <span className="text-red-400 font-medium">High virgin DRI & CPP coal power footprint</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-obsidian-950 p-5 border border-steel-800 flex-1">
                  <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider">
                    Specific Electrical Energy (SEC)
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-cyanPulse-400">
                      {activeTab === "optimized" ? "432" : "684"}
                    </span>
                    <span className="text-xs text-steel-400 font-medium">kWh / tonne steel</span>
                  </div>
                  <p className="text-xs text-steel-400 mt-2 leading-relaxed">
                    {activeTab === "optimized"
                      ? "113 kWh/t sensible heat credit via Jajpur SAF 1,650°C molten FeCr hot charging, saving 252 kWh/t total."
                      : "Heavy endothermic FeO reduction burden from rotary kiln coal DRI without sensible heat recovery."}
                  </p>
                </div>
              </div>

              {/* Middle Column: Statutory Economics */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="rounded-xl bg-obsidian-950 p-5 border border-steel-800 flex-1">
                  <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider">
                    EU CBAM 2034 Tariff Exposure
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono ${
                        activeTab === "optimized" ? "text-amber-400" : "text-red-400"
                      }`}
                    >
                      {activeTab === "optimized" ? "€54.8" : "€184.2"}
                    </span>
                    <span className="text-xs text-steel-400 font-medium">/ tonne exported</span>
                  </div>
                  <p className="text-xs text-steel-400 mt-2 leading-relaxed">
                    On UrjaKavach&apos;s 600,000 MT/yr European export corridor, generates{" "}
                    <span className="text-emerald-400 font-bold">
                      {activeTab === "optimized" ? "€77.6 Million / yr (₹714 Cr)" : "€0"}
                    </span>{" "}
                    in avoided border tariffs.
                  </p>
                </div>

                <div className="rounded-xl bg-obsidian-950 p-5 border border-steel-800 flex-1">
                  <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider">
                    India CCTS BEE June 2026 Mandate
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono ${
                        activeTab === "optimized" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {activeTab === "optimized" ? "+₹38.4 Cr" : "-₹87.2 Cr"}
                    </span>
                    <span className="text-xs text-steel-400 font-medium">/ year EBITDA impact</span>
                  </div>
                  <p className="text-xs text-steel-400 mt-2 leading-relaxed">
                    {activeTab === "optimized"
                      ? "Generates 256,000 tradeable Carbon Credit Certificates (CCCs) to sell."
                      : "Requires purchasing ₹87.2 Cr in penalty credits to meet Jajpur 0.8222 benchmark."}
                  </p>
                </div>
              </div>

              {/* Right Column: Recipe Breakdown & Action */}
              <div className="rounded-xl bg-gradient-to-br from-steel-900 to-obsidian-950 p-6 border border-steel-700 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="h-4 w-4 text-thermal-400" />
                    <span>Charge Sheet Recipe</span>
                  </h3>

                  <ul className="space-y-2.5 text-xs">
                    <li className="flex justify-between pb-2 border-b border-steel-800">
                      <span className="text-steel-400">Recycled Scrap</span>
                      <span className="font-mono text-white font-semibold">
                        {activeTab === "optimized" ? "85.0% (ASTM safe cap)" : "20.0%"}
                      </span>
                    </li>
                    <li className="flex justify-between pb-2 border-b border-steel-800">
                      <span className="text-steel-400">Virgin Iron Unit</span>
                      <span className="font-mono text-white font-semibold">
                        {activeTab === "optimized" ? "Gas DRI (0.90 tCO2/t)" : "Coal DRI (2.60 tCO2/t)"}
                      </span>
                    </li>
                    <li className="flex justify-between pb-2 border-b border-steel-800">
                      <span className="text-steel-400">Ferrochrome Alloy</span>
                      <span className="font-mono text-white font-semibold">
                        {activeTab === "optimized" ? "LC FeCr + Hot SAF" : "Standard HC FeCr"}
                      </span>
                    </li>
                    <li className="flex justify-between pb-2 border-b border-steel-800">
                      <span className="text-steel-400">Renewable PPA</span>
                      <span
                        className={`font-mono font-semibold ${
                          activeTab === "optimized" ? "text-emerald-400" : "text-steel-200"
                        }`}
                      >
                        {activeTab === "optimized" ? "85% Blended" : "47% Baseline"}
                      </span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/calculator"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-thermal-500 to-orange-600 hover:from-thermal-600 hover:to-orange-700 text-white font-bold py-3 text-xs transition-all shadow-md"
                >
                  <span>Test Other 42 Grades in Cockpit</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BEAT 4: AUDITED INDUSTRIAL TECH STACK                                     */}
      {/* ========================================================================= */}
      <IntegrationsStack />

      {/* ========================================================================= */}
      {/* CLOSING LAUNCHPAD: EVALUATOR COCKPIT NAVIGATION                           */}
      {/* ========================================================================= */}
      <section className="py-12 md:py-20 bg-[#0a0e17] border-t border-steel-800/80 relative overflow-hidden">
        {/* Real Industrial Hot Strip Mill photo backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-10 mix-blend-luminosity"
          style={{ backgroundImage: "url('/images/bg-hot-strip-mill.jpg')" }}
        />
        <div className="absolute inset-0 bg-industrial-grid opacity-25 pointer-events-none" />
        <div className="absolute inset-0 glow-thermal-ambient pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>EVALUATOR LAUNCHPAD</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-heading">
              Explore the Engineering Platform
            </h2>
            <p className="text-sm sm:text-base text-steel-400 max-w-2xl mx-auto">
              Every engine, formula, and proof in UrjaKavach is live and ready for rigorous examination.
            </p>
          </div>

          {/* 4 Clean Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Card 1: Calculator Cockpit */}
            <Link
              href="/calculator"
              className="group glass-card rounded-2xl p-6 border border-steel-800/80 hover:border-thermal-500/60 bg-obsidian-900/60 hover:bg-obsidian-900 transition-all flex flex-col justify-between transform hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-thermal-500/10 border border-thermal-500/30 flex items-center justify-center text-thermal-400 group-hover:scale-110 transition-transform">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-thermal-400 font-bold">
                    Interactive Cockpit
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                    Pyrometallurgical Calculator
                  </h3>
                </div>
                <p className="text-xs text-steel-400 leading-relaxed">
                  Real-time mass balance, Scope 1+2+3 intensity, ASTM tramp ceilings, and molten FeCr sensible heat credits across 43 authentic JSL grades.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-steel-800/80 flex items-center justify-between text-xs font-bold text-thermal-400">
                <span>Launch Cockpit</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 2: Pareto Optimizer */}
            <Link
              href="/optimizer"
              className="group glass-card rounded-2xl p-6 border border-steel-800/80 hover:border-cyanPulse-500/60 bg-obsidian-900/60 hover:bg-obsidian-900 transition-all flex flex-col justify-between transform hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-cyanPulse-500/10 border border-cyanPulse-500/30 flex items-center justify-center text-cyanPulse-400 group-hover:scale-110 transition-transform">
                  <Sliders className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyanPulse-400 font-bold">
                    Operations Research
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                    Pareto Multi-Objective Optimizer
                  </h3>
                </div>
                <p className="text-xs text-steel-400 leading-relaxed">
                  HiGHS continuous Simplex solver navigating cost vs carbon frontiers with dual shadow prices and 64-coalition Shapley XAI explanations.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-steel-800/80 flex items-center justify-between text-xs font-bold text-cyanPulse-400">
                <span>Run Optimizer</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 3: Methodology */}
            <Link
              href="/methodology"
              className="group glass-card rounded-2xl p-6 border border-steel-800/80 hover:border-amber-500/60 bg-obsidian-900/60 hover:bg-obsidian-900 transition-all flex flex-col justify-between transform hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    First-Principles Proofs
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                    Methodology & Citations
                  </h3>
                </div>
                <p className="text-xs text-steel-400 leading-relaxed">
                  KaTeX-rendered mathematical derivations, METEC 2011 enthalpy models, CCTS BEE June 2026 formulas, and full metallurgical citations.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-steel-800/80 flex items-center justify-between text-xs font-bold text-amber-400">
                <span>Inspect Science</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Card 4: Team Hind */}
            <Link
              href="/contact"
              className="group glass-card rounded-2xl p-6 border border-steel-800/80 hover:border-emerald-500/60 bg-obsidian-900/60 hover:bg-obsidian-900 transition-all flex flex-col justify-between transform hover:-translate-y-1 shadow-lg"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Engineering Team
                  </span>
                  <h3 className="text-lg font-bold text-white font-heading mt-0.5">
                    Team Hind Provenance
                  </h3>
                </div>
                <p className="text-xs text-steel-400 leading-relaxed">
                  Meet the engineers behind the platform, explore our engineering approach for Problem Statement 3 (Clean Steel Decarbonization), and view project repository links.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-steel-800/80 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>Meet Team Hind</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Final Direct Cockpit CTA Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-obsidian-900 via-steel-950 to-obsidian-900 border border-steel-800/90 p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                Ready to evaluate the pyrometallurgical engine?
              </h3>
              <p className="text-xs sm:text-sm text-steel-400 max-w-xl">
                Simulate any of the 43 stainless steel grades or solve Pareto charge sheets in under 4 milliseconds.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/calculator"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-thermal-500 to-orange-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:from-thermal-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5"
              >
                <Cpu className="h-4 w-4" />
                <span>Launch Calculator</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/optimizer"
                className="inline-flex items-center gap-2 rounded-xl border border-steel-700 bg-steel-900/80 px-5 py-3 text-xs sm:text-sm font-semibold text-steel-100 hover:bg-steel-800 hover:text-white transition-all"
              >
                <Sliders className="h-4 w-4 text-cyanPulse-400" />
                <span>Run Optimizer</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
