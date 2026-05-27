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

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060b09]">
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
