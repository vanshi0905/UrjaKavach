import Link from "next/link";
import { ShieldCheck, Flame, Scale, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-steel-800/80 bg-obsidian-950 py-10 text-steel-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-steel-800/60">
          {/* Col 1: About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-wide">
                URJAKAVACH DECARBONIZATION COCKPIT
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                PS-3 SOLUTION
              </span>
            </div>
            <p className="text-xs text-steel-400 leading-relaxed max-w-lg">
              <strong className="text-white">UrjaKavach</strong> is a peer-reviewed pyrometallurgical carbon and energy intelligence platform engineered for
              3+ MTPA stainless steel melt capacity across Jajpur &amp; Hisar manufacturing complexes. Integrates closed-loop
              stoichiometric mass balance, dynamic EAF enthalpy balances, EU CBAM definitive 2026/2034 liabilities,
              and India CCTS BEE June 2026 compliance.
            </p>
            <div className="flex items-center gap-4 text-xs text-steel-500 pt-1">
              <span>National Institute of Technology, Raipur</span>
              <span>•</span>
              <span>Clean Steel Case Study 2026</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-steel-200">
              Cockpit Modules
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/" className="hover:text-thermal-400 transition-colors">
                  Overview & Trilemma
                </Link>
              </li>
              <li>
                <Link href="/calculator" className="hover:text-thermal-400 transition-colors">
                  Calculator Cockpit (43 Grades)
                </Link>
              </li>
              <li>
                <Link href="/optimizer" className="hover:text-thermal-400 transition-colors">
                  Pareto Optimizer & Monte Carlo
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-thermal-400 transition-colors">
                  Methodology & Case Evidence
                </Link>
              </li>
              <li>
                <Link href="/#tech-stack" className="hover:text-thermal-400 text-thermal-400/90 font-medium transition-colors">
                  Audited Tech Stack (6 Engines)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Statutory Audit Standards */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-steel-200">
              Audit & Compliance
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-steel-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>EU CBAM Reg 2023/956 SEFA</span>
              </div>
              <div className="flex items-center gap-1.5 text-steel-300">
                <Scale className="h-3.5 w-3.5 text-cyanPulse-400" />
                <span>BEE India CCTS Target (0.8222 t)</span>
              </div>
              <div className="flex items-center gap-1.5 text-steel-300">
                <Flame className="h-3.5 w-3.5 text-thermal-400" />
                <span>CEA CO2 Baseline Database v20</span>
              </div>
              <div className="flex items-center gap-1.5 text-steel-300">
                <Globe className="h-3.5 w-3.5 text-amber-400" />
                <span>IPCC / ISO 14064 Standard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-steel-500 gap-3">
          <p>© 2026 UrjaKavach — Clean Steel Decarbonization Intelligence Platform. All calculations run serverless.</p>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-emerald-400">● 100% Vercel Edge Compatible</span>
            <span>•</span>
            <span>Zero External Server Lag</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
