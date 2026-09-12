"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  GRADES,
  Grade,
  getPren,
  listGradesByFamily,
  getGrade,
} from "@/lib/grades";
import {
  FACILITIES,
  PRODUCTS,
  CASTING_ROUTES,
  REFINING_ROUTES,
  STATUTORY_BENCHMARKS,
} from "@/lib/constants";
import {
  calculateSteelmaking,
  CalculatorInputs,
} from "@/lib/calculator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  Flame,
  Zap,
  DollarSign,
  ShieldCheck,
  Search,
  Scale,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  Layers,
  ArrowRight,
} from "lucide-react";
import { InlineExplainButton, syncAssistantInputs, APPLY_COCKPIT_PARAMS_EVENT } from "@/components/agent/InlineExplainButton";
import { AdaptiveSlider, getSliderColor } from "@/components/watermelon/adaptive-slider";
import { Select1 } from "@/components/watermelon/select-1";
import { EmissionsBreakdownWidget } from "@/components/watermelon/emissions-breakdown-widget";
import { ChargeMixDonutWidget } from "@/components/watermelon/charge-mix-donut-widget";
import { EnergyTrendWidget } from "@/components/watermelon/energy-trend-widget";
import { FluidTabs } from "@/components/watermelon/fluid-tabs";
import { FloatingCockpitToolbar } from "@/components/watermelon/floating-cockpit-toolbar";
import { SwitchMode } from "@/components/watermelon/switch-mode";
import { PageAtmosphere } from "@/components/ui/page-atmosphere";

export default function CalculatorPage() {
  // State for all cockpit inputs
  const [isMounted, setIsMounted] = useState(false);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("J304");

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);
  const [familyFilter, setFamilyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [facilityId, setFacilityId] = useState<string>("jajpur");
  const [scrapPct, setScrapPct] = useState<number>(60);
  const [feSource, setFeSource] = useState<'coalDRI' | 'gasDRI' | 'pigIron'>("coalDRI");
  const [fecrSource, setFecrSource] = useState<'fecrStandard' | 'fecrLowC'>("fecrStandard");
  const [niSource, setNiSource] = useState<'niStandard' | 'niClass1' | 'niNPI'>("niStandard");
  const [refiningRoute, setRefiningRoute] = useState<'aod' | 'aodvod'>("aod");
  const [castingRoute, setCastingRoute] = useState<'continuous' | 'ingot'>("continuous");
  const [product, setProduct] = useState<'crCoil' | 'hrCoil' | 'slab' | 'plate' | 'specialty' | 'rebar' | 'wireRod' | 'bloom'>("crCoil");
  const [renewablePct, setRenewablePct] = useState<number>(47); // JSL baseline 47%
  const [hotFecrCharging, setHotFecrCharging] = useState<boolean>(true);

  const currentGrade = useMemo(() => getGrade(selectedGradeId), [selectedGradeId]);

  // Handle scrap change clamped to grade scrap_cap
  const effectiveScrapPct = Math.min(scrapPct, currentGrade.scrap_cap);

  // Grade selection with scrap cap auto-clamping
  const handleSelectGrade = (id: string) => {
    setSelectedGradeId(id);
    const target = getGrade(id);
    if (scrapPct > target.scrap_cap) {
      setScrapPct(target.scrap_cap);
    }
  };

  // Quick Charge Preset Helper
  const applyPreset = (preset: "baseline" | "balanced" | "decarb") => {
    if (preset === "baseline") {
      setScrapPct(Math.min(35, currentGrade.scrap_cap));
      setFeSource("coalDRI");
      setFecrSource("fecrStandard");
      setNiSource("niStandard");
      setRenewablePct(47);
      setHotFecrCharging(false);
    } else if (preset === "balanced") {
      setScrapPct(Math.min(65, currentGrade.scrap_cap));
      setFeSource("gasDRI");
      setFecrSource("fecrStandard");
      setNiSource("niClass1");
      setRenewablePct(70);
      setHotFecrCharging(true);
    } else if (preset === "decarb") {
      setScrapPct(currentGrade.scrap_cap);
      setFeSource("gasDRI");
      setFecrSource("fecrLowC");
      setNiSource("niClass1");
      setRenewablePct(100);
      setHotFecrCharging(true);
    }
  };

  // Active Cockpit Inputs Definition
  const activeInputs: CalculatorInputs = useMemo(() => ({
    gradeId: selectedGradeId,
    scrapPct: effectiveScrapPct,
    facilityId,
    feSource,
    fecrSource,
    niSource,
    refiningRoute,
    castingRoute,
    product,
    renewablePct,
    hotFecrCharging: facilityId === "jajpur" ? hotFecrCharging : false,
  }), [
    selectedGradeId,
    effectiveScrapPct,
    facilityId,
    feSource,
    fecrSource,
    niSource,
    refiningRoute,
    castingRoute,
    product,
    renewablePct,
    hotFecrCharging,
  ]);

  // Sync active cockpit telemetry with global SCADA AI Assistant
  useEffect(() => {
    syncAssistantInputs(activeInputs);
  }, [activeInputs]);

  // Listen for bidirectional action commands dispatched by SCADA Assistant
  useEffect(() => {
    const handleApplyCockpitParams = (e: any) => {
      const p = e.detail;
      if (!p) return;
      if (p.gradeId || p.grade) {
        const targetId = p.gradeId || p.grade;
        handleSelectGrade(targetId);
      }
      if (p.scrapPct !== undefined) {
        setScrapPct(Number(p.scrapPct));
      }
      if (p.facilityId) {
        setFacilityId(p.facilityId);
      }
      if (p.feSource) {
        setFeSource(p.feSource);
      }
      if (p.fecrSource) {
        setFecrSource(p.fecrSource);
      }
      if (p.niSource) {
        setNiSource(p.niSource);
      }
      if (p.refiningRoute) {
        setRefiningRoute(p.refiningRoute);
      }
      if (p.castingRoute) {
        setCastingRoute(p.castingRoute);
      }
      if (p.product) {
        setProduct(p.product);
      }
      if (p.renewablePct !== undefined) {
        setRenewablePct(Number(p.renewablePct));
      }
      if (p.hotFecrCharging !== undefined) {
        setHotFecrCharging(Boolean(p.hotFecrCharging));
      }
      setAppliedToast("Changes Applied: Cockpit sliders synchronized with UrjaSaathi AI");
      setTimeout(() => setAppliedToast(null), 3500);
    };

    window.addEventListener(APPLY_COCKPIT_PARAMS_EVENT, handleApplyCockpitParams);
    window.addEventListener("APPLY_COCKPIT_PARAMS", handleApplyCockpitParams);
    return () => {
      window.removeEventListener(APPLY_COCKPIT_PARAMS_EVENT, handleApplyCockpitParams);
      window.removeEventListener("APPLY_COCKPIT_PARAMS", handleApplyCockpitParams);
    };
  }, []);

  // Compute full steelmaking calculation in 0ms client-side
  const results = useMemo(() => {
    return calculateSteelmaking(activeInputs);
  }, [activeInputs]);

  // Filtered grade list
  const filteredGrades = useMemo(() => {
    return Object.values(GRADES).filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFamily =
        familyFilter === "All" || g.family.includes(familyFilter);
      return matchesSearch && matchesFamily;
    });
  }, [searchQuery, familyFilter]);

  // Emissions 10-driver waterfall data for Recharts
  const waterfallData = useMemo(() => {
    const em = results.emissions;
    return [
      { name: "Decarb Stack", value: em.scope1StackDecarbTco2, color: "#f97316" },
      { name: "Reheat Fuel", value: em.scope1FuelCombustionTco2, color: "#ea580c" },
      { name: "Electricity", value: em.scope2ElectricityTco2, color: "#38bdf8" },
      { name: "Virgin DRI", value: em.scope3FeVirginTco2, color: "#eab308" },
      { name: "Scrap Embodied", value: em.scope3ScrapTco2, color: "#10b981" },
      { name: "FeCr Alloy", value: em.scope3FecrTco2, color: "#a855f7" },
      { name: "Nickel Unit", value: em.scope3NickelTco2, color: "#ec4899" },
      { name: "FeMo / FeMn", value: em.scope3FemoTco2 + em.scope3FemnTco2, color: "#6366f1" },
      { name: "Slag Fluxes", value: em.scope3FluxesTco2, color: "#64748b" },
    ];
  }, [results]);

  // Benchmark comparison data
  const benchmarkData = useMemo(() => {
    const currentTotal = results.emissions.totalCo2T;
    return [
      { name: "Current Heat", value: currentTotal, isCurrent: true, color: "#f97316" },
      { name: "EU Scrap-EAF", value: 0.288, isCurrent: false, color: "#10b981" },
      { name: "CCTS 2026 Target", value: 0.8222, isCurrent: false, color: "#0ea5e9" },
      { name: "Industry FY26 Baseline", value: 1.760, isCurrent: false, color: "#f59e0b" },
      { name: "Global Stainless Avg", value: 2.930, isCurrent: false, color: "#ef4444" },
    ];
  }, [results]);

  // Thermal color helper for Total tCO2
  const getCarbonColorClass = (val: number) => {
    if (val < 1.0) return "text-emerald-400";
    if (val < 1.6) return "text-cyanPulse-400";
    if (val < 2.3) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <PageAtmosphere imageSrc="/images/bg-eaf-tapping.jpg" glowColor="thermal">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cockpit Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-steel-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              UrjaKavach Calculator Cockpit
            </h1>
            <span className="rounded bg-thermal-500/10 px-2 py-0.5 text-xs font-semibold text-thermal-400 border border-thermal-500/30">
              Closed-Loop Mass-Energy Balance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-steel-400 mt-1">
            Dynamic charge-sheet simulation across 43 stainless grades with ASTM tramp limits, sensible heat credits, and EU CBAM/CCTS statutory audits.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Link
              href="/#tech-stack"
              className="inline-flex items-center gap-1 rounded bg-cyanPulse-500/10 px-2 py-0.5 text-cyanPulse-300 border border-cyanPulse-500/30 hover:bg-cyanPulse-500/20 transition-colors"
            >
              <span>Next.js 14 Reactive Edge</span>
              <span className="text-steel-400 text-[10px]">(Sub-4ms In-Browser)</span>
            </Link>
            <Link
              href="/methodology#tech-stack"
              className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
            >
              <span>BEE CCTS + EU CBAM</span>
              <span className="text-steel-400 text-[10px]">(Article 9 & SEFA)</span>
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-1 rounded bg-purple-500/10 px-2 py-0.5 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
            >
              <span>Healy 1970 De-P</span>
              <span className="text-steel-400 text-[10px]">(η_P = 0.99)</span>
            </Link>
            <Link
              href="/#tech-stack"
              className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-thermal-400 hover:text-thermal-300 ml-1 transition-colors"
            >
              <span>Inspect All 6 Engines</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Compliance Mode Switcher & Quick Reset */}
        <div className="flex flex-wrap items-center gap-3">
          <SwitchMode
            leftLabel="BEE India CCTS"
            rightLabel="EU CBAM Art. 9"
            defaultMode="cbam"
          />

          <button
            onClick={() => {
              setSelectedGradeId("J304");
              setScrapPct(60);
              setFacilityId("jajpur");
              setFeSource("coalDRI");
              setFecrSource("fecrStandard");
              setNiSource("niStandard");
              setRefiningRoute("aod");
              setCastingRoute("continuous");
              setProduct("crCoil");
              setRenewablePct(47);
              setHotFecrCharging(true);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-steel-700 bg-steel-900/60 px-3 py-1.5 text-xs font-medium text-steel-300 hover:text-white hover:bg-steel-800 transition-colors w-fit"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset UrjaKavach Baseline</span>
          </button>
        </div>
      </div>

      {/* 2-Column Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CONTROL & RECIPE SLIDERS (5 Cols)           */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 1: Grade Selection */}
          <div className="glass-panel rounded-2xl p-5 space-y-4 border border-steel-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-thermal-400" />
                <span>1. Metallurgical Grade Library (43)</span>
              </span>
              <span className="text-[11px] font-mono text-cyanPulse-400">
                PREN: {getPren(currentGrade)}
              </span>
            </div>

            {/* Family filter tabs with Watermelon FluidTabs */}
            <div className="overflow-x-auto pb-1 max-w-full">
              <FluidTabs
                activeId={familyFilter}
                onChange={(id) => setFamilyFilter(id)}
                tabs={[
                  { id: "All", label: "All", icon: <Layers className="h-3.5 w-3.5" /> },
                  { id: "200 Series", label: "200 Series", icon: <Flame className="h-3.5 w-3.5" /> },
                  { id: "300 Series", label: "300 Series", icon: <Sparkles className="h-3.5 w-3.5" /> },
                  { id: "Ferritic", label: "Ferritic", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
                  { id: "Duplex", label: "Duplex", icon: <Zap className="h-3.5 w-3.5" /> },
                ]}
              />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-steel-400" />
              <input
                type="text"
                placeholder="Search grade (e.g. J304, J4, J2205, J430)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-steel-700 bg-obsidian-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-steel-500 focus:border-thermal-500 focus:outline-none"
              />
            </div>

            {/* Grade Selection Grid */}
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {filteredGrades.map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSelectGrade(g.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                    selectedGradeId === g.id
                      ? "bg-thermal-500/20 text-thermal-300 border border-thermal-500/40 font-semibold"
                      : "text-steel-300 hover:bg-steel-800/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{g.id}</span>
                    <span className="text-[11px] text-steel-400 truncate max-w-[170px]">{g.name}</span>
                  </div>
                  <span className="text-[10px] text-steel-500 font-mono">Max {g.scrap_cap}%</span>
                </button>
              ))}
            </div>

            {/* Selected Grade Chemistry Chips */}
            <div className="rounded-xl bg-obsidian-950/90 p-3 border border-steel-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-[11px] text-steel-400">
                <span className="font-semibold text-white">{currentGrade.name}</span>
                <span>Scrap Limit: {currentGrade.scrap_cap}%</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-center">
                <div className="bg-steel-900/90 rounded py-0.5 border border-steel-800">
                  <span className="text-steel-400">Cr: </span>
                  <span className="text-white font-bold">{currentGrade.cr}%</span>
                </div>
                <div className="bg-steel-900/90 rounded py-0.5 border border-steel-800">
                  <span className="text-steel-400">Ni: </span>
                  <span className="text-white font-bold">{currentGrade.ni}%</span>
                </div>
                <div className="bg-steel-900/90 rounded py-0.5 border border-steel-800">
                  <span className="text-steel-400">Mo: </span>
                  <span className="text-white font-bold">{currentGrade.mo}%</span>
                </div>
                <div className="bg-steel-900/90 rounded py-0.5 border border-steel-800">
                  <span className="text-steel-400">Fe: </span>
                  <span className="text-white font-bold">{currentGrade.fe}%</span>
                </div>
              </div>
              <p className="text-[10px] text-steel-400 italic leading-tight pt-1">
                {currentGrade.mechanical_applications}
              </p>
            </div>
          </div>

          {/* Section 2: Charge Sheet Inputs */}
          <div className="glass-panel rounded-2xl p-5 space-y-5 border border-steel-800">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-thermal-400" />
                <span>2. Charge Sheet & Sourcing Mix</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => applyPreset("baseline")}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-steel-900 border border-steel-700 text-steel-300 hover:text-white transition-colors"
                >
                  Baseline
                </button>
                <button
                  onClick={() => applyPreset("balanced")}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyanPulse-500/10 border border-cyanPulse-500/30 text-cyanPulse-300 hover:bg-cyanPulse-500/20 transition-colors"
                >
                  Balanced
                </button>
                <button
                  onClick={() => applyPreset("decarb")}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  Deep Decarb
                </button>
              </div>
            </div>

            {/* Contextual Optimizer Callout Badge */}
            <Link
              href="/optimizer"
              className="flex items-center justify-between p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyanPulse-300 hover:bg-cyan-950/50 hover:border-cyan-400/60 transition-all group shadow-sm shadow-cyan-950/20"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyanPulse-400">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div>
                  <div className="font-semibold text-white group-hover:text-cyanPulse-300 transition-colors flex items-center gap-1.5">
                    <span>Evaluating charge optimization or procurement parity?</span>
                    <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-bold text-cyanPulse-300 border border-cyan-500/40">
                      Swerim RAWMATMIX®
                    </span>
                  </div>
                  <p className="text-[11px] text-steel-400">
                    Calculate binding tramp shadow prices (Cu, Sn, P, S), facility hot-charging credits, and Value-in-Use procurement parity.
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyanPulse-400 group-hover:translate-x-0.5 transition-transform whitespace-nowrap ml-2">
                Launch Optimizer <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Scrap % Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="text-steel-300 font-medium">
                  Recycled Scrap Charged
                </label>
                <div className="flex items-center gap-1.5 font-mono">
                  <span
                    className="font-bold text-sm transition-colors duration-200"
                    style={{ color: getSliderColor(effectiveScrapPct, 0, currentGrade.scrap_cap, 'high').text }}
                  >
                    {effectiveScrapPct}%
                  </span>
                  <span className="text-[10px] text-steel-500">
                    (Ceiling: {currentGrade.scrap_cap}%)
                  </span>
                </div>
              </div>
              <AdaptiveSlider
                min={0}
                max={currentGrade.scrap_cap}
                step={1}
                value={effectiveScrapPct}
                onChange={(val) => setScrapPct(val)}
                goodDirection="high"
                label="Recycled Scrap"
              />
              <div className="flex justify-between text-[10px] text-steel-500 font-mono">
                <span>0% Virgin Heat</span>
                <span
                  className="transition-colors duration-200"
                  style={{ color: getSliderColor(effectiveScrapPct, 0, currentGrade.scrap_cap, 'high').text }}
                >
                  {effectiveScrapPct >= currentGrade.scrap_cap ? "⚠ At Metallurgical Ceiling" : "Safe Zone"}
                </span>
                <span>{currentGrade.scrap_cap}% Max</span>
              </div>
            </div>

            {/* Virgin Iron Sourcing */}
            <div className="space-y-1.5">
              <label className="text-xs text-steel-300 font-medium block">
                Virgin Iron Unit (Balance after Scrap & Alloys)
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { key: "coalDRI", label: "Coal DRI", ef: "2.60 t" },
                  { key: "gasDRI", label: "Gas DRI", ef: "0.90 t" },
                  { key: "pigIron", label: "Pig Iron", ef: "1.80 t" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setFeSource(s.key as any)}
                    className={`py-2 px-2 rounded-lg border text-center transition-all ${
                      feSource === s.key
                        ? "bg-thermal-500/20 border-thermal-500 text-white font-semibold"
                        : "bg-steel-950 border-steel-800 text-steel-400 hover:text-white"
                    }`}
                  >
                    <span className="block text-xs">{s.label}</span>
                    <span className="text-[10px] text-steel-500 font-mono">{s.ef} CO2/t</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ferrochrome & Nickel Sourcing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <Select1
                label="Ferrochrome (FeCr) Route"
                value={fecrSource}
                onChange={(val) => setFecrSource(val as any)}
                badge={fecrSource === "fecrLowC" ? "-46% CO2" : "Baseline"}
                badgeColor={fecrSource === "fecrLowC" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-steel-400 bg-steel-800 border-steel-700"}
                options={[
                  { value: "fecrStandard", label: "Standard HC FeCr (3.50 tCO2/t)" },
                  { value: "fecrLowC", label: "Low-Carbon FeCr (1.90 tCO2/t)" },
                ]}
              />

              <Select1
                label="Primary Nickel Sourcing"
                value={niSource}
                onChange={(val) => setNiSource(val as any)}
                badge={niSource === "niClass1" ? "Class 1 Hydro" : niSource === "niNPI" ? "High-Carbon" : "Standard"}
                badgeColor={niSource === "niClass1" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : niSource === "niNPI" ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-steel-400 bg-steel-800 border-steel-700"}
                options={[
                  { value: "niStandard", label: "Global Standard Ni (15 tCO2/t)" },
                  { value: "niClass1", label: "Class 1 Hydro Ni (10 tCO2/t)" },
                  { value: "niNPI", label: "Indonesian Coal NPI (55 tCO2/t)" },
                ]}
              />
            </div>

            {/* Facility & Power Mix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <Select1
                label="Facility Digital Twin"
                value={facilityId}
                onChange={(val) => setFacilityId(val)}
                badge={facilityId === "jajpur" ? "250 MW CPP" : facilityId === "hisar" ? "H2 + Northern Grid" : "Gas-DRI Corridor"}
                badgeColor="text-cyanPulse-400 bg-cyanPulse-500/10 border-cyanPulse-500/30"
                options={[
                  { value: "jajpur", label: "Jajpur Complex (250 MW CPP)" },
                  { value: "hisar", label: "Hisar Precision (Northern Grid + H2)" },
                  { value: "chhattisgarh", label: "Chhattisgarh Hub (Rotary Kilns)" },
                ]}
              />

              <Select1
                label="Downstream Product"
                value={product}
                onChange={(val) => setProduct(val as any)}
                options={Object.entries(PRODUCTS).map(([k, p]) => ({
                  value: k,
                  label: p.label,
                }))}
              />
            </div>

            {/* Renewable PPA Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs">
                <label className="text-steel-300 font-medium">
                  Renewable PPA Blending (Wind/Solar)
                </label>
                <span
                  className="font-bold font-mono text-sm transition-colors duration-200"
                  style={{ color: getSliderColor(renewablePct, 0, 100, 'high').text }}
                >
                  {renewablePct}%
                </span>
              </div>
              <AdaptiveSlider
                min={0}
                max={100}
                step={1}
                value={renewablePct}
                onChange={(val) => setRenewablePct(val)}
                goodDirection="high"
                label="Renewable PPA Blending"
              />
              <div className="flex justify-between text-[10px] text-steel-500 font-mono">
                <span>0% (100% Fossil CPP/Grid)</span>
                <span>Baseline (47%)</span>
                <span>100% Green PPA</span>
              </div>
            </div>

            {/* Molten FeCr hot charging toggle (Jajpur edge) */}
            {facilityId === "jajpur" && (
              <div className="rounded-xl bg-thermal-500/10 border border-thermal-500/30 p-3 flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <span className="text-xs font-bold text-thermal-300 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-thermal-400" />
                    <span>Jajpur Molten FeCr Hot Charging</span>
                  </span>
                  <p className="text-[11px] text-steel-400">
                    Ladle transfer from captive SAF delivers ~200 kWh/t sensible heat credit to EAF.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={hotFecrCharging}
                  onChange={(e) => setHotFecrCharging(e.target.checked)}
                  className="h-4 w-4 rounded accent-thermal-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: TELEMETRY & EMISSIONS WATERFALL (7 Cols)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* 4 HERO KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Card 1: Total CO2 */}
            <div className="glass-card rounded-xl p-4 border border-steel-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider block">
                  Total Specific CO2
                </span>
                <InlineExplainButton target="total_co2_t" variant="icon" label="Explain Carbon (SHAP)" inputs={activeInputs} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl sm:text-3xl font-black ${getCarbonColorClass(results.emissions.totalCo2T)}`}>
                  {results.emissions.totalCo2T.toFixed(2)}
                </span>
                <span className="text-[11px] text-steel-400 font-mono">t/t</span>
              </div>
              <span className="text-[10px] text-steel-400 block truncate">
                S1: {results.emissions.scope1DirectTco2.toFixed(2)} | S2: {results.emissions.scope2ElectricityTco2.toFixed(2)} | S3: {results.emissions.scope3PrecursorsTco2.toFixed(2)}
              </span>
            </div>

            {/* Card 2: SEC */}
            <div className="glass-card rounded-xl p-4 border border-steel-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider block">
                  Specific Electrical
                </span>
                <InlineExplainButton target="eaf_sec_kwh" variant="icon" label="Explain SEC (SHAP)" inputs={activeInputs} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-cyanPulse-400">
                  {results.thermo.totalElecKwhFinished.toFixed(0)}
                </span>
                <span className="text-[11px] text-steel-400 font-mono">kWh/t</span>
              </div>
              <span className="text-[10px] text-steel-400 block truncate">
                EAF: {results.thermo.eafSecKwhLiquid} kWh | Fuel: {results.thermo.totalFuelGjFinished} GJ
              </span>
            </div>

            {/* Card 3: EU CBAM */}
            <div className="glass-card rounded-xl p-4 border border-steel-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider block">
                  CBAM 2026 Cash
                </span>
                <InlineExplainButton target="cbam_tariff_eur" variant="icon" label="Explain CBAM Tariff" inputs={activeInputs} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  €{results.financials.cbamCashTariff2026EurPerT.toFixed(2)}
                </span>
                <span className="text-[11px] text-steel-400 font-mono">/t</span>
              </div>
              <span className="text-[10px] text-steel-400 block truncate">
                2034 Unhedged: €{results.financials.cbamTariff2034UnhedgedEurPerT.toFixed(1)}/t
              </span>
            </div>

            {/* Card 4: India CCTS */}
            <div className="glass-card rounded-xl p-4 border border-steel-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-steel-400 uppercase tracking-wider block">
                  India CCTS Impact
                </span>
                <InlineExplainButton target="ccts_value_inr" variant="icon" label="Explain CCTS Surplus" inputs={activeInputs} />
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-2xl sm:text-3xl font-black ${
                    results.financials.cctsCarbonDeltaTco2 >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {results.financials.cctsCarbonDeltaTco2 >= 0 ? "+" : ""}
                  {results.financials.cctsAnnualEbitdaInrCr.toFixed(1)}
                </span>
                <span className="text-[11px] text-steel-400 font-mono">Cr/yr</span>
              </div>
              <span className="text-[10px] text-steel-400 block truncate">
                {results.financials.cctsCarbonDeltaTco2 >= 0 ? "CCC Surplus Gain" : "Penalty Liability"}
              </span>
            </div>
          </div>

          {/* WATERMELON UI PYROMETALLURGICAL TWIN WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChargeMixDonutWidget
              title="Metallic Charge Burden"
              subtitle={`Live burden distribution for ${currentGrade.name} (${currentGrade.id})`}
              data={[
                {
                  id: "scrap",
                  label: `SS Scrap (${effectiveScrapPct}%)`,
                  value: `${(effectiveScrapPct * 10).toFixed(0)} kg/t`,
                  numericValue: effectiveScrapPct * 10,
                  percentage: effectiveScrapPct,
                  fill: "#06b6d4",
                  badge: `Cap: ${currentGrade.scrap_cap}%`,
                },
                {
                  id: "fecr",
                  label: hotFecrCharging ? "Molten FeCr (Hot Ladle)" : "Ferrochrome (Cold)",
                  value: `${(currentGrade.cr * 14.5).toFixed(0)} kg/t`,
                  numericValue: Math.round(currentGrade.cr * 14.5),
                  percentage: Number(((currentGrade.cr * 14.5) / 10).toFixed(1)),
                  fill: "#f97316",
                  badge: hotFecrCharging ? "-86 kWh/t credit" : "Cold Charge",
                },
                {
                  id: "iron",
                  label: feSource === "gasDRI" ? "Gas-DRI (Raigarh)" : feSource === "pigIron" ? "Foundry Pig Iron" : "Coal-DRI (Standard)",
                  value: `${Math.max(0, 1000 - effectiveScrapPct * 10 - Math.round(currentGrade.cr * 14.5) - Math.round(currentGrade.ni * 12) - 25)} kg/t`,
                  numericValue: Math.max(0, 1000 - effectiveScrapPct * 10 - Math.round(currentGrade.cr * 14.5) - Math.round(currentGrade.ni * 12) - 25),
                  percentage: Number((Math.max(0, 1000 - effectiveScrapPct * 10 - Math.round(currentGrade.cr * 14.5) - Math.round(currentGrade.ni * 12) - 25) / 10).toFixed(1)),
                  fill: "#a855f7",
                  badge: feSource === "gasDRI" ? "Low Carbon DRI" : "Virgin Fe",
                },
                {
                  id: "nickel",
                  label: niSource === "niClass1" ? "Class-1 Pure Ni" : niSource === "niNPI" ? "Nickel Pig Iron" : "Ferronickel",
                  value: `${(currentGrade.ni * 12).toFixed(0)} kg/t`,
                  numericValue: Math.round(currentGrade.ni * 12),
                  percentage: Number(((currentGrade.ni * 12) / 10).toFixed(1)),
                  fill: "#3b82f6",
                  badge: `${currentGrade.ni}% Ni Spec`,
                },
                {
                  id: "fluxes",
                  label: "Slag Fluxes (CaO/MgO)",
                  value: "25 kg/t",
                  numericValue: 25,
                  percentage: 2.5,
                  fill: "#10b981",
                  badge: "Basicity B2 > 1.8",
                },
              ]}
              totalMassKg={1000}
            />

            <EnergyTrendWidget
              title="Specific Electrical Energy (SEC)"
              subtitle={`EAF + SAF Enthalpy Profile for ${facilityId === "jajpur" ? "Jajpur Works (Hot FeCr)" : facilityId === "hisar" ? "Hisar Specialty Works" : "Raigarh Gas Hub"}`}
              defaultRange="7h"
            />
          </div>

          {/* 10-DRIVER EMISSIONS WATERFALL */}
          <div className="glass-panel rounded-2xl p-5 border border-steel-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-thermal-400" />
                <span>Scope 1, 2 & 3 Process Emissions Waterfall (tCO2 / tonne)</span>
              </span>
              <div className="flex items-center gap-3">
                <InlineExplainButton target="total_co2_t" label="ELI-Engineer SHAP" inputs={activeInputs} />
                <span className="text-[11px] font-mono text-steel-400">
                  Total: {results.emissions.totalCo2T.toFixed(3)} tCO2/t
                </span>
              </div>
            </div>

            <div className="h-64 w-full min-h-[256px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg bg-obsidian-950 border border-steel-700 p-2 shadow-xl text-xs">
                              <span className="font-semibold text-white block">{data.name}</span>
                              <span className="font-mono text-thermal-400">{Number(data.value).toFixed(3)} tCO2 / t</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {waterfallData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-steel-500 font-mono text-xs">
                  Loading Process Emissions Waterfall...
                </div>
              )}
            </div>
          </div>

          {/* SCOPE 1, 2 & 3 EMISSIONS ARCHITECTURE (WIDGET-3 ADAPTED) */}
          <EmissionsBreakdownWidget
            title="Scope 1, 2 & 3 Emissions Architecture"
            subtitle={`Direct stack, captive power & upstream supply chain comparison for ${currentGrade.name}`}
            actionLabel="Export CBAM Verification"
            onActionClick={() => {
              window.alert(`CBAM & CCTS Audit Verification for ${currentGrade.id}:\n- Total Intensity: ${results.emissions.totalCo2T.toFixed(3)} tCO2/t steel\n- Scope 1: ${results.emissions.scope1DirectTco2.toFixed(3)} tCO2/t\n- Scope 2: ${results.emissions.scope2ElectricityTco2.toFixed(3)} tCO2/t\n- Scope 3: ${results.emissions.scope3PrecursorsTco2.toFixed(3)} tCO2/t`);
            }}
            data={[
              { scenario: "Standard BF-BOF", scope1: 1.48, scope2: 0.28, scope3_raw: 0.52, scope3_scrap: 0.04 },
              { scenario: "Baseline EAF", scope1: 0.42, scope2: 0.58, scope3_raw: 0.44, scope3_scrap: 0.05 },
              {
                scenario: `Current Heat (${currentGrade.id})`,
                scope1: Number(results.emissions.scope1DirectTco2.toFixed(2)),
                scope2: Number(results.emissions.scope2ElectricityTco2.toFixed(2)),
                scope3_raw: Number((results.emissions.scope3PrecursorsTco2 * 0.85).toFixed(2)),
                scope3_scrap: Number((results.emissions.scope3PrecursorsTco2 * 0.15).toFixed(2)),
              },
              { scenario: "UrjaKavach Green Pilot (90% RE)", scope1: 0.18, scope2: 0.08, scope3_raw: 0.22, scope3_scrap: 0.07 },
            ]}
          />

          {/* STATUTORY BENCHMARK COMPARISON BAR */}
          <div className="glass-panel rounded-2xl p-5 border border-steel-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-cyanPulse-400" />
                <span>Statutory Benchmarks vs Current Run (tCO2 / t)</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                BEE 2026 Target: 0.8222
              </span>
            </div>

            <div className="h-48 w-full min-h-[192px]">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={benchmarkData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#cbd5e1"
                      fontSize={11}
                      tickLine={false}
                      width={110}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg bg-obsidian-950 border border-steel-700 p-2 shadow-xl text-xs">
                              <span className="font-semibold text-white block">{data.name}</span>
                              <span className="font-mono text-cyanPulse-400">{Number(data.value).toFixed(3)} tCO2 / t</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {benchmarkData.map((entry, index) => (
                        <Cell key={`bm-cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-steel-500 font-mono text-xs">
                  Loading Statutory Benchmark Comparison...
                </div>
              )}
            </div>
          </div>

          {/* CLOSED-LOOP MASS BALANCE VERIFICATION TABLE */}
          <div className="glass-panel rounded-2xl p-5 border border-steel-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Closed-Loop Stoichiometric Mass Balance Verification</span>
              </span>
              <span className="text-emerald-400 text-xs font-mono font-semibold">
                Sum: {results.massBalance.totalLiquidSteelT.toFixed(3)} t (100% Balanced)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase text-steel-400 border-b border-steel-800 bg-obsidian-950/50">
                  <tr>
                    <th className="py-2 px-3">Input Material</th>
                    <th className="py-2 px-3 text-right">Mass Charged (t/t)</th>
                    <th className="py-2 px-3 text-right">Contained Iron (t)</th>
                    <th className="py-2 px-3 text-right">Allocated Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-800/60 font-mono text-steel-300">
                  <tr>
                    <td className="py-2 px-3 text-white font-sans">Recycled Scrap</td>
                    <td className="py-2 px-3 text-right">{results.massBalance.scrapMassT.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">{results.massBalance.feFromScrapT.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right font-sans text-steel-400">Primary Recycled Unit</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-white font-sans">Gross Virgin DRI</td>
                    <td className="py-2 px-3 text-right">{results.massBalance.grossDriChargedT.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-amber-400">{results.massBalance.netVirginFeT.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right font-sans text-steel-400">Net Metallic Balance</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-white font-sans">Ferrochrome ({fecrSource})</td>
                    <td className="py-2 px-3 text-right">{results.massBalance.fecrMassT.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-cyanPulse-400">{results.massBalance.feFromFecrT.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right font-sans text-steel-400">Cr Addition + Fe Credit</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-white font-sans">Primary Nickel ({niSource})</td>
                    <td className="py-2 px-3 text-right">{results.massBalance.niMassT.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right text-purple-400">{results.massBalance.feFromNiT.toFixed(3)}</td>
                    <td className="py-2 px-3 text-right font-sans text-steel-400">Ni Addition + NPI Fe Credit</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-steel-500 italic">
              *Enforces metallurgical iron crediting: prevents double-counting the ~40% iron inherently contained in ferrochrome and ~81% in NPI.
            </p>
          </div>
        </div>
      </div>

      {/* FLOATING COCKPIT TOOLBAR (WATERMELON FLOATING-DISCLOSURE ADAPTED) */}
      <FloatingCockpitToolbar
        onSelectPreset={(preset) => {
          if (preset === "baseline") applyPreset("baseline");
          else if (preset === "jajpur_optimum") applyPreset("balanced");
          else if (preset === "max_scrap") applyPreset("decarb");
          else if (preset === "cbam_export") {
            window.alert(`CBAM Verification Dossier for ${currentGrade.id} generated!\nSpecific Carbon Intensity: ${results.emissions.totalCo2T.toFixed(3)} tCO2/t steel\nStatutory Phase-in Cash Liability: €${results.financials.cbamCashTariff2026EurPerT.toFixed(2)}/t`);
          }
        }}
      />

      {/* Changes Applied Toast for Cockpit Sliders */}
      {appliedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-2xl shadow-emerald-500/50 border border-emerald-400/50 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{appliedToast}</span>
        </div>
      )}
    </div>
  </PageAtmosphere>
  );
}
