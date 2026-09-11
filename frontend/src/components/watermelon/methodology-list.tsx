"use client";

import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Volume2,
  ShieldCheck,
  Scale,
  Zap,
  TrendingDown,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { triggerAssistant } from "@/components/agent/InlineExplainButton";
import { Badge } from "@/components/ui/badge";
import { MathFormula } from "@/components/ui/math-formula";
import { cn } from "@/lib/utils";

export interface FormulationItem {
  id: number;
  category: "all" | "balance" | "thermo" | "compliance" | "optimization";
  categoryLabel: string;
  name: string;
  subtitle: string;
  formula: string;
  latex: string;
  target: string;
  badgeColor: string;
  queryChat: string;
  queryVoice: string;
  description: string;
  featured?: boolean;
}

export const FORMULATIONS: FormulationItem[] = [
  {
    id: 1,
    category: "balance",
    categoryLabel: "Metallurgical Balance",
    name: "Stoichiometric Iron Crediting",
    subtitle: "Eliminating the 220 kg/t DRI Double-Counting Error",
    formula: "Fe_virgin = max(0, w_Fe(1 - s) - [Fe_FeCr + Fe_Ni + Fe_FeMo + Fe_FeMn + Fe_Cu])",
    latex: "\\mathrm{Fe}_{\\mathrm{virgin}} = \\max\\left(0,\\, w_{\\mathrm{Fe}}(1 - s) - \\sum_{k \\in \\mathrm{alloys}} \\mathrm{Fe}_{k}\\right)",
    target: "total_co2_t",
    badgeColor: "text-thermal-400 border-thermal-500/30 bg-thermal-500/10",
    queryChat:
      "Explain stoichiometric iron crediting and how crediting ferroalloy iron eliminates the 220 kg/t DRI double-counting error",
    queryVoice:
      "Explain stoichiometric iron crediting in stainless steelmaking and how it prevents double counting virgin iron",
    description:
      "Standard carbon tools assume virgin iron must come 100% from DRI, ignoring that ferroalloys (40% Fe in FeCr, 81.5% Fe in NPI) inherently supply metallic iron. Crediting this inherent iron eliminates up to 220 kg/t DRI double-counting, preventing 0.57 tCO2/t in phantom emissions.",
    featured: true,
  },
  {
    id: 2,
    category: "thermo",
    categoryLabel: "Thermodynamics",
    name: "Dynamic EAF Specific Electrical Consumption (SEC)",
    subtitle: "First-Principles Enthalpy & Molten FeCr Sensible Heat",
    formula: "SEC_EAF = (Q_scrap + Q_DRI + Q_alloys - Q_hotSAF) / η_thermal + E_aux",
    latex: "\\mathrm{SEC}_{\\mathrm{EAF}} = \\frac{Q_{\\mathrm{scrap}} + Q_{\\mathrm{DRI}} + Q_{\\mathrm{alloys}} - Q_{\\mathrm{hotSAF}}}{\\eta_{\\mathrm{thermal}}} + E_{\\mathrm{aux}}",
    target: "eaf_sec_kwh",
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    queryChat:
      "Explain dynamic EAF Specific Electrical Consumption (SEC) and how molten FeCr sensible heat saves ~113 kWh/t",
    queryVoice:
      "Explain dynamic EAF electrical SEC and the sensible heat credit from molten FeCr charging",
    description:
      "Replaces static energy assumptions with thermodynamic enthalpy accounting: scrap melting (285.6 kWh_th), endothermic FeO reduction in coal DRI (+159.2 kJ/mol), gangue fluxing, and sensible heat savings from captive SAF molten FeCr hot charging (-86 to -113 kWh/t).",
    featured: true,
  },
  {
    id: 3,
    category: "compliance",
    categoryLabel: "Statutory Compliance",
    name: "EU CBAM Specific Embedded Free Allocation (SEFA)",
    subtitle: "Regulation (EU) 2023/956 High-Alloy Benchmark & Article 9 Deduction",
    formula: "SEFA = BM_CBAM × CSCF × (1 - Scrap%),   Tariff(t) = max(0, SEE - SEFA) × p_ETS × f_phase(t) - Art9",
    latex: "\\mathrm{Tariff}(t) = \\max\\Big(0,\\, \\big(\\mathrm{SEE} - [\\mathrm{BM}_{\\mathrm{CBAM}} \\cdot \\mathrm{CSCF} \\cdot (1 - s)]\\big) \\cdot p_{\\mathrm{ETS}} \\cdot f_{\\mathrm{phase}}(t) - \\mathrm{Art}_9\\Big)",
    target: "cbam_tariff_eur",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    queryChat:
      "Explain EU CBAM Specific Embedded Free Allocation (SEFA 2026) and Article 9 deductions for Indian steel exports",
    queryVoice:
      "Explain EU CBAM SEFA allocation rules and Article 9 carbon price offsets",
    description:
      "Evaluates Scope 1 + 3 embedded emissions (Scope 2 strictly excluded for iron & steel). Incorporates official CBAM product benchmark (0.284 tCO2/t) with Cross-Sectoral Correction Factor (CSCF = 0.87) and scrap crediting, phasing out to zero by 2034 with Article 9 carbon price deductions.",
    featured: true,
  },
  {
    id: 4,
    category: "compliance",
    categoryLabel: "Statutory Compliance",
    name: "India BEE CCTS Specific Emission Intensity (SEI)",
    subtitle: "Scope 1 + Net Grid Scope 2 with Plant-Specific Reduction Trajectory",
    formula: "SEI = (Scope 1 + Scope 2 Net Grid) / Crude_Steel,   Delta(t) = Baseline_plant × (1 - r)^t - SEI",
    latex: "\\mathrm{SEI} = \\frac{\\mathrm{Scope}_1 + \\mathrm{Scope}_{2,\\mathrm{net}}}{\\mathrm{Crude\\_Steel}}, \\quad \\Delta(t) = \\mathrm{Baseline}_{\\mathrm{plant}} \\cdot (1 - r)^t - \\mathrm{SEI}",
    target: "ccts_value_inr",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    queryChat:
      "Explain India BEE CCTS Specific Emission Intensity (SEI) target of 0.8222 tCO2/t and EBITDA generation from CCC trading",
    queryVoice:
      "Explain the India BEE CCTS carbon trading scheme and how beating the target generates EBITDA",
    description:
      "Tracks plant-level Scope 1 direct + Scope 2 net imported grid power intensity against the statutory trajectory (Jajpur baseline 0.8792 tCO2/tcs compounding to 0.8222 tCO2/tcs). Beating the trajectory generates tradeable Carbon Credit Certificates (CCCs) valued at ₹1,000–1,500/t.",
    featured: true,
  },
  {
    id: 5,
    category: "optimization",
    categoryLabel: "LP Optimization",
    name: "Swerim RAWMATMIX® LP Dual Shadow Pricing",
    subtitle: "Linear Programming Duality & Break-Even Scrap Value-in-Use (ViU)",
    formula: "π_t = ∂Cost / ∂limit_t,   r_j = c_j - A^T π,   ViU_j = c_purchase,j - r_j",
    latex: "\\pi_t = \\frac{\\partial \\mathrm{Cost}}{\\partial \\mathrm{limit}_t}, \\quad r_j = c_j - \\mathbf{A}^T \\boldsymbol{\\pi}, \\quad \\mathrm{ViU}_j = c_{\\mathrm{purchase},j} - r_j",
    target: "total_co2_t",
    badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    queryChat:
      "Explain Swerim RAWMATMIX Linear Programming dual shadow pricing and how reduced cost determines scrap Value-in-Use (ViU)",
    queryVoice:
      "Explain Swerim RAWMATMIX dual shadow pricing and scrap Value in Use",
    description:
      "Extracts decoupled dual shadow prices ($/0.01% tramp) on binding metallurgical limits (Cu, Sn, P, S). Calculates reduced costs (r_j) to determine the exact procurement discount required for non-selected feeds to achieve economic parity (ViU) and enter the charge sheet.",
  },
  {
    id: 6,
    category: "balance",
    categoryLabel: "Metallurgical Balance",
    name: "High-Cr Phosphorus Non-Removal Thermochemistry",
    subtitle: "Ellingham Thermodynamics & Strict Conservation (η_P = 0.99)",
    formula: "ΔG°(Cr2O3) << ΔG°(P2O5) ⇒ η_P = 0.99,   [P]_bath = Σ x_j · C_P,j · η_P ≤ 0.040%",
    latex: "\\Delta G^\\circ(\\mathrm{Cr}_2\\mathrm{O}_3) \\ll \\Delta G^\\circ(\\mathrm{P}_2\\mathrm{O}_5) \\implies \\eta_{\\mathrm{P}} = 0.99, \\quad [\\mathrm{P}]_{\\mathrm{bath}} = \\sum_{j} x_j \\cdot C_{\\mathrm{P},j} \\cdot \\eta_{\\mathrm{P}} \\le 0.040\\%",
    target: "total_co2_t",
    badgeColor: "text-thermal-400 border-thermal-500/30 bg-thermal-500/10",
    queryChat:
      "Explain high-Cr phosphorus non-removal thermochemistry (eta_P = 0.99) and why dephosphorization is impossible without burning chromium",
    queryVoice:
      "Explain phosphorus non removal thermochemistry in high chromium stainless steel",
    description:
      "In 18% Cr stainless melts, chromium oxidizes at vastly lower chemical potential than phosphorus (Wei et al. 2018, Selin 1987). Dephosphorization without severe chromium burn is thermodynamically impossible. Hence process recovery η_P = 0.99 enforces strict scrap phosphorus containment.",
  },
];

export function MethodologyList({ className }: { className?: string }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { label: "All Formulations", value: "all" },
    { label: "Metallurgical Balance", value: "balance" },
    { label: "Thermodynamics", value: "thermo" },
    { label: "Statutory Compliance", value: "compliance" },
    { label: "LP Optimization", value: "optimization" },
  ];

  const filteredItems = FORMULATIONS.filter(
    (item) => selectedCategory === "all" || item.category === selectedCategory
  );

  return (
    <div className={cn("w-full space-y-6 font-sans", className)}>
      {/* Category Filter Pills (career-1 style) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-steel-800 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
              selectedCategory === cat.value
                ? "bg-gradient-to-r from-thermal-500 to-orange-600 text-white border-thermal-500/40 shadow-sm"
                : "bg-obsidian-950/80 text-steel-400 border-steel-800 hover:text-white hover:border-steel-700"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Formulations List (career-1 card list layout) */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group rounded-2xl border border-steel-800/80 bg-obsidian-950/90 p-5 sm:p-6 transition-all duration-200 hover:border-steel-700 hover:bg-obsidian-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Left Column: Info & Formula */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-steel-400 uppercase tracking-wider">
                  Formula 0{item.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border font-mono ${item.badgeColor}`}>
                  {item.target}
                </span>
                <span className="text-[11px] text-steel-500 font-medium">
                  • {item.categoryLabel}
                </span>
                {item.featured && (
                  <span className="rounded-full bg-thermal-500/10 px-2 py-0.5 text-[10px] font-semibold text-thermal-300 border border-thermal-500/30">
                    Industrial Core
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-thermal-300 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-steel-400 mt-0.5">{item.subtitle}</p>
              </div>

              {/* Mathematical Equation Box (Publication-Quality LaTeX) */}
              <MathFormula latex={item.latex} equationNumber={item.id} />

              <p className="text-xs text-steel-400 leading-relaxed max-w-4xl">
                {item.description}
              </p>
            </div>

            {/* Right Column: Interactive Trigger Actions */}
            <div className="flex flex-row md:flex-col gap-2 shrink-0 self-start md:self-center">
              <button
                onClick={() =>
                  triggerAssistant({
                    query: item.queryChat,
                    target: item.target,
                    tab: "chat",
                    mode: "chat",
                  })
                }
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-steel-900 hover:bg-steel-800 text-steel-200 hover:text-white border border-steel-700 text-xs font-semibold transition-all shadow-sm"
                title="Open Assistant with this metallurgical formulation"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explain in Chat</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-steel-400" />
              </button>

              <button
                onClick={() =>
                  triggerAssistant({
                    query: item.queryVoice,
                    target: item.target,
                    tab: "voice",
                    mode: "voice",
                  })
                }
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-thermal-500/10 hover:bg-thermal-500/20 text-thermal-300 border border-thermal-500/30 text-xs font-semibold transition-all shadow-sm"
                title="Listen to full voice agent briefing"
              >
                <Volume2 className="w-3.5 h-3.5 text-thermal-400" />
                <span>Voice Briefing</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
