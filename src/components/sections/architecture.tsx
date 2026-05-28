"use client";

import { Badge } from "@/components/ui/badge";
import {
  Server,
  Database,
  Globe,
  Smartphone,
  Link2,
  ShieldCheck,
  Cpu,
  Cloud,
  Layers,
} from "lucide-react";

const LAYERS = [
  {
    id: "user",
    name: "User Layer",
    icon: Smartphone,
    color: "from-amber-500/20 to-amber-600/10",
    borderColor: "border-amber-500/20",
    textColor: "text-amber-400",
    items: [
      {
        name: "ZKCreditScore Client App",
        desc: "Local device — ZK proof generation",
        icon: Smartphone,
      },
      {
        name: "DeFi Frontend",
        desc: "Web/Mobile lending interface",
        icon: Globe,
      },
    ],
  },
  {
    id: "blockchain",
    name: "Blockchain Layer (L1)",
    icon: Layers,
    color: "from-emerald-500/20 to-teal-600/10",
    borderColor: "border-emerald-500/20",
    textColor: "text-emerald-400",
    items: [
      { name: "ZK Verifier Contract", desc: "Proof verification & SBT issuance", icon: ShieldCheck },
      { name: "Lending Pool Engine", desc: "Deposit, borrow, liquidate", icon: Database },
      { name: "Credential Registry", desc: "SBT management & queries", icon: Link2 },
      { name: "Pyth / Switchboard", desc: "Solana-native price oracles", icon: Cloud },
      { name: "Governance Module", desc: "ZKCR token voting & proposals", icon: Server },
      { name: "Treasury / Insurance", desc: "Protocol reserves & safety fund", icon: Database },
    ],
  },
  {
    id: "data",
    name: "Data Connector Layer",
    icon: Cpu,
    color: "from-teal-500/20 to-cyan-600/10",
    borderColor: "border-teal-500/20",
    textColor: "text-teal-400",
    items: [
      { name: "Account Aggregator", desc: "India — RBI AA framework", icon: Link2 },
      { name: "CIBIL / Equifax", desc: "Credit bureau API", icon: Database },
      { name: "Plaid API", desc: "US/EU bank data", icon: Globe },
    ],
  },
];

export default function Architecture() {
  return (
    <section className="relative py-24 overflow-hidden" id="architecture">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Layers className="h-4 w-4" />
            Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            System{" "}
            <span className="gradient-text">Architecture</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Three-layer design: User devices generate proofs, Blockchain verifies and lends,
            Data connectors provide off-chain financial data.
          </p>
        </div>

        {/* Architecture Layers */}
        <div className="space-y-6">
          {LAYERS.map((layer, layerIndex) => (
            <div key={layer.id}>
              <div
                className={`glass-card rounded-xl p-6 border ${layer.borderColor}`}
              >
                {/* Layer Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${layer.color} flex items-center justify-center`}
                  >
                    <layer.icon className={`h-5 w-5 ${layer.textColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {layer.name}
                    </h3>
                    <p className="text-xs text-emerald-100/40">
                      Layer {layerIndex + 1} of {LAYERS.length}
                    </p>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {layer.items.map((item) => (
                    <div
                      key={item.name}
                      className={`rounded-lg bg-gradient-to-br ${layer.color} border ${layer.borderColor} p-4 hover:scale-[1.02] transition-transform`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon
                          className={`h-4 w-4 ${layer.textColor}`}
                        />
                        <span className="text-sm font-medium text-white">
                          {item.name}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100/40">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector Arrow */}
              {layerIndex < LAYERS.length - 1 && (
                <div className="flex justify-center my-2">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="w-0.5 h-4 bg-gradient-to-b from-emerald-500/30 to-emerald-500/10" />
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      className="text-emerald-500/30"
                    >
                      <path
                        d="M6 8L0 0h12L6 8z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mt-12 glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-400" />
            Core Technology Stack
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: "ZK Circuits", tech: "Circom 2.0" },
              { label: "Proving System", tech: "Groth16 (snarkjs)" },
              { label: "Smart Contracts", tech: "Rust (Anchor 0.30)" },
              { label: "Primary Chain", tech: "Solana Mainnet" },
              { label: "Secondary Chain", tech: "Eclipse (Solana L2)" },
              { label: "Oracle", tech: "Pyth + Switchboard" },
              { label: "Data Attestation", tech: "zkTLS (Reclaim)" },
              { label: "Client App", tech: "React Native" },
              { label: "India Data", tech: "Sahamati AA" },
              { label: "Indexing", tech: "The Graph (Solana)" },
              { label: "Cross-chain", tech: "Wormhole" },
              { label: "Scheduling", tech: "Solana Clockwork" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-3"
              >
                <div className="text-xs text-emerald-100/40 mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-medium text-emerald-300">
                  {item.tech}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ZK Circuit Pseudocode */}
        <div className="mt-8 glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              Circom 2.0
            </Badge>
            <span className="text-sm text-emerald-100/40">ZK Circuit Example</span>
          </div>
          <pre className="bg-[#050a08] rounded-lg p-4 overflow-x-auto text-xs leading-relaxed font-mono">
            <code className="text-emerald-100/70">
{`pragma circom 2.0.0;

template CreditScoreAbove(threshold) {
    signal private input creditScore;
    signal private input bureauTimestamp;
    signal private input userCommitment;

    signal input addressCommitment;
    signal input thresholdPublic;
    signal input nullifier;
    signal input expiryTimestamp;

    signal output isValid;

    // 1. Credit score >= threshold
    component gte = GreaterEqThan(10);
    gte.in[0] <== creditScore;
    gte.in[1] <== threshold;

    // 2. Score in valid range (300-900)
    component rangeCheck = RangeCheck(300, 900);
    rangeCheck.value <== creditScore;

    // 3. Data not older than 90 days
    component freshCheck = TimestampFresh(90 * 86400);
    freshCheck.timestamp <== bureauTimestamp;

    // 4. Nullifier correctly derived
    component nullifierCheck = Poseidon(3);
    nullifierCheck.inputs[0] <== creditScore;
    nullifierCheck.inputs[1] <== bureauTimestamp;
    nullifierCheck.inputs[2] <== userCommitment;
    nullifierCheck.out === nullifier;

    isValid <== gte.out * rangeCheck.out * freshCheck.out;
}

component main = CreditScoreAbove(700);`}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}
