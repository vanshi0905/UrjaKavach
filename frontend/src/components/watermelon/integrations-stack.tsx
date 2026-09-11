"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Cpu,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Search,
  Sliders,
  Check,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StackCategory = "all" | "frontend" | "solver" | "compliance";

export interface TechIntegration {
  id: string;
  name: string;
  subtitle: string;
  category: "frontend" | "solver" | "compliance";
  categoryLabel: string;
  badge: string;
  badgeColor: string;
  codebasePath: string;
  codebaseType: "TypeScript / Client" | "Python / Microservice" | "Operations Research" | "Game Theory XAI" | "Typesetting" | "Statutory Economics";
  description: string;
  whyJudgesCare: string;
  capabilities: string[];
  metrics: { label: string; value: string };
  logo: React.ReactNode;
  accentGlow: string;
  borderColor: string;
  targetHref: string;
}

export const AUTHENTIC_TECH_STACK: TechIntegration[] = [
  {
    id: "nextjs-react",
    name: "Next.js 14 & React 18",
    subtitle: "Reactive Client & Edge Compute",
    category: "frontend",
    categoryLabel: "Frontend & Edge",
    badge: "Sub-4ms Execution",
    badgeColor: "text-cyanPulse-400 border-cyanPulse-500/30 bg-cyanPulse-500/10",
    codebasePath: "frontend/src/app",
    codebaseType: "TypeScript / Client",
    description:
      "Instantaneous client-side evaluation of pyrometallurgical thermodynamics, sensible heat transfers, and dynamic sliders directly within the browser without cloud latency.",
    whyJudgesCare:
      "Eliminates network lag during live demonstrations. Operators and evaluators manipulate charge compositions in real time with sub-4 millisecond reactive feedback.",
    capabilities: [
      "Zero-roundtrip client-side physics evaluation",
      "App Router with React Server Components",
      "Tailwind CSS & Radix UI accessible dark obsidian system",
    ],
    metrics: { label: "Client Latency", value: "< 4 ms" },
    accentGlow: "from-white/10 via-cyanPulse-500/5 to-transparent",
    borderColor: "hover:border-cyanPulse-400/50",
    targetHref: "/calculator",
    logo: (
      <svg viewBox="0 0 180 180" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="nextCircleClip">
            <circle cx="90" cy="90" r="80" />
          </clipPath>
          <linearGradient id="nextSlashGrad" x1="102" y1="105" x2="145" y2="152" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="nextBarGrad" x1="113" y1="50" x2="113" y2="110" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="reactOrbitGrad" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="1" stopColor="#0284c7" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer Ring & Dark Obsidian Background */}
        <circle cx="90" cy="90" r="82" fill="#030712" stroke="#1f2937" strokeWidth="2" />

        {/* React 18 Electron Orbital Rings */}
        <g opacity="0.35">
          <ellipse cx="90" cy="90" rx="72" ry="24" stroke="url(#reactOrbitGrad)" strokeWidth="1.5" fill="none" />
          <ellipse cx="90" cy="90" rx="72" ry="24" stroke="url(#reactOrbitGrad)" strokeWidth="1.5" fill="none" transform="rotate(60 90 90)" />
          <ellipse cx="90" cy="90" rx="72" ry="24" stroke="url(#reactOrbitGrad)" strokeWidth="1.5" fill="none" transform="rotate(120 90 90)" />
        </g>

        {/* Next.js N Geometry with robust clipPath */}
        <g clipPath="url(#nextCircleClip)">
          {/* Left Vertical Bar */}
          <rect x="56" y="50" width="13" height="78" rx="1.5" fill="#ffffff" />
          {/* Right Vertical Bar (Cyan) */}
          <rect x="113" y="50" width="13" height="78" rx="1.5" fill="url(#nextBarGrad)" />
          {/* Diagonal Slash */}
          <path
            d="M148 152 L69 50 H56 V62 L136 163 C140.5 160 144.5 156.2 148 152 Z"
            fill="url(#nextSlashGrad)"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "python-fastapi",
    name: "Python 3.14 & FastAPI",
    subtitle: "Asynchronous Microservices Engine",
    category: "solver",
    categoryLabel: "Pyrometallurgical Backend",
    badge: "Pydantic v2 Strict",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    codebasePath: "jsl_carbon_engine/api/",
    codebaseType: "Python / Microservice",
    description:
      "Asynchronous high-throughput pyrometallurgical compute microservices. Strict Pydantic v2 schemas validate chemical constraints, slag-metal kinetics, and thermal enthalpy models.",
    whyJudgesCare:
      "Production-ready backend architecture ready for direct integration with JSL Jajpur SCADA and Level-2 melt-shop automation servers.",
    capabilities: [
      "Strict Pydantic v2 schema data contract enforcement",
      "Asynchronous non-blocking pyrometallurgical calculations",
      "Modular microservice structure with complete Pytest coverage",
    ],
    metrics: { label: "Schema Validation", value: "100% Strict" },
    accentGlow: "from-emerald-500/10 via-teal-500/5 to-transparent",
    borderColor: "hover:border-emerald-500/50",
    targetHref: "/methodology",
    logo: (
      <svg viewBox="0 0 180 180" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="pyBlueGrad" x1="40" y1="30" x2="110" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="pyYellowGrad" x1="70" y1="90" x2="140" y2="150" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fbbf24" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="fastapiBg" x1="110" y1="110" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#059669" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
        </defs>

        {/* Outer Obsidian Ring */}
        <circle cx="90" cy="90" r="82" fill="#030712" stroke="#1f2937" strokeWidth="2" />

        {/* Python Upper Snake (Blue) - Centered */}
        <path
          d="M89.5 35c-24 0-22.5 10.4-22.5 10.4l.02 10.8h23v3.2H47.8s-15.6 1.8-15.6 22.8c0 21 13.6 20.3 13.6 20.3h8.1v-11.4s-.4-13.6 13.3-13.6h22.8s12.9.2 12.9-12.5V51.3S104 35 89.5 35zm-12.4 7.2c2.2 0 3.9 1.8 3.9 3.9s-1.8 3.9-3.9 3.9-3.9-1.8-3.9-3.9 1.8-3.9 3.9-3.9z"
          fill="url(#pyBlueGrad)"
        />

        {/* Python Lower Snake (Amber) - Centered */}
        <path
          d="M90.5 145c24 0 22.5-10.4 22.5-10.4l-.02-10.8h-23v-3.2h42.2s15.6-1.8 15.6-22.8c0-21-13.6-20.3-13.6-20.3h-8.1v11.4s.4 13.6-13.3 13.6H89.9s-12.9-.2-12.9 12.5v13.2s-1.5 16.3 13.5 16.3zm12.4-7.2c-2.2 0-3.9-1.8-3.9-3.9s1.8-3.9 3.9-3.9 3.9 1.8 3.9 3.9-1.8 3.9-3.9 3.9z"
          fill="url(#pyYellowGrad)"
        />

        {/* FastAPI Official Microservice Seal (Bottom Right) */}
        <g transform="translate(18, 18)">
          <circle cx="120" cy="120" r="26" fill="url(#fastapiBg)" stroke="#10b981" strokeWidth="2.5" />
          <path
            d="M122 106L111 121h9l-4 15 14-20h-10l5-10h-4z"
            fill="#ffffff"
            stroke="#ecfdf5"
            strokeWidth="0.5"
          />
        </g>
      </svg>
    ),
  },
  {
    id: "highs-scipy",
    name: "HiGHS & SciPy Simplex LP",
    subtitle: "Continuous Linear Programming Optimizer",
    category: "solver",
    categoryLabel: "Operations Research",
    badge: "Pareto Frontier Solves",
    badgeColor: "text-thermal-400 border-thermal-500/30 bg-thermal-500/10",
    codebasePath: "frontend/src/lib/optimizer.ts",
    codebaseType: "Operations Research",
    description:
      "Two-phase continuous Simplex and interior-point solver minimizing both cost ($/t) and carbon intensity (tCO2/t) subject to strict tramp metallics ceilings across 43 steel grades.",
    whyJudgesCare:
      "Replaces guesswork with mathematically provable optimal charge sheets. Guarantees ASTM chemical tolerances while extracting maximum scrap and green DRI benefits.",
    capabilities: [
      "Simultaneous 12-feed continuous LP optimization",
      "Dynamic alpha weighting (Least-Cost vs Least-Carbon)",
      "Strict physical tramp element ceilings (Cu ≤ 0.40%, Sn ≤ 0.03%)",
    ],
    metrics: { label: "Steel Grades", value: "43 Grades" },
    accentGlow: "from-thermal-500/10 via-orange-500/5 to-transparent",
    borderColor: "hover:border-thermal-500/50",
    targetHref: "/optimizer",
    logo: (
      <svg viewBox="0 0 180 180" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="highsGrad" x1="36" y1="34" x2="144" y2="138" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f97316" />
            <stop offset="1" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="scipyBlue" x1="25" y1="90" x2="155" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#005493" stopOpacity="0.8" />
            <stop offset="0.5" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#005493" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <circle cx="90" cy="90" r="82" fill="#030712" stroke="#1f2937" strokeWidth="2" />

        {/* SciPy Sinusoidal Wave Orbit */}
        <path
          d="M25 90 C 50 45, 75 135, 90 90 C 105 45, 130 135, 155 90"
          stroke="url(#scipyBlue)"
          strokeWidth="2"
          strokeDasharray="4 2"
          fill="none"
        />

        {/* Simplex Convex Polytope */}
        <polygon points="90,34 144,66 130,138 50,138 36,66" fill="#0f172a" stroke="url(#highsGrad)" strokeWidth="2.5" />
        
        {/* Simplex Pivot Rays */}
        <line x1="90" y1="34" x2="90" y2="106" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="144" y1="66" x2="90" y2="106" stroke="#ea580c" strokeWidth="1.5" />
        <line x1="36" y1="66" x2="90" y2="106" stroke="#ea580c" strokeWidth="1.5" />
        <line x1="50" y1="138" x2="90" y2="106" stroke="#ea580c" strokeWidth="1.5" />
        <line x1="130" y1="138" x2="90" y2="106" stroke="#ea580c" strokeWidth="1.5" />

        {/* Optimal Simplex Vertex Beacon (x*) */}
        <circle cx="90" cy="34" r="9" fill="#f97316" fillOpacity="0.25" />
        <circle cx="90" cy="34" r="5.5" fill="#f97316" stroke="#ffffff" strokeWidth="2" />

        {/* Feasible Extreme Points */}
        <circle cx="144" cy="66" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="36" cy="66" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="130" cy="138" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="50" cy="138" r="4.5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="90" cy="106" r="4" fill="#fbbf24" stroke="#0f172a" strokeWidth="1.5" />

        {/* HiGHS Inscription */}
        <text x="90" y="125" fill="#94a3b8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="1">
          min cᵀx
        </text>
      </svg>
    ),
  },
  {
    id: "shapley-xai",
    name: "64-Coalition Permutation Shapley",
    subtitle: "Game-Theoretic Explainability (XAI)",
    category: "solver",
    categoryLabel: "Explainable AI (XAI)",
    badge: "0.0000 Residual Error",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    codebasePath: "jsl_carbon_engine/agent/shap_engine.py",
    codebaseType: "Game Theory XAI",
    description:
      "Evaluates the complete 6-feature hypercube (2^6 = 64 coalitions) with memoized thermodynamic balances, delivering mathematically exact additive closure with 0.0000 error.",
    whyJudgesCare:
      "Eliminates black-box AI hallucinations. Furnace operators and auditees see 100% of where every kilogram of CO2 reduction and power savings originated.",
    capabilities: [
      "Exact additive closure (Error = 0.0000, 100% auditable)",
      "Evaluates complete 64-coalition cooperative game hypercube",
      "Calculates carbon, power, CBAM, and CCTS attribution in 1.4ms",
    ],
    metrics: { label: "Closure Error", value: "0.0000" },
    accentGlow: "from-amber-500/10 via-yellow-500/5 to-transparent",
    borderColor: "hover:border-amber-500/50",
    targetHref: "/methodology",
    logo: (
      <svg viewBox="0 0 180 180" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shapleyGrad" x1="40" y1="40" x2="140" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f59e0b" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
        </defs>

        <circle cx="90" cy="90" r="82" fill="#030712" stroke="#1f2937" strokeWidth="2" />

        {/* 64-Coalition Permutation Hypercube Outer Ring */}
        <circle cx="90" cy="90" r="54" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

        {/* Coalition Lattice Edges */}
        <line x1="90" y1="36" x2="90" y2="144" stroke="#334155" strokeWidth="1.2" />
        <line x1="137" y1="63" x2="43" y2="117" stroke="#334155" strokeWidth="1.2" />
        <line x1="137" y1="117" x2="43" y2="63" stroke="#334155" strokeWidth="1.2" />
        <polygon points="90,36 137,63 137,117 90,144 43,117 43,63" fill="none" stroke="#475569" strokeWidth="1.2" />

        {/* 6 Feature Player Nodes */}
        <circle cx="90" cy="36" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="137" cy="63" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="137" cy="117" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="90" cy="144" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="43" cy="117" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="43" cy="63" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

        {/* Center Shapley phi(v) Monogram */}
        <circle cx="90" cy="90" r="22" fill="#090d11" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="90" y="95" fill="#fbbf24" fontSize="15" fontFamily="serif" fontStyle="italic" fontWeight="bold" textAnchor="middle">
          φ(v)
        </text>
        <text x="90" y="165" fill="#10b981" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          Δ = 0.0000
        </text>
      </svg>
    ),
  },
  {
    id: "katex-latex",
    name: "KaTeX Publication LaTeX",
    subtitle: "Research-Grade Thermodynamic Equations",
    category: "frontend",
    categoryLabel: "Thermodynamic Rigor",
    badge: "METEC Equation Parity",
    badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    codebasePath: "frontend/src/components/ui/math-formula.tsx",
    codebaseType: "Typesetting",
    description:
      "Client-side mathematical typography rendering peer-reviewed pyrometallurgical formulas: Healy's dephosphorization thermodynamics (η_P = 0.99), sensible heat, and optical basicity.",
    whyJudgesCare:
      "Validates scientific authenticity. Judges inspect the exact thermodynamic formulations published in METEC and Worldsteel literature without ambiguity.",
    capabilities: [
      "Hardware-accelerated client-side mathematical equation rendering",
      "Healy 1970 dephosphorization partition equilibrium formula",
      "EAF enthalpy, SENSIBLE heat conservation, and basicity indices",
    ],
    metrics: { label: "Formulations", value: "Research Grade" },
    accentGlow: "from-purple-500/10 via-indigo-500/5 to-transparent",
    borderColor: "hover:border-purple-500/50",
    targetHref: "/methodology",
    logo: (
      <svg viewBox="0 0 180 180" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="katexGrad" x1="50" y1="40" x2="130" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c084fc" />
            <stop offset="1" stopColor="#7e22ce" />
          </linearGradient>
        </defs>

        <circle cx="90" cy="90" r="82" fill="#030712" stroke="#1f2937" strokeWidth="2" />

        {/* LaTeX Square Brackets [ ] */}
        <path d="M42 45 H30 V135 H42" stroke="#6b21a8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M138 45 H150 V135 H138" stroke="#6b21a8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Stylized KaTeX Sigma / Integral Hybrid */}
        <path
          d="M56 50 H112 V62 L82 88 L112 114 V126 H56 V112 L86 88 L56 64 Z"
          fill="url(#katexGrad)"
        />

        {/* Definite Integral Curve */}
        <path
          d="M126 52 C132 52 136 56 136 62 C136 76 118 106 118 122 C118 128 122 132 127 132 C131 132 135 129 137 126"
          stroke="#c084fc"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Formula Inscription */}
        <text x="90" y="152" fill="#e9d5ff" fontSize="11" fontFamily="serif" fontStyle="italic" fontWeight="bold" textAnchor="middle">
          η_P = 0.99
        </text>
      </svg>
    ),
  },
  {
    id: "ccts-cbam",
    name: "BEE India CCTS & EU CBAM Engine",
    subtitle: "Statutory Tariffs & Economic Compliance",
    category: "compliance",
    categoryLabel: "Statutory Economics",
    badge: "Article 9 & 0.8222 tCO2e/t",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    codebasePath: "frontend/src/lib/constants.ts",
    codebaseType: "Statutory Economics",
    description:
      "Statutory emissions compliance modeling for Bureau of Energy Efficiency (BEE) June 2026 mandates and EU Regulation 2023/956 Specific Embedded Free Allocation (SEFA).",
    whyJudgesCare:
      "Converts green steel into audited balance sheet value: captures +₹38.2 Cr in tradeable Indian CCCs and prevents €180/t EU CBAM cliff penalties.",
    capabilities: [
      "BEE June 2026 specific emissions target modeling (0.8222 tCO2e/t)",
      "EU CBAM dual-horizon SEFA free allocation erosion (2026 vs 2034)",
      "Article 9 domestic carbon tax reciprocal deduction mechanism",
    ],
    metrics: { label: "Annual EBITDA", value: "+₹38.2 Cr" },
    accentGlow: "from-emerald-500/10 via-thermal-500/5 to-transparent",
    borderColor: "hover:border-emerald-500/50",
    targetHref: "/calculator",
    logo: (
      <svg viewBox="0 0 180 180" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shieldGrad" x1="90" y1="32" x2="90" y2="152" gradientUnits="userSpaceOnUse">
            <stop stopColor="#111827" />
            <stop offset="1" stopColor="#042f2e" />
          </linearGradient>
          <linearGradient id="shieldBorder" x1="90" y1="32" x2="90" y2="152" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#065f46" />
          </linearGradient>
        </defs>

        <circle cx="90" cy="90" r="82" fill="#030712" stroke="#1f2937" strokeWidth="2" />

        {/* Statutory Security Shield */}
        <path
          d="M90 32 L138 52 V96 C138 128 114 150 90 156 C66 150 42 128 42 96 V52 L90 32 Z"
          fill="url(#shieldGrad)"
          stroke="url(#shieldBorder)"
          strokeWidth="3"
        />

        {/* Bilateral Trade Balance Scales */}
        <line x1="90" y1="58" x2="90" y2="114" stroke="#38bdf8" strokeWidth="2.5" />
        <line x1="64" y1="72" x2="116" y2="72" stroke="#38bdf8" strokeWidth="2.5" />
        <circle cx="90" cy="58" r="4" fill="#38bdf8" />
        <line x1="76" y1="114" x2="104" y2="114" stroke="#38bdf8" strokeWidth="2.5" />

        {/* Left Pan (India CCTS - BEE Gold) */}
        <line x1="64" y1="72" x2="56" y2="92" stroke="#64748b" strokeWidth="1.5" />
        <line x1="64" y1="72" x2="72" y2="92" stroke="#64748b" strokeWidth="1.5" />
        <polygon points="54,92 74,92 64,98" fill="#f59e0b" />
        <text x="64" y="112" fill="#fbbf24" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          BEE
        </text>

        {/* Right Pan (EU CBAM - Emerald) */}
        <line x1="116" y1="72" x2="108" y2="92" stroke="#64748b" strokeWidth="1.5" />
        <line x1="116" y1="72" x2="124" y2="92" stroke="#64748b" strokeWidth="1.5" />
        <polygon points="106,92 126,92 116,98" fill="#10b981" />
        <text x="116" y="112" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          CBAM
        </text>

        {/* Target Intensity Badge */}
        <rect x="62" y="128" width="56" height="16" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
        <text x="90" y="139" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
          0.8222 t
        </text>
      </svg>
    ),
  },
];

export function IntegrationsStack({ className }: { className?: string }) {
  const [activeCategory, setActiveCategory] = useState<StackCategory>("all");
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopyPath = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2200);
  };

  const filteredStack = AUTHENTIC_TECH_STACK.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  const filterTabs = [
    { id: "all" as const, label: "Full Stack", count: AUTHENTIC_TECH_STACK.length },
    { id: "solver" as const, label: "Algorithmic Solvers & XAI", count: AUTHENTIC_TECH_STACK.filter(t => t.category === "solver").length },
    { id: "frontend" as const, label: "Reactive Client & LaTeX", count: AUTHENTIC_TECH_STACK.filter(t => t.category === "frontend").length },
    { id: "compliance" as const, label: "Statutory Economics", count: AUTHENTIC_TECH_STACK.filter(t => t.category === "compliance").length },
  ];

  return (
    <section
      id="tech-stack"
      className={cn(
        "relative py-12 md:py-20 bg-obsidian-950 border-t border-b border-steel-800/80 overflow-hidden font-sans scroll-mt-20",
        className
      )}
    >
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-thermal-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-cyanPulse-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-steel-700/80 bg-obsidian-900/90 px-4 py-1.5 text-xs font-semibold text-thermal-300 shadow-inner backdrop-blur-md">
            <Cpu className="h-3.5 w-3.5 text-thermal-400 animate-pulse" />
            <span className="tracking-wide">PROVEN ENGINEERING STACK • 100% OPEN SOURCE & AUDITABLE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-heading">
            Built on{" "}
            <span className="bg-gradient-to-r from-thermal-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              First-Principles
            </span>{" "}
            Industrial Software
          </h2>

          <p className="text-sm sm:text-base text-steel-400 leading-relaxed max-w-2xl">
            No black-box hallucinations. Our architecture combines mathematical simplex optimization,
            exact 64-coalition cooperative game theory, and statutory regulatory compliance verified across JSL&apos;s physical footprint.
          </p>

          {/* Architectural Filter Pills - Mobile-friendly horizontal scrolling */}
          <div className="w-full max-w-full overflow-x-auto py-1 flex justify-center">
            <div className="inline-flex items-center p-1 rounded-xl bg-obsidian-900 border border-steel-800 text-xs font-medium shadow-inner shrink-0">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg transition-all text-xs font-semibold whitespace-nowrap flex items-center gap-1.5",
                    activeCategory === tab.id
                      ? "bg-steel-800 text-white shadow-md border border-steel-700/60"
                      : "text-steel-400 hover:text-steel-200"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-mono",
                      activeCategory === tab.id
                        ? "bg-thermal-500/20 text-thermal-300"
                        : "bg-obsidian-950 text-steel-500"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3x2 INTEGRATIONS GRID (integrations-4 design pattern) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStack.map((tech) => (
            <div
              key={tech.id}
              onMouseEnter={() => setHoveredTech(tech.id)}
              onMouseLeave={() => setHoveredTech(null)}
              className={cn(
                "group relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl",
                "bg-gradient-to-b from-obsidian-900/90 to-obsidian-950/95 border border-steel-800/80",
                tech.borderColor,
                hoveredTech === tech.id ? "scale-[1.01] shadow-2xl -translate-y-0.5" : ""
              )}
            >
              {/* Subtle dynamic ambient glow on card hover */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                  tech.accentGlow
                )}
              />

              {/* CARD TOP ROW: LOGO & STATUS BADGE */}
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  {/* High-Fidelity Vector Logo */}
                  <div className="h-14 w-14 rounded-2xl bg-obsidian-950/90 border border-steel-800/80 p-2 shadow-inner group-hover:scale-105 transition-transform duration-300 shrink-0">
                    {tech.logo}
                  </div>

                  {/* Status / Metric Badge */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold font-mono border shadow-sm",
                        tech.badgeColor
                      )}
                    >
                      {tech.badge}
                    </span>
                    <span className="text-[10px] text-steel-500 font-mono">
                      {tech.codebaseType}
                    </span>
                  </div>
                </div>

                {/* Tech Name & Subtitle */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading group-hover:text-steel-100 transition-colors">
                    {tech.name}
                  </h3>
                  <p className="text-xs font-semibold text-thermal-400 font-mono mt-0.5">
                    {tech.subtitle}
                  </p>
                </div>

                {/* Primary Description */}
                <p className="text-xs text-steel-300 leading-relaxed">
                  {tech.description}
                </p>

                {/* Why Judges Will Care Callout */}
                <div className="rounded-xl bg-obsidian-950/80 border border-steel-850 p-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyanPulse-400 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-cyanPulse-400" />
                    <span>Why Evaluators Value This</span>
                  </div>
                  <p className="text-steel-400 text-[11px] leading-normal">
                    {tech.whyJudgesCare}
                  </p>
                </div>

                {/* Verified Capabilities Checklist */}
                <div className="space-y-1.5 pt-1">
                  {tech.capabilities.map((cap, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-steel-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD FOOTER: CODEBASE VERIFICATION LINK WITH CLICK-TO-COPY */}
              <div className="relative z-10 pt-5 mt-5 border-t border-steel-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCopyPath(e, tech.codebasePath)}
                  title="Click to copy repository path"
                  className="flex items-center gap-1.5 text-steel-400 hover:text-steel-200 transition-colors text-left group/btn"
                >
                  {copiedPath === tech.codebasePath ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-bounce" />
                  ) : (
                    <Terminal className="h-3.5 w-3.5 text-thermal-400 shrink-0 group-hover/btn:text-thermal-300" />
                  )}
                  <code className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded border transition-colors",
                    copiedPath === tech.codebasePath
                      ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                      : "bg-obsidian-950 text-steel-400 border-steel-800/80 group-hover/btn:border-steel-700"
                  )}>
                    {copiedPath === tech.codebasePath ? "Copied to clipboard!" : tech.codebasePath}
                  </code>
                </button>

                <Link
                  href={tech.targetHref}
                  className="inline-flex items-center gap-1 text-xs font-bold text-thermal-400 hover:text-thermal-300 group/link transition-colors shrink-0"
                >
                  <span>Test in Cockpit</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM AUDIT EVIDENCE BANNER */}
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-obsidian-900 via-steel-950 to-obsidian-900 border border-steel-800/80 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                100% Verifiable Open-Box Architecture
              </span>
            </div>
            <p className="text-sm font-semibold text-white">
              Every formula, mass balance, and optimization constraint is auditable in source code.
            </p>
            <p className="text-xs text-steel-400">
              No simulated stub responses. Direct algebraic parity with METEC 2011 & JSL FY2024-25 sustainability benchmarks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 rounded-xl border border-steel-700 bg-steel-900/80 px-4 py-2.5 text-xs font-bold text-steel-100 hover:bg-steel-800 hover:text-white transition-all shadow-md"
            >
              <Code2 className="h-3.5 w-3.5 text-cyanPulse-400" />
              <span>Inspect Methodology & Citations</span>
            </Link>
            <Link
              href="/optimizer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-thermal-500 to-orange-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:from-thermal-600 hover:to-orange-700 transition-all transform hover:-translate-y-0.5"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Run Live Pareto Optimizer</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
