"use client";

import React, { useState } from "react";
import { Plus, Minus, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  badge: string;
  question: string;
  answer: string;
}

export const JSL_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    badge: "ACCURACY & AUDITING",
    question: "Why do standard carbon calculators report fake emissions for stainless steel?",
    answer:
      "Generic calculators make a basic error: they assume all new iron comes from high-carbon DRI, completely ignoring that ferrochrome and nickel alloys already contain up to 80% natural iron. Our engine credits this alloy iron before ordering raw materials. This eliminates 220 kg of phantom DRI per tonne and wipes out 0.57 tonnes of fake CO2 from your carbon audits.",
  },
  {
    id: "faq-2",
    badge: "QUALITY & SLAB INTEGRITY",
    question: "Why can't we simply push recycled scrap to 100%?",
    answer:
      "Recycled stainless scrap is cost-effective and green, but it carries hidden tramp copper from old wiring. Unlike carbon steel, you cannot oxidize copper out of molten stainless. If copper creeps above 0.40%, it pools at the steel grain boundaries and tears the slab apart during hot rolling. Our engine automatically caps scrap at safe limits so you decarbonize without risking cracked slabs.",
  },
  {
    id: "faq-3",
    badge: "ENERGY & HEAT RECOVERY",
    question: "How does pouring hot liquid ferrochrome save ₹18 Crore a year?",
    answer:
      "Most mills melt cold, solid ferrochrome blocks inside the electric furnace, consuming massive power. At our Jajpur facility, we tap liquid ferrochrome at 1,650°C straight from captive submerged arc smelters into the furnace. Transferring that sensible heat directly cuts electrical energy demand by 113 kWh per tonne and saves ₹18 Crore in annual furnace power bills.",
  },
  {
    id: "faq-4",
    badge: "EXPORT TARIFFS & CBAM",
    question: "How does UrjaKavach protect export profits against European CBAM taxes?",
    answer:
      "Europe starts charging carbon border taxes in 2026, but the real cliff hits between 2028 and 2034 when free allowances disappear. We combine two shields: first, our clean power and scrap mix drops emissions below EU benchmark penalties; second, Article 9 lets UrjaKavach deduct domestic Indian carbon compliance costs directly from any European bill, keeping cash tariffs at zero.",
  },
  {
    id: "faq-5",
    badge: "REVENUE & CARBON CREDITS",
    question: "How does meeting Indian energy targets turn into ₹38 Crore in EBITDA?",
    answer:
      "Under India's Carbon Credit Trading Scheme, the Bureau of Energy Efficiency sets an emissions target of 0.8222 tonnes of CO2 per tonne of steel for Jajpur. Because our optimized charge sheet beats that target, UrjaKavach earns over 380,000 surplus carbon credit certificates each year. Monetizing those credits adds ₹38 Crore directly to company EBITDA.",
  },
  {
    id: "faq-6",
    badge: "SPEED & OPERATOR TRUST",
    question: "Why do operators trust this math instead of black-box neural networks?",
    answer:
      "Furnace operators cannot gamble multi-million rupee heats on AI hallucinations. Our engine uses exact Shapley math that proves 100% of where every emission reduction comes from, with zero error. It calculates the exact balance of scrap, DRI, and green power in 1.6 milliseconds directly on your screen without cloud latency.",
  },
];

export interface FaqSectionProps {
  badge?: string;
  title?: React.ReactNode;
  faqs?: FaqItem[];
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  className?: string;
}

export function FaqSection({
  badge = "KNOWLEDGE BASE & FAQ",
  title = "Everything You Need to Know About UrjaKavach",
  faqs = JSL_FAQS,
  footerText = "Want to inspect the underlying thermodynamic and compliance equations?",
  footerLinkText = "Explore Technical Methodology",
  footerLinkHref = "/methodology",
  className,
}: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={cn("mx-auto w-full max-w-4xl px-4 py-8 md:py-12 font-sans", className)}>
      {/* Header Section */}
      <div className="mb-8 flex flex-col items-center text-center">
        {badge && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-thermal-500/30 bg-thermal-500/10 px-3.5 py-1 text-xs font-semibold text-thermal-300">
            <HelpCircle className="h-3.5 w-3.5 text-thermal-400" />
            <span>{badge}</span>
          </span>
        )}
        <h2 className="text-white max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl font-heading">
          {title}
        </h2>
        <p className="text-steel-400 mt-2 max-w-xl text-xs sm:text-sm">
          Direct answers on furnace energy savings, scrap quality limits, and carbon credit profits.
        </p>
      </div>

      {/* Accordion List (faq-1 architecture) */}
      <div className="w-full space-y-3">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={cn(
                "rounded-2xl border transition-all duration-200 overflow-hidden",
                isOpen
                  ? "bg-obsidian-900/90 border-thermal-500/40 shadow-lg shadow-thermal-500/5"
                  : "bg-obsidian-950/70 border-steel-800/80 hover:border-steel-700"
              )}
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                className="group flex w-full items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
              >
                <span className="text-white text-sm sm:text-base font-semibold group-hover:text-thermal-300 transition-colors pr-4">
                  {faq.question}
                </span>

                <div className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-steel-900/80 border border-steel-800 text-steel-400 group-hover:text-white transition-colors">
                  {isOpen ? (
                    <Minus className="h-3.5 w-3.5 text-thermal-400" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-steel-800/60 mt-1">
                  <p className="text-steel-300 text-xs sm:text-sm leading-relaxed pt-3">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Link */}
      {footerText && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs text-steel-400">
          <span>{footerText}</span>
          {footerLinkHref && footerLinkText && (
            <Link
              href={footerLinkHref}
              className="inline-flex items-center gap-1 font-semibold text-thermal-400 hover:text-thermal-300 transition-colors"
            >
              <span>{footerLinkText}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
