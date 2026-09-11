"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, User, GraduationCap, Cpu, Terminal, ArrowRight, ShieldCheck, Code2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FaqSection } from "./faq-section";
import { cn } from "@/lib/utils";

export interface TeamMember {
  id: string;
  name: string;
  degree: string;
  department: string;
  institution: string;
  contribution: string;
  email: string;
  accentBorder: string;
  avatarBg: string;
  iconColor: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "member-1",
    name: "Vanshika Diwan",
    degree: "3rd Year B.Tech",
    department: "Mining Engineering",
    institution: "National Institute of Technology (NIT) Raipur",
    contribution:
      "Formulated EAF-AOD thermochemical mass balances, high-Cr slag liquidus & tramp copper containment boundaries ([Cu] \u2264 0.40%), and hot FeCr ladle sensible heat recovery (-113 kWh/t) across Odisha & Chhattisgarh corridors.",
    email: "vanshikadiwan7@gmail.com",
    accentBorder: "border-thermal-500/40 shadow-thermal-500/10 group-hover:border-thermal-400",
    avatarBg: "bg-thermal-500/10 text-thermal-400 border-thermal-500/30",
    iconColor: "text-thermal-400",
  },
  {
    id: "member-2",
    name: "Himanshi Rangare",
    degree: "3rd Year B.Tech",
    department: "Mining Engineering",
    institution: "National Institute of Technology (NIT) Raipur",
    contribution:
      "Engineered the full-stack digital twin platform, reactive sub-4ms client calculations, HiGHS linear programming integration for least-cost & least-carbon charge sheets, and operator cockpit telemetry interfaces.",
    email: "himanshi.rangare@gmail.com",
    accentBorder: "border-cyan-500/40 shadow-cyan-500/10 group-hover:border-cyan-400",
    avatarBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    iconColor: "text-cyan-400",
  },
  {
    id: "member-3",
    name: "Eshu",
    degree: "3rd Year B.Tech",
    department: "Mining Engineering",
    institution: "National Institute of Technology (NIT) Raipur",
    contribution:
      "Developed EU CBAM Regulation 2023/956 carbon accounting, simulated Article 9 offset deduction mechanisms, modeled India BEE CCTS statutory trajectories, and computed scrap Value-in-Use (ViU) shadow pricing.",
    email: "eshu.carbon@gmail.com",
    accentBorder: "border-emerald-500/40 shadow-emerald-500/10 group-hover:border-emerald-400",
    avatarBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
];

export function ContactTeam({ className }: { className?: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyEmail = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className={cn("bg-background w-full pt-4 pb-12 md:pt-6 md:pb-16 font-sans", className)}>
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        {/* Section Header - Tightened top spacing */}
        <div className="mb-8 sm:mb-10 flex flex-col items-center space-y-2.5 text-center">
          <Badge variant="thermal" className="rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
            Team Hind • NIT Raipur
          </Badge>

          <h1 className="text-foreground text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-heading">
            Meet{" "}
            <span className="bg-gradient-to-r from-thermal-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
              Team Hind
            </span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-sm sm:text-base leading-relaxed">
            3rd Year B.Tech Mining Engineering undergraduates from National Institute of Technology (NIT) Raipur building the closed-loop pyrometallurgical carbon & energy cockpit for Jindal Stainless Limited.
          </p>
        </div>

        {/* 3 Team Member Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border border-border border-t border-b overflow-hidden rounded-2xl shadow-xl">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={member.id}
              onClick={() => handleCopyEmail(member.id, member.email)}
              className={cn(
                "group flex flex-col items-center px-6 py-8 sm:py-10 text-center transition-all duration-200 cursor-pointer select-none",
                "hover:bg-muted/80 dark:hover:bg-neutral-800/80",
                idx % 2 === 0 ? "bg-background" : "bg-muted/40"
              )}
              title="Click to copy contact email"
            >
              {/* Clean Human DP Icon */}
              <div
                className={cn(
                  "relative mb-5 h-20 w-20 sm:h-24 sm:w-24 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:scale-105 shadow-xl",
                  member.avatarBg,
                  member.accentBorder
                )}
              >
                <User className={cn("h-10 w-10 sm:h-12 sm:w-12 transition-colors", member.iconColor)} />
                <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10 pointer-events-none" />
              </div>

              {/* Team Member Name */}
              <h2 className="text-foreground mb-1.5 text-xl font-bold tracking-tight font-heading group-hover:text-thermal-300 transition-colors">
                {member.name}
              </h2>

              {/* Academic Details */}
              <div className="mb-4 flex flex-col items-center gap-1">
                <span className={cn("inline-flex items-center gap-1 text-xs font-mono font-semibold", member.iconColor)}>
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>{member.degree} • {member.department}</span>
                </span>
                <span className="text-[11px] text-steel-400 font-medium">
                  {member.institution}
                </span>
              </div>

              {/* Team Contribution */}
              <div className="mt-1 mb-6 flex-1 text-left w-full rounded-xl bg-obsidian-950/80 border border-steel-800/80 p-3.5 sm:p-4 group-hover:border-steel-700/80 transition-colors">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-steel-400 block mb-1.5">
                  Project Contribution
                </span>
                <p className="text-steel-300 text-xs leading-relaxed">
                  {member.contribution}
                </p>
              </div>

              {/* Email Button */}
              <div className="mt-auto inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-steel-900/90 border border-steel-800 text-xs font-mono text-steel-300 group-hover:text-white group-hover:border-steel-700 transition-colors">
                <Mail className={cn("h-3.5 w-3.5", member.iconColor)} />
                <span>{copiedId === member.id ? "Copied Email!" : member.email}</span>
              </div>
            </div>
          ))}
        </div>

        {/* TEAM HIND VERIFIED CODEBASE PROVENANCE */}
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-obsidian-900 via-steel-950 to-obsidian-900 border border-steel-800/80 p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-steel-800/60">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-steel-700/80 bg-obsidian-950 px-3 py-1 text-[11px] font-semibold text-thermal-300 mb-2">
                <Cpu className="h-3 w-3 text-thermal-400 animate-pulse" />
                <span>CODEBASE PROVENANCE • 100% VERIFIED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                Authentic Engineering Allocations
              </h2>
              <p className="text-xs text-steel-400 mt-1 max-w-2xl">
                Every line of mathematical optimization, thermochemical mass balance, and statutory carbon accounting was engineered directly by Team Hind.
              </p>
            </div>
            <Link
              href="/#tech-stack"
              className="inline-flex items-center gap-1.5 rounded-xl border border-steel-700 bg-steel-900/80 px-4 py-2 text-xs font-bold text-thermal-400 hover:text-thermal-300 hover:bg-steel-800 transition-all shadow shrink-0"
            >
              <span>Explore All 6 Engines</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
            <div className="rounded-xl bg-obsidian-950/90 border border-steel-850 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">HiGHS Simplex LP & Next.js 14</span>
                <span className="text-[10px] font-mono text-cyanPulse-400">Himanshi</span>
              </div>
              <p className="text-[11px] text-steel-400">Continuous 12-feed multi-objective charge solver & sub-4ms client telemetry.</p>
              <code className="text-[10px] font-mono text-steel-500 block pt-1">frontend/src/lib/optimizer.ts</code>
            </div>

            <div className="rounded-xl bg-obsidian-950/90 border border-steel-850 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Healy De-P & Thermochemical SEC</span>
                <span className="text-[10px] font-mono text-thermal-400">Vanshika</span>
              </div>
              <p className="text-[11px] text-steel-400">Healy 1970 slag partition, tramp copper caps, and -113 kWh/t hot FeCr sensible heat.</p>
              <code className="text-[10px] font-mono text-steel-500 block pt-1">frontend/src/lib/calculator.ts</code>
            </div>

            <div className="rounded-xl bg-obsidian-950/90 border border-steel-850 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Shapley XAI & BEE CCTS / CBAM</span>
                <span className="text-[10px] font-mono text-emerald-400">Eshu</span>
              </div>
              <p className="text-[11px] text-steel-400">64-coalition exact additive closure (0.0000 error) & Article 9 reciprocal tariff deductions.</p>
              <code className="text-[10px] font-mono text-steel-500 block pt-1">jsl_carbon_engine/agent/shap_engine.py</code>
            </div>
          </div>
        </div>

        {/* JSL PYROMETALLURGICAL FAQS (faq-1 architecture) */}
        <FaqSection className="mt-8 px-0" />

        {/* Footer Note */}
        <div className="mt-8 text-center border-t border-steel-800/80 pt-6">
          <p className="text-muted-foreground mx-auto max-w-xl text-xs leading-relaxed">
            Team Hind • National Institute of Technology (NIT) Raipur • Jindal Stainless Decarbonization & Pyrometallurgical Cockpit 2026.
          </p>
        </div>
      </div>
    </section>
  );
}
