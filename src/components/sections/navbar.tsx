"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Github,
  Menu,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Credit Tiers", href: "#credit-tiers" },
  { label: "Calculator", href: "#calculator" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Tokenomics", href: "#tokenomics" },
  { label: "Roadmap", href: "#roadmap" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#060b09]/90 backdrop-blur-xl border-b border-emerald-500/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="h-8 w-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              <div className="absolute inset-0 bg-emerald-400/20 blur-lg rounded-full group-hover:bg-emerald-400/30 transition-all" />
            </div>
            <span className="text-lg font-bold gradient-text">
              ZKCreditScore
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-emerald-100/70 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://github.com/iamatulkumar67/zkcreditscore-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-100/70 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
            >
              <Github className="h-4 w-4" />
              <span>SDK</span>
            </a>
            <Button
              variant="ghost"
              className="text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10"
            >
              Documentation
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-600/25">
              Launch App
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-emerald-300 p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a1210]/95 backdrop-blur-xl border-b border-emerald-500/10">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-emerald-100/70 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-emerald-500/10 flex flex-col gap-2">
              <Button variant="ghost" className="w-full text-emerald-300 justify-start">
                Documentation
              </Button>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                Launch App
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
