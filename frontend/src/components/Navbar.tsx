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

import { JSLLogo } from "@/components/brand/JSLLogo";
import { UrjaKavachLogo } from "@/components/brand/UrjaKavachLogo";
import { useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const scrollHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        );
        const winHeight = window.innerHeight || document.documentElement.clientHeight || 0;
        const totalScroll = scrollHeight - winHeight;

        if (totalScroll > 0) {
          const current = (scrollTop / totalScroll) * 100;
          setScrollProgress(Math.min(100, Math.max(0, current)));
        } else {
          setScrollProgress(0);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const navItems = [
    { label: "Overview", href: "/", icon: Flame },
    { label: "Calculator", href: "/calculator", icon: Cpu },
    { label: "Optimizer & Risk", href: "/optimizer", icon: Sliders },
    { label: "Methodology & Case", href: "/methodology", icon: BookOpen },
    { label: "Team Hind", href: "/contact", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-steel-800/80 bg-obsidian-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link href="/" className="group flex items-center">
          <UrjaKavachLogo variant="compact" iconSize={36} glow={true} />
        </Link>

        {/* Desktop Navigation Links & JSL Co-Badge */}
        <div className="hidden md:flex items-center gap-1">
          <nav className="flex items-center gap-1">
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

          {/* JSL Enterprise Co-Badge */}
          <div className="hidden lg:flex items-center pl-3 ml-2 border-l border-steel-800/80">
            <JSLLogo variant="badge" size={22} showSubtitle={false} />
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden p-2 rounded-lg text-steel-400 hover:text-white hover:bg-steel-800"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Dynamic Molten Steel Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3.5px] bg-obsidian-950/80 overflow-visible pointer-events-none z-10 border-t border-steel-800/30">
        <div
          className="h-full relative bg-gradient-to-r from-thermal-600 via-orange-500 via-amber-400 to-cyanPulse-400 transition-all duration-100 ease-out shadow-[0_0_12px_rgba(249,115,22,0.9),0_0_20px_rgba(56,189,248,0.7)]"
          style={{ width: `${scrollProgress}%` }}
        >
          {scrollProgress > 1 && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#f97316,0_0_16px_#38bdf8] animate-pulse" />
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-steel-800 bg-obsidian-900/95 px-4 pt-2 pb-4 space-y-2">
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
          <div className="pt-2.5 flex items-center justify-between border-t border-steel-800 text-xs text-steel-400">
            <JSLLogo variant="badge" size={20} showSubtitle={false} />
            <span className="text-emerald-400 font-mono">● LIVE</span>
          </div>
        </div>
      )}
    </header>
  );
}
