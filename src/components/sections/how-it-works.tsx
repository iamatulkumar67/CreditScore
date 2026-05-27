"use client";

import {
  FileText,
  Cpu,
  ShieldCheck,
  ArrowUpFromLine,
  Banknote,
  ChevronRight,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: FileText,
    title: "Data Ingestion",
    subtitle: "Local Device",
    description:
      "Connect your bank via Account Aggregator (India), Plaid (US/EU), or upload PDFs. Data is fetched locally — never uploaded to any server.",
    color: "from-emerald-500 to-emerald-600",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    number: "02",
    icon: Cpu,
    title: "ZK Proof Generation",
    subtitle: "Client-Side WASM",
    description:
      "Circom circuit + snarkjs generates a Groth16 proof locally on your device in <30 seconds. Only claims like 'score > 700' are proven.",
    color: "from-emerald-400 to-teal-500",
    iconColor: "text-teal-400",
    bgColor: "bg-teal-500/10",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "On-Chain Verification",
    subtitle: "Smart Contract",
    description:
      "Submit the ZK proof to the Verifier contract. It verifies cryptographically — no actual data goes on-chain. An SBT credential is minted.",
    color: "from-teal-500 to-cyan-500",
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
  {
    number: "04",
    icon: ArrowUpFromLine,
    title: "Credential Issued",
    subtitle: "Soulbound Token",
    description:
      "Non-transferable SBT stores only: your address, claim hash, expiry, issuer. No scores, income values, or personal data. Ever.",
    color: "from-cyan-500 to-teal-400",
    iconColor: "text-teal-300",
    bgColor: "bg-teal-400/10",
  },
  {
    number: "05",
    icon: Banknote,
    title: "Borrow at Better Rates",
    subtitle: "Lending Pool",
    description:
      "Use your credential to borrow at 50–80% collateral ratio instead of 150%. Save up to 70% on collateral. Lower interest rates by up to 8%.",
    color: "from-teal-400 to-emerald-400",
    iconColor: "text-emerald-300",
    bgColor: "bg-emerald-400/10",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 overflow-hidden" id="how-it-works">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Cpu className="h-4 w-4" />
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            From Data to Loan in{" "}
            <span className="gradient-text">5 Steps</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Your financial data never leaves your device. Only cryptographic
            proofs of specific claims go on-chain.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-emerald-400/30 -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {STEPS.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Arrow connector (visible on lg between cards) */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="h-5 w-5 text-emerald-500/40" />
                  </div>
                )}

                <div className="glass-card rounded-xl p-6 hover:border-emerald-500/30 transition-all h-full">
                  {/* Step Number */}
                  <div className="text-xs font-mono text-emerald-500/60 mb-3">
                    STEP {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`h-12 w-12 rounded-xl ${step.bgColor} border border-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <step.icon className={`h-6 w-6 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {step.title}
                  </h3>
                  <div className="text-xs text-emerald-400/60 mb-3 font-medium">
                    {step.subtitle}
                  </div>
                  <p className="text-sm text-emerald-100/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ZK Proof Visual */}
        <div className="mt-16 glass-card rounded-2xl p-8 overflow-hidden">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white">
              ZK Proof Pipeline
            </h3>
            <p className="text-sm text-emerald-100/40 mt-1">
              From raw financial data to on-chain credential
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2 text-sm">
            {[
              { label: "Raw Data", sub: "Bank/Credit Bureau", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
              { label: "Normalize", sub: "Parse & Encode", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
              { label: "Circom Circuit", sub: "Witness Gen", color: "bg-teal-500/20 text-teal-400 border-teal-500/30" },
              { label: "Groth16 Proof", sub: "π_A, π_B, π_C", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
              { label: "On-Chain Verify", sub: "SBT Minted", color: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30" },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`rounded-lg border px-4 py-2 text-center ${item.color}`}>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-[10px] opacity-60">{item.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-emerald-500/40 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
