"use client";

import React, { useState } from "react";
import { UrjaKavachLogo, LogoDesign } from "./UrjaKavachLogo";
import { Shield, Flame, Atom, Sparkles, Check, Copy } from "lucide-react";

interface LogoInfo {
  design: LogoDesign;
  name: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  badge: string;
}

const LOGO_DESIGNS: LogoInfo[] = [
  {
    design: "shield",
    name: "The Kavach Armor",
    tagline: "Primary Decarbonization Shield",
    description:
      "Angular metallurgical armor protecting an incandescent molten steel core and central EAF plasma arc spark. Symbolizes carbon liability protection and phase integrity.",
    icon: Shield,
    accent: "from-thermal-500 to-cyanPulse-500",
    badge: "Primary Brand Mark",
  },
  {
    design: "reactor",
    name: "The EAF Plasma Reactor",
    tagline: "High-Tech Arc Smelter Core",
    description:
      "Precision hexagonal furnace geometry with 3 converging 120° graphite electrodes creating a concentrated plasma vortex and magnetic flux containment ring.",
    icon: Atom,
    accent: "from-cyanPulse-500 to-thermal-500",
    badge: "Process Engineering Mark",
  },
  {
    design: "flame",
    name: "The Urja Kinetic Vortex",
    tagline: "Pyrometallurgical Enthalpy",
    description:
      "Dual intertwined ascending ribbons of molten liquid steel flame (Urja) and clean electric arc plasma, converging at a corona focal pinch.",
    icon: Flame,
    accent: "from-amber-500 to-thermal-600",
    badge: "Thermal Energy Mark",
  },
  {
    design: "monogram",
    name: "The UK Industrial Monogram",
    tagline: "Geometric Heavy Industry",
    description:
      "Interlocked precision-beveled 'U' and 'K' steel plate monogram backlit by warm radiant hearth glow with electric spark intersection.",
    icon: Sparkles,
    accent: "from-steel-400 to-thermal-500",
    badge: "Industrial Monogram",
  },
];

export function LogoShowcase({ className }: { className?: string }) {
  const [selectedDesign, setSelectedDesign] = useState<LogoDesign>("shield");
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopyName = (name: string) => {
    navigator.clipboard.writeText(`UrjaKavach — ${name}`);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <section className={`py-12 md:py-16 bg-obsidian-950/80 border-t border-steel-800/80 ${className || ""}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-thermal-500/30 bg-thermal-500/10 px-3.5 py-1 text-xs font-semibold text-thermal-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>URJAKAVACH VISUAL IDENTITY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
            Project Brand Marks &amp; Symbolism
          </h2>
          <p className="text-sm sm:text-base text-steel-400 max-w-2xl mx-auto">
            Explore the four distinct engineering brand identities created for UrjaKavach, each embodying pyrometallurgical science, clean energy, and heavy industry.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LOGO_DESIGNS.map((item) => {
            const isSelected = selectedDesign === item.design;
            return (
              <div
                key={item.design}
                onClick={() => setSelectedDesign(item.design)}
                className={`group cursor-pointer rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between shadow-xl ${
                  isSelected
                    ? "bg-obsidian-900/90 border-thermal-500/70 shadow-thermal-500/10 -translate-y-1 ring-1 ring-thermal-500/50"
                    : "bg-obsidian-900/40 border-steel-800/80 hover:border-steel-700 hover:bg-obsidian-900/70 hover:-translate-y-0.5"
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badge */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-steel-800/80 px-2.5 py-0.5 text-[10px] font-mono font-bold text-steel-300 border border-steel-700/60">
                      {item.badge}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-thermal-400 animate-pulse" />
                    )}
                  </div>

                  {/* Logo Render Frame */}
                  <div className="flex items-center justify-center h-28 w-full rounded-xl bg-obsidian-950/80 border border-steel-800/60 group-hover:border-steel-700 transition-colors p-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-radial-gradient from-thermal-500/5 to-transparent opacity-50" />
                    <UrjaKavachLogo
                      design={item.design}
                      variant="iconOnly"
                      iconSize={64}
                      glow={isSelected}
                    />
                  </div>

                  {/* Typography Title */}
                  <div>
                    <h3 className="text-base font-bold text-white font-heading">
                      {item.name}
                    </h3>
                    <p className="text-xs font-mono text-thermal-400 mt-0.5">
                      {item.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-steel-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-steel-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-steel-500 uppercase">
                    Design: {item.design}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyName(item.name);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-steel-400 hover:text-white transition-colors"
                  >
                    {copied === item.name ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Active Preview Banner */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-obsidian-900 via-steel-950 to-obsidian-900 border border-steel-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <UrjaKavachLogo
              design={selectedDesign}
              variant="compact"
              iconSize={48}
            />
            <div>
              <p className="text-xs font-mono text-steel-400 uppercase">Active Brand Mark Variant</p>
              <p className="text-sm font-bold text-white">
                {LOGO_DESIGNS.find((d) => d.design === selectedDesign)?.name}
              </p>
            </div>
          </div>
          <div className="text-xs text-steel-400 text-center sm:text-right">
            <span>Click any card above to preview or click the logo to cycle designs live.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
