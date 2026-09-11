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

import { UrjaKavachLogo } from "@/components/brand/UrjaKavachLogo";

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
        {/* UrjaKavach Brand Logo */}
        <Link href="/" className="hover:opacity-95 transition-opacity">
          <UrjaKavachLogo variant="full" interactive={true} />
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
