"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ShieldAlert,
  Zap,
  Activity,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MathFormula } from "@/components/ui/math-formula";
import { cn } from "@/lib/utils";

export function BentoGrid({ className }: { className?: string }) {
  const [selectedElement, setSelectedElement] = useState<"Cu" | "Sn" | "P" | "S">("Cu");

  const trampData = {
    Cu: {
      name: "Tramp Copper",
      limit: "≤ 0.40%",
      mechanism: "Immiscible in austenite grain boundaries; causes catastrophic hot-shortness cracking during hot rolling.",
      status: "PASS • 0.28% Safe Zone",
      statusColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    Sn: {
      name: "Tramp Tin",
      limit: "≤ 0.030%",
      mechanism: "Severely lowers grain boundary cohesion when combined with residual Cu. Enforces 50 ppm tolerance ceiling.",
      status: "PASS • 0.012% Safe Zone",
      statusColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    P: {
      name: "Phosphorus",
      limit: "≤ 0.040%",
      mechanism: "Thermodynamically protected by Cr (η_P = 0.99). Dephosphorization burns Cr; strict raw material control required.",
      status: "PASS • 0.029% Safe Zone",
      statusColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    },
    S: {
      name: "Sulfur",
      limit: "≤ 0.015%",
      mechanism: "Removed exclusively in AOD reducing slag under basicity B > 2.8. Desulfurization efficiency reaches 94%.",
      status: "PASS • 0.008% Safe Zone",
      statusColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
  };

  const activeTramp = trampData[selectedElement];

  return (
    <section className={cn("bg-[#090909] w-full px-4 py-8 sm:px-6 md:py-12 border-b border-steel-800/80 font-sans", className)}>
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="text-center space-y-3 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>PYROMETALLURGICAL BENTO ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-heading">
            Integrated Systems for{" "}
            <span className="bg-gradient-to-r from-thermal-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Zero-Risk Decarbonization
            </span>
          </h2>
          <p className="text-steel-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Multi-target optimization bridging real-time furnace telemetry, metallurgical phase boundaries, and compliance economics.
          </p>
        </div>

        {/* Bento Grid (bento-1 / bento-2 style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-5">
          {/* Card 1: Tramp Metallurgy (Span 7 cols) */}
          <Card className="lg:col-span-7 bg-obsidian-950/90 border-steel-800/90 hover:border-steel-700 transition-all flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-thermal-500/5 rounded-full blur-3xl pointer-events-none" />

            <CardHeader className="space-y-2 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <Badge variant="thermal" className="font-mono text-[11px]">
                  FEATURE 01 • PYROMETALLURGICAL SAFEGUARD
                </Badge>
                <span className="text-xs font-mono text-steel-400">J304 Grade Ceiling</span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-white font-bold tracking-tight font-heading">
                Dynamic Tramp Element Containment
              </CardTitle>
              <CardDescription className="text-steel-300 text-sm leading-relaxed">
                Copper cannot be oxidized or removed during EAF/AOD refining. Our closed-loop solver continuously regulates scrap charging to prevent surface tearing during continuous casting.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0 space-y-6">
              {/* Element Toggle Pills */}
              <div className="flex flex-wrap gap-2">
                {(["Cu", "Sn", "P", "S"] as const).map((el) => (
                  <button
                    key={el}
                    onClick={() => setSelectedElement(el)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border",
                      selectedElement === el
                        ? "bg-thermal-500/20 text-thermal-300 border-thermal-500/50 shadow-sm"
                        : "bg-steel-900/80 text-steel-400 border-steel-800 hover:text-white"
                    )}
                  >
                    [{el}] {trampData[el].name}
                  </button>
                ))}
              </div>

              {/* Active Element Detail Box */}
              <div className="rounded-xl bg-obsidian-900/80 border border-steel-800 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                      <span>[{selectedElement}] Ceiling:</span>
                      <MathFormula displayMode={false} latex={`[\\mathrm{${selectedElement}}] \\le ${activeTramp.limit.replace('≤ ', '')}`} className="text-white font-bold" />
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${activeTramp.statusColor}`}>
                    {activeTramp.status}
                  </span>
                </div>
                <p className="text-xs text-steel-400 leading-relaxed">
                  {activeTramp.mechanism}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-steel-800/80">
                <span className="text-xs text-steel-400">Continuous Casting Slab Integrity: <strong className="text-white">100% Guaranteed</strong></span>
                <Link href="/calculator" className="inline-flex items-center gap-1 text-xs font-bold text-thermal-400 hover:text-thermal-300">
                  <span>Verify in Cockpit</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Sensible Heat & Enthalpy (Span 5 cols) */}
          <Card className="lg:col-span-5 bg-obsidian-950/90 border-steel-800/90 hover:border-steel-700 transition-all flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <CardHeader className="space-y-2 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <Badge variant="cyan" className="font-mono text-[11px]">
                  FEATURE 02 • THERMODYNAMICS
                </Badge>
                <span className="text-xs font-mono text-cyan-400">-113 kWh/t</span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-white font-bold tracking-tight font-heading">
                Molten FeCr Sensible Heat
              </CardTitle>
              <CardDescription className="text-steel-300 text-sm leading-relaxed">
                Direct ladle transfer of 1,650°C liquid ferrochrome from captive Jajpur SAFs displaces electrical arc melting demand.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
              <div className="rounded-xl bg-obsidian-900/80 border border-steel-800 p-4 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-steel-400">EAF Electrical SEC</span>
                  <span className="text-xl font-mono font-bold text-cyan-300">386 kWh/t</span>
                </div>
                <div className="w-full bg-steel-900 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[78%]" />
                </div>
                <div className="flex justify-between text-[10px] text-steel-500 font-mono">
                  <span>Standard Cold Charge: 499 kWh/t</span>
                  <span>Sensible Credit: -113 kWh/t</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-steel-800/80">
                <span className="text-xs text-steel-400 flex items-center gap-1.5">
                  <span>Thermal Efficiency:</span>
                  <MathFormula displayMode={false} latex="\eta_{\mathrm{thermal}} = 68.5\%" className="text-white font-mono font-bold" />
                </span>
                <Link href="/methodology" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300">
                  <span>View Equation</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Exact SHAP Attributions (Span 5 cols) */}
          <Card className="lg:col-span-5 bg-obsidian-950/90 border-steel-800/90 hover:border-steel-700 transition-all flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <CardHeader className="space-y-2 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <Badge variant="emerald" className="font-mono text-[11px]">
                  FEATURE 03 • EXPLAINABLE AI
                </Badge>
                <span className="text-xs font-mono text-emerald-400">1.6 ms Latency</span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-white font-bold tracking-tight font-heading">
                Zero-Closure SHAP Engine
              </CardTitle>
              <CardDescription className="text-steel-300 text-sm leading-relaxed">
                Exact mathematical closure (<MathFormula displayMode={false} latex="\sum_{i=1}^M \phi_i = \Delta" className="text-emerald-300 font-bold" />) attributing emission shifts across scrap, DRI, renewables, and molten FeCr without black-box drift.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-steel-900/60 border border-steel-800">
                  <span className="text-steel-300">Circular Scrap:</span>
                  <span className="text-emerald-400 font-bold">-1.37 tCO2/t (58.5%)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-steel-900/60 border border-steel-800">
                  <span className="text-steel-300">Virgin Fe (gasDRI):</span>
                  <span className="text-emerald-400 font-bold">-0.65 tCO2/t (27.9%)</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-steel-900/60 border border-steel-800">
                  <span className="text-steel-300">Renewable PPA Share:</span>
                  <span className="text-emerald-400 font-bold">-0.28 tCO2/t (12.0%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-steel-800/80">
                <span className="text-xs text-steel-400 flex items-center gap-1.5">
                  <span>Closure Error:</span>
                  <strong className="text-emerald-400 font-mono">0.0000</strong>
                  <span className="text-steel-500 font-mono text-[11px]">(Exact <MathFormula displayMode={false} latex="\sum \phi_i = \Delta" className="text-emerald-400" />)</span>
                </span>
                <Link href="/calculator" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                  <span>Open Attributions</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Compliance & Financial Sovereignty (Span 7 cols) */}
          <Card className="lg:col-span-7 bg-obsidian-950/90 border-steel-800/90 hover:border-steel-700 transition-all flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <CardHeader className="space-y-2 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-mono text-[11px] border-amber-500/30 text-amber-300 bg-amber-500/10">
                  FEATURE 04 • COMPLIANCE ECONOMICS
                </Badge>
                <span className="text-xs font-mono text-emerald-400">+₹38 Cr/yr EBITDA</span>
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-white font-bold tracking-tight font-heading">
                Dual EU CBAM & India CCTS Arbitrage
              </CardTitle>
              <CardDescription className="text-steel-300 text-sm leading-relaxed">
                Protects export profitability against the EU CBAM benchmark phase-out while beating India Bureau of Energy Efficiency targets to monetize Carbon Credit Certificates (CCCs).
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-obsidian-900/80 border border-steel-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-steel-400">EU CBAM Tariff Exposure</div>
                  <div className="text-xl font-bold font-mono text-amber-400">€0 / tonne</div>
                  <div className="text-[11px] text-steel-400">SEFA credit offset with Art. 9 local carbon price deduction.</div>
                </div>
                <div className="p-4 rounded-xl bg-obsidian-900/80 border border-steel-800 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-steel-400">India CCTS Surplus</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">+380,000 CCCs/yr</div>
                  <div className="text-[11px] text-steel-400">Surplus certificates tradeable at ₹1,000–1,500/t.</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-steel-800/80">
                <span className="text-xs text-steel-400">Regulation (EU) 2023/956 & BEE Statutory Compliance</span>
                <Link href="/optimizer" className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300">
                  <span>Analyze Portfolio</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
