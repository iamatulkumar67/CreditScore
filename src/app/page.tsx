"use client";

import Navbar from "@/components/sections/navbar";
import Hero from "@/components/sections/hero";
import ProblemStatement from "@/components/sections/problem-statement";
import HowItWorks from "@/components/sections/how-it-works";
import UserPersonas from "@/components/sections/user-personas";
import CreditTiers from "@/components/sections/credit-tiers";
import LoanCalculator from "@/components/sections/loan-calculator";
import ProtocolStats from "@/components/sections/protocol-stats";
import Architecture from "@/components/sections/architecture";
import SmartContracts from "@/components/sections/smart-contracts";
import Competitors from "@/components/sections/competitors";
import Tokenomics from "@/components/sections/tokenomics";
import RiskFramework from "@/components/sections/risk-framework";
import Roadmap from "@/components/sections/roadmap";
import CTA from "@/components/sections/cta";
import Footer from "@/components/sections/footer";

function CABanner() {
  const ca = "4A1AR7H5VHQzwM7QuucYDHKTrQWt9HQ1GyEB4gh4pump";
  const copy = () => navigator.clipboard.writeText(ca);
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-emerald-600/90 backdrop-blur-sm text-white text-center py-1.5 text-sm font-mono cursor-pointer hover:bg-emerald-500/90 transition-colors" onClick={copy}>
      CA: {ca} <span className="text-emerald-200/70 text-xs ml-2">(click to copy)</span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060b09]">
      <CABanner />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemStatement />
        <HowItWorks />
        <UserPersonas />
        <CreditTiers />
        <LoanCalculator />
        <ProtocolStats />
        <Architecture />
        <SmartContracts />
        <Competitors />
        <Tokenomics />
        <RiskFramework />
        <Roadmap />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
