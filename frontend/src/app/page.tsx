"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Flame,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Factory,
  Zap,
  DollarSign,
  Cpu,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { DecarbonizationLevers } from "@/components/watermelon/decarbonization-levers";
import { BentoGrid } from "@/components/watermelon/bento-grid";
import { FeatureIntelligence } from "@/components/watermelon/feature-intelligence";
import { CommercialCta } from "@/components/watermelon/commercial-cta";
import { IntegrationsStack } from "@/components/watermelon/integrations-stack";
import { CinematicBackground } from "@/components/ui/cinematic-background";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"baseline" | "optimized">("optimized");

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION WITH CINEMATIC LOOPING FURNACE BACKGROUND */}
      <CinematicBackground className="pt-8 pb-6 md:pt-12 md:pb-8 border-b border-steel-800/80">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-5 max-w-4xl mx-auto">
            {/* Competition Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-thermal-500/40 bg-thermal-500/10 px-3.5 py-1 text-xs font-semibold text-thermal-300 backdrop-blur-md animate-pulse">
              <Flame className="h-3.5 w-3.5 text-thermal-400" />
              <span>JINDAL STAINLESS ENGINEERING CASE STUDY 2026 • PROBLEM STATEMENT 3</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight font-heading">
              The Stainless Steel{" "}
              <span className="bg-gradient-to-r from-thermal-400 via-orange-500 to-amber-300 bg-clip-text text-transparent">
                Trilemma
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-steel-300 max-w-3xl leading-relaxed">
              Decarbonization, Pyrometallurgical Phase Integrity, and Financial Sovereignty.
              A precision engineering engine tailored for Jindal Stainless Limited&apos;s 3+ MTPA
              manufacturing and supply complexes across{" "}
              <span className="text-white font-semibold">Jajpur (Odisha)</span>,{" "}
              <span className="text-white font-semibold">Hisar (Haryana)</span>, and{" "}
              <span className="text-white font-semibold">Raigarh (Chhattisgarh)</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
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
                <span>First-Principles Methodology</span>
              </Link>
            </div>

            {/* Metrics quick counter */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t border-steel-800/80 w-full text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-white">43</p>
                <p className="text-xs font-medium text-steel-400">Authentic JSL Grades</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-thermal-400">-67.2%</p>
                <p className="text-xs font-medium text-steel-400">Proven CO2 Abatement</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">+₹38 Cr/yr</p>
                <p className="text-xs font-medium text-steel-400">India CCTS Surplus</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black font-mono text-cyanPulse-400">0 ms</p>
                <p className="text-xs font-medium text-steel-400">Vercel Edge Latency</p>
              </div>
            </div>
          </div>
        </div>
      </CinematicBackground>

      {/* 2. DECARBONIZATION LEVERS (blog-3 layout adapted) */}
      <DecarbonizationLevers />

      {/* 3. PYROMETALLURGICAL BENTO GRID (bento-1 & bento-2 layout) */}
      <BentoGrid />

      {/* 4. INTERACTIVE LIVE SHOWCASE TEASER */}
      <section className="py-8 md:py-12 bg-obsidian-900/60 border-b border-steel-800/80 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-thermal-400">
              Live Pyrometallurgical Demonstration
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-heading">
              Decarbonizing JSL&apos;s Flagship Grade J304 at Jajpur Works
            </h2>
            <p className="text-sm text-steel-400 max-w-2xl mx-auto">
              Comparing standard fossil-intensive operating baseline against the closed-loop
              thermodynamically optimized charge sheet.
            </p>
          </div>

          {/* Interactive Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto shadow-2xl border border-steel-700/60">
            {/* Toggle Switch */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-xl bg-obsidian-950 p-1 border border-steel-800">
                <button
                  onClick={() => setActiveTab("baseline")}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "baseline"
                      ? "bg-steel-800 text-white shadow"
                      : "text-steel-400 hover:text-white"
                  }`}
                >
                  Unoptimized Baseline (20% Scrap, Coal DRI, CPP)
                </button>
                <button
                  onClick={() => setActiveTab("optimized")}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "optimized"
                      ? "bg-gradient-to-r from-thermal-500 to-orange-600 text-white shadow"
                      : "text-steel-400 hover:text-white"
                  }`}
                >
                  Decarbonized Heat (85% Scrap, Gas DRI, PPA, Hot FeCr)
                </button>
              </div>
            </div>

            {/* Content Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Left: Key Metrics */}
              <div className="space-y-4">
                <div className="rounded-xl bg-obsidian-950/80 p-4 border border-steel-800">
                  <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider">
                    Total Carbon Footprint (Scope 1+2+3)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-3xl sm:text-4xl font-black font-mono ${
                        activeTab === "optimized" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {activeTab === "optimized" ? "0.94" : "2.87"}
                    </span>
                    <span className="text-xs text-steel-400 font-medium">tCO2 / t finished steel</span>
                  </div>
                  <div className="mt-2 text-xs text-steel-400 flex items-center gap-1.5">
                    {activeTab === "optimized" ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingDown className="h-3.5 w-3.5" /> -67.2% Decarbonization vs Baseline
                      </span>
                    ) : (
                      <span className="text-red-400">High virgin DRI & CPP coal power footprint</span>
                    )}
                  </div>
                </div>

                <div className="rounded-xl bg-obsidian-950/80 p-4 border border-steel-800">
                  <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider">
                    Specific Electrical Energy (SEC)
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black font-mono text-cyanPulse-400">
                      {activeTab === "optimized" ? "432" : "684"}
                    </span>
                    <span className="text-xs text-steel-400 font-medium">kWh / tonne steel</span>
                  </div>
                  <p className="text-xs text-steel-400 mt-1">
                    {activeTab === "optimized"
                      ? "Delivers 200 kWh/t sensible heat savings via Jajpur molten FeCr charging"
                      : "Heavy endothermic FeO reduction load from rotary kiln coal DRI"}
                  </p>
                </div>
              </div>

              {/* Middle: Financial Liabilities */}
              <div className="space-y-4">
                <div className="rounded-xl bg-obsidian-950/80 p-4 border border-steel-800">
                  <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider">
                    EU CBAM 2034 Unhedged Exposure
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-3xl font-black font-mono ${
                        activeTab === "optimized" ? "text-amber-400" : "text-red-400"
                      }`}
                    >
                      {activeTab === "optimized" ? "€54.8" : "€184.2"}
                    </span>
                    <span className="text-xs text-steel-400 font-medium">/ tonne exported</span>
                  </div>
                  <p className="text-xs text-steel-400 mt-1">
                    On JSL&apos;s 600,000 MT/yr EU corridor, saves{" "}
                    <span className="text-emerald-400 font-semibold">
                      {activeTab === "optimized" ? "€77.6 Million / yr (₹714 Cr)" : "€0"}
                    </span>
                  </p>
                </div>

                <div className="rounded-xl bg-obsidian-950/80 p-4 border border-steel-800">
                  <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider">
                    India CCTS BEE June 2026 Target
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className={`text-3xl font-black font-mono ${
                        activeTab === "optimized" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {activeTab === "optimized" ? "+₹38.4 Cr" : "-₹87.2 Cr"}
                    </span>
                    <span className="text-xs text-steel-400 font-medium">/ year EBITDA impact</span>
                  </div>
                  <p className="text-xs text-steel-400 mt-1">
                    {activeTab === "optimized"
                      ? "Generates 256,000 Carbon Credit Certificates (CCCs) to trade"
                      : "Requires purchasing ₹87 Cr in penalty credits to meet Jajpur 0.8222 target"}
                  </p>
                </div>
              </div>

              {/* Right: Recipe Breakdown & Action */}
              <div className="rounded-xl bg-gradient-to-br from-steel-900 to-obsidian-950 p-5 border border-steel-700 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-thermal-400" />
                  <span>Charge Sheet Recipe</span>
                </h3>

                <ul className="space-y-2 text-xs">
                  <li className="flex justify-between pb-1 border-b border-steel-800">
                    <span className="text-steel-400">Recycled Scrap</span>
                    <span className="font-mono text-white font-semibold">
                      {activeTab === "optimized" ? "85.0% (max safe cap)" : "20.0%"}
                    </span>
                  </li>
                  <li className="flex justify-between pb-1 border-b border-steel-800">
                    <span className="text-steel-400">Virgin Iron Unit</span>
                    <span className="font-mono text-white font-semibold">
                      {activeTab === "optimized" ? "Gas DRI (0.90 tCO2/t)" : "Coal DRI (2.60 tCO2/t)"}
                    </span>
                  </li>
                  <li className="flex justify-between pb-1 border-b border-steel-800">
                    <span className="text-steel-400">Ferrochrome Alloy</span>
                    <span className="font-mono text-white font-semibold">
                      {activeTab === "optimized" ? "LC FeCr + Hot SAF" : "Standard HC FeCr"}
                    </span>
                  </li>
                  <li className="flex justify-between pb-1 border-b border-steel-800">
                    <span className="text-steel-400">Renewable PPA</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {activeTab === "optimized" ? "85% Blended" : "47% Baseline"}
                    </span>
                  </li>
                </ul>

                <Link
                  href="/calculator"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-thermal-500 hover:bg-thermal-600 text-white font-semibold py-2.5 text-xs transition-colors"
                >
                  <span>Test Other 42 Grades in Cockpit</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REAL-TIME METALLURGICAL INTELLIGENCE & TELEMETRY (feature-4 layout) */}
      <FeatureIntelligence />

      {/* 6. THREE STRATEGIC PROBLEM PILLARS */}
      <section className="py-8 md:py-12 bg-obsidian-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-6 sm:mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-cyanPulse-400">
              Why Generic Carbon Tools Fail
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-heading">
              The Three Engineering Hard Truths of Stainless Steel
            </h2>
            <p className="text-sm text-steel-400 max-w-2xl mx-auto">
              Our solution addresses the real-world manufacturing constraints outlined in the JSL
              case brief rather than relying on generic steel approximations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-thermal-500/10 border border-thermal-500/30 flex items-center justify-center text-thermal-400">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                1. The Tramp Element Ceiling
              </h3>
              <p className="text-xs text-steel-300 leading-relaxed">
                Generic models assume you can simply dial up scrap to 100%. In reality, recycled scrap
                carries unwanted copper (Cu) and tin (Sn). In high-nickel austenitic grades, Cu causes
                lethal hot shortness during hot strip rolling. In ferritics, tramp nickel disrupts magnetic
                permeability. Our engine enforces 43 authentic scrap ceilings to safeguard ASTM metallurgical specs.
              </p>
              <div className="pt-2 text-xs text-thermal-400 font-semibold flex items-center gap-1">
                <span>Phase-balanced scrap capping</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-cyanPulse-500/10 border border-cyanPulse-500/30 flex items-center justify-center text-cyanPulse-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                2. EU CBAM 2026 vs 2034 Cliff
              </h3>
              <p className="text-xs text-steel-300 leading-relaxed">
                European CBAM takes definitive effect in 2026. However, under the Specific Embedded Free
                Allocation (SEFA) formula, the cash tariff in 2026 is cushioned by a 97.5% free allocation.
                The real financial cliff hits between 2028 and 2034, when free allocation vanishes to zero
                and exporters face full €180/t unhedged carbon exposure. Our engine models both horizons.
              </p>
              <div className="pt-2 text-xs text-cyanPulse-400 font-semibold flex items-center gap-1">
                <span>Dual-horizon EU liability model</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-heading">
                3. India CCTS BEE June 2026 Target
              </h3>
              <p className="text-xs text-steel-300 leading-relaxed">
                The Bureau of Energy Efficiency (BEE) has notified a strict specific emissions intensity
                target of <span className="text-white font-mono font-bold">0.8222 tCO2e/t</span> for JSL Kalinga Nagar (Jajpur).
                Beating this target generates tradeable Carbon Credit Certificates (CCCs) valued at ₹1,500/t,
                turning decarbonization from a cost center into a multi-crore EBITDA driver.
              </p>
              <div className="pt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span>Direct group EBITDA monetization</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. JSL ASSET INDUSTRIAL TRI-HUB SHOWCASE */}
      <section className="py-8 md:py-12 bg-obsidian-900/40 border-t border-b border-steel-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-6 sm:mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-thermal-400">
              Industrial Footprint
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-heading">
              Built on Authentic JSL Manufacturing & Sourcing Tri-Hubs
            </h2>
            <p className="text-sm text-steel-400 max-w-2xl mx-auto">
              Our emissions accounting reflects the exact physical infrastructure, energy agreements, and raw material corridors of Jindal Stainless Limited across Odisha, Haryana, and Chhattisgarh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Jajpur Hub (Odisha) */}
            <div className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-thermal-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading">JSL Jajpur Works</h3>
                  <p className="text-xs text-steel-400">Kalinganagar Complex, Odisha</p>
                </div>
                <span className="rounded-full bg-thermal-500/10 px-2.5 py-1 text-xs font-semibold text-thermal-400 border border-thermal-500/30 font-mono shrink-0">
                  2.2 MTPA Melt
                </span>
              </div>

              <p className="text-xs text-steel-300 leading-relaxed">
                Flagship mega-melt shop. Features on-site captive Submerged Arc Furnaces
                (SAF) enabling 1,650°C molten FeCr hot-charging directly into EAFs, saving 113 kWh/t of sensible heat.
                Operates a 250 MW coal thermal CPP alongside a 315.6 MW hybrid wind-solar PPA.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Primary Power</span>
                  <span className="font-semibold text-white text-[11px]">250 MW Coal CPP</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Clean PPA</span>
                  <span className="font-semibold text-emerald-400 text-[11px]">315.6 MW Wind-Solar</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Thermal Lever</span>
                  <span className="font-semibold text-thermal-400 text-[11px]">Molten FeCr Transfer</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">BEE CCTS Target</span>
                  <span className="font-mono text-cyanPulse-400 font-semibold text-[11px]">0.8222 tCO2e/t</span>
                </div>
              </div>
            </div>

            {/* 2. Hisar Hub (Haryana) */}
            <div className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-cyanPulse-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading">JSL Hisar Works</h3>
                  <p className="text-xs text-steel-400">Hisar, Haryana, India</p>
                </div>
                <span className="rounded-full bg-cyanPulse-500/10 px-2.5 py-1 text-xs font-semibold text-cyanPulse-400 border border-cyanPulse-500/30 font-mono shrink-0">
                  0.8 MTPA Precision
                </span>
              </div>

              <p className="text-xs text-steel-300 leading-relaxed">
                Specialty and precision division. Pioneer in razor blade steel, coin blanks, and precision
                strips. Houses India&apos;s first commercial green hydrogen plant in the stainless steel sector
                (95 Nm3/hr alkaline electrolyzer), displacing cracked ammonia fossil gas in bright annealing lines.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Primary Power</span>
                  <span className="font-semibold text-white text-[11px]">Northern Grid (0.72 t/MWh)</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Green H2 Plant</span>
                  <span className="font-semibold text-emerald-400 text-[11px]">95 Nm3/hr (2,700 t/yr)</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Specialty Product</span>
                  <span className="font-semibold text-amber-400 text-[11px]">Precision BA & Blades</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">BEE CCTS Target</span>
                  <span className="font-mono text-cyanPulse-400 font-semibold text-[11px]">0.8222 tCO2e/t</span>
                </div>
              </div>
            </div>

            {/* 3. Raigarh Hub (Chhattisgarh) */}
            <div className="glass-card rounded-2xl p-6 space-y-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading">JSL Raigarh Hub</h3>
                  <p className="text-xs text-steel-400">Raigarh-Raipur, Chhattisgarh</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 font-mono shrink-0">
                  Gas-DRI & JSSL
                </span>
              </div>

              <p className="text-xs text-steel-300 leading-relaxed">
                Strategic raw material backbone and distribution corridor. Houses the Jindal Stainless Steelway Limited (JSSL) Raigarh service center and anchors gas-based DRI sourcing, enabling the critical transition from rotary kiln coal DRI (2.60 tCO2/t) to syngas DRI (0.90 tCO2/t).
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Upstream Unit</span>
                  <span className="font-semibold text-white text-[11px]">Gas-DRI Corridor</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Carbon Delta</span>
                  <span className="font-semibold text-emerald-400 text-[11px]">-0.68 tCO2/t vs Coal DRI</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Downstream Hub</span>
                  <span className="font-semibold text-amber-400 text-[11px]">JSSL Steelway Center</span>
                </div>
                <div className="rounded-lg bg-obsidian-950 p-2.5 border border-steel-800">
                  <span className="text-steel-400 block text-[10px]">Supply Guarantee</span>
                  <span className="font-mono text-cyanPulse-400 font-semibold text-[11px]">Zero Tramp Metallics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. AUTHENTIC INDUSTRIAL TECH STACK (integrations-4 layout) */}
      <IntegrationsStack />

      {/* 6. COMMERCIAL ROI & VALUE CONVERSION (cta-4 layout) */}
      <CommercialCta />
    </div>
  );
}
