"use client";

import { Check, X, Minus } from "lucide-react";

const COMPETITORS = [
  {
    name: "ZKCreditScore",
    features: [true, true, true, true, true, true, true, true],
    highlight: true,
  },
  {
    name: "Aave",
    features: [false, null, true, false, false, false, null, false],
    highlight: false,
  },
  {
    name: "Maple Finance",
    features: [true, false, false, true, false, false, false, false],
    highlight: false,
  },
  {
    name: "TrueFi",
    features: [true, false, false, false, false, false, false, false],
    highlight: false,
  },
  {
    name: "Goldfinch",
    features: [true, false, false, true, "partial", false, false, false],
    highlight: false,
  },
  {
    name: "Spectral",
    features: ["partial", "partial", true, false, false, false, "partial", false],
    highlight: false,
  },
];

const FEATURES = [
  "Under-collateralized Loans",
  "Privacy Preserved",
  "Permissionless",
  "Off-chain Credit Data",
  "ZK Proof Based",
  "Individual Borrowers",
  "Composable Credential",
  "India-Native",
];

function FeatureCell({ value }: { value: boolean | string | null }) {
  if (value === true)
    return (
      <div className="flex justify-center">
        <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="h-3.5 w-3.5 text-emerald-400" />
        </div>
      </div>
    );
  if (value === false)
    return (
      <div className="flex justify-center">
        <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <X className="h-3.5 w-3.5 text-red-400/60" />
        </div>
      </div>
    );
  if (value === "partial")
    return (
      <div className="flex justify-center">
        <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Minus className="h-3.5 w-3.5 text-amber-400/60" />
        </div>
      </div>
    );
  return <div className="text-center text-emerald-100/20">N/A</div>;
}

export default function Competitors() {
  return (
    <section className="relative py-24 overflow-hidden" id="competitors">
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Check className="h-4 w-4" />
            Competitive Edge
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why{" "}
            <span className="gradient-text">ZKCreditScore</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            No existing protocol combines off-chain credit data + ZK privacy + permissionless
            DeFi lending. We&apos;re the first.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-emerald-100/40 font-medium min-w-[160px]">
                  Feature
                </th>
                {COMPETITORS.map((comp) => (
                  <th
                    key={comp.name}
                    className={`py-3 px-3 font-medium min-w-[100px] text-center ${
                      comp.highlight
                        ? "text-emerald-400 bg-emerald-500/5 rounded-t-lg"
                        : "text-emerald-100/50"
                    }`}
                  >
                    <div className="text-xs">{comp.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, fIndex) => (
                <tr
                  key={feature}
                  className="border-t border-emerald-500/10 hover:bg-emerald-500/5 transition-colors"
                >
                  <td className="py-3 px-4 text-emerald-100/70 font-medium">
                    {feature}
                  </td>
                  {COMPETITORS.map((comp) => (
                    <td
                      key={comp.name}
                      className={`py-3 px-3 ${
                        comp.highlight ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      <FeatureCell value={comp.features[fIndex]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key Differentiators */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {[
            {
              title: "Privacy by Design",
              description:
                "Zero data exposure — only boolean claims proven via ZK proofs. Your actual score, income, and financial data never leave your device.",
              icon: "🔒",
            },
            {
              title: "Permissionless Access",
              description:
                "No whitelist, no human reviewer. Pure smart contract + ZK proof determines your loan terms. Anyone can participate.",
              icon: "🌐",
            },
            {
              title: "Composable Credentials",
              description:
                "Prove once, use everywhere. Your ZK credit credential integrates with Aave, Uniswap, and any DeFi protocol via our SDK.",
              icon: "🔗",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card rounded-xl p-6 hover:border-emerald-500/30 transition-all"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-emerald-100/50 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
