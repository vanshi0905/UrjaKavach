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
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const current = (window.scrollY / totalScroll) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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

      {/* Dynamic Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-steel-900/60 overflow-hidden pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-thermal-500 via-orange-500 via-amber-400 to-cyanPulse-400 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(249,115,22,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
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
