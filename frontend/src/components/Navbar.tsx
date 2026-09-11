"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Flame,
  Cpu,
  Sliders,
  BookOpen,
  Menu,
  X,
  Zap,
  Users,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Overview", href: "/", icon: Flame },
    { label: "Calculator", href: "/calculator", icon: Cpu },
    { label: "Optimizer & Risk", href: "/optimizer", icon: Sliders },
    { label: "Methodology & Case", href: "/methodology", icon: BookOpen },
    { label: "Team Hind", href: "/contact", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-steel-800/80 bg-obsidian-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-thermal-500 via-orange-600 to-amber-700 shadow-md group-hover:shadow-thermal-500/30 transition-all">
            <span className="font-black text-white text-lg tracking-wider">JSL</span>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-400">
              <Zap className="h-2 w-2 text-obsidian-950" />
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base">
                JINDAL STAINLESS
              </span>
              <span className="rounded bg-thermal-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-thermal-400 border border-thermal-500/30 uppercase tracking-wide">
                Engine 2026
              </span>
            </div>
            <span className="text-[11px] font-medium text-steel-400 tracking-tight">
              Carbon & Energy Pyrometallurgical Cockpit
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-steel-800/80 text-thermal-400 border border-thermal-500/40 shadow-sm"
                    : "text-steel-300 hover:text-white hover:bg-steel-800/40"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-thermal-400" : "text-steel-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden p-2 rounded-lg text-steel-400 hover:text-white hover:bg-steel-800"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-steel-800 bg-obsidian-900/95 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive
                    ? "bg-thermal-500/10 text-thermal-400 border border-thermal-500/30"
                    : "text-steel-300 hover:text-white hover:bg-steel-800/50"
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 flex items-center justify-between border-t border-steel-800 text-xs text-steel-400">
            <span>Serverless 0ms Latency</span>
            <span className="text-emerald-400 font-mono">● LIVE</span>
          </div>
        </div>
      )}
    </header>
  );
}
