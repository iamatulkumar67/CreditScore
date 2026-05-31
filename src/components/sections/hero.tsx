"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Shield,
  Lock,
  Zap,
  Github,
} from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[200px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 px-4 py-1"
              >
                <Zap className="h-3 w-3 mr-1" />
                Built on Solana
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">DeFi Lending with</span>
              <br />
              <span className="gradient-text">Real Credit</span>
              <br />
              <span className="text-white">& Zero Data Leaks</span>
            </h1>

            <p className="text-lg text-emerald-100/60 max-w-xl leading-relaxed">
              ZKCreditScore is a privacy-preserving, decentralized lending protocol
              that uses Zero-Knowledge Proofs to let borrowers prove their
              creditworthiness — without revealing any sensitive financial data.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-xl shadow-emerald-600/25 text-base px-8 h-12"
              >
                <Link href="/beta">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 text-base px-8 h-12"
              >
                Read Whitepaper
              </Button>
              <a
                href="https://github.com/iamatulkumar67/CreditScore"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 text-base px-8 h-12"
                >
                  <Github className="mr-2 h-4 w-4" />
                  SDK
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-emerald-100/50">
                <Lock className="h-4 w-4 text-emerald-500" />
                Zero data exposure
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-100/50">
                <Shield className="h-4 w-4 text-emerald-500" />
                Groth16 ZK Proofs
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-100/50">
                <Zap className="h-4 w-4 text-emerald-500" />
                &lt;30s proof generation
              </div>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              {/* Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-3xl" />
              <div className="relative rounded-2xl overflow-hidden emerald-glow">
                <Image
                  src="/hero-image.png"
                  alt="ZKCreditScore Protocol Visualization"
                  width={1344}
                  height={768}
                  className="w-full h-auto object-cover rounded-2xl"
                  priority
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -left-4 glass-card rounded-xl px-4 py-3 animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-emerald-100/50">Credit Tier</div>
                    <div className="text-sm font-semibold text-emerald-300">
                      Good (Tier 2)
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 glass-card rounded-xl px-4 py-3 animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="text-xs text-emerald-100/50">Collateral Saved</div>
                    <div className="text-sm font-semibold text-teal-300">70% Less</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Value Locked", value: "$38B+", sub: "DeFi Lending TVL" },
            { label: "Credit Market TAM", value: "$10.3T", sub: "Global underserved" },
            { label: "ZK-KYC CAGR", value: "40.5%", sub: "2025-2032 growth" },
            { label: "Proof Generation", value: "<30s", sub: "On mobile devices" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-xl p-4 text-center hover:border-emerald-500/30 transition-all"
            >
              <div className="text-2xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm font-medium text-emerald-100/80 mt-1">
                {stat.label}
              </div>
              <div className="text-xs text-emerald-100/40 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
