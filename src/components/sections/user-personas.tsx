"use client";

import {
  UserCheck,
  Briefcase,
  BarChart3,
  Code2,
} from "lucide-react";

const PERSONAS = [
  {
    name: "Alex",
    role: "Crypto-Native Professional",
    age: "28, New York",
    icon: UserCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    problem: "Needs $3,000 loan. DeFi requires $4,500 collateral. Bank process too slow.",
    solution: "Income ZK proof from DigiLocker. Borrows $3,000 USDC at 60% LTV — only $1,800 collateral.",
    saving: "60% less collateral",
    stat: "$1,800 vs $4,500",
    statLabel: "Collateral needed",
  },
  {
    name: "Maria",
    role: "Small Business Owner",
    age: "34, London",
    icon: Briefcase,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    problem: "Banks demand heavy collateral, slow process. DeFi is overcollateralized.",
    solution: "Business revenue ZK proof via GST returns. Gets credit line at 2x monthly revenue.",
    saving: "Working capital access",
    stat: "$12,000",
    statLabel: "Credit line",
  },
  {
    name: "Carlos",
    role: "DeFi Power User",
    age: "26, São Paulo",
    icon: BarChart3,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    problem: "No traditional credit history. On-chain score protocols are gameable.",
    solution: "Combines on-chain activity + Coinbase verification + exchange KYC into composite ZK proof.",
    saving: "Composite scoring",
    stat: "Tier 3",
    statLabel: "Credit tier",
  },
  {
    name: "DeFi Builder",
    role: "Protocol Integrator",
    age: "Team",
    icon: Code2,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    problem: "Want to offer better rates to creditworthy users without handling data.",
    solution: "ZK Verifier SDK integration. Check ZKCreditScore credentials — zero data handling.",
    saving: "Plug & play",
    stat: "SDK v1.0",
    statLabel: "Integration",
  },
];

export default function UserPersonas() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-4">
            <UserCheck className="h-4 w-4" />
            User Personas
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Built for{" "}
            <span className="gradient-text">Real Users</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            From crypto-native professionals to small business owners —
            ZKCreditScore serves the underserved.
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid sm:grid-cols-2 gap-6">
          {PERSONAS.map((persona) => (
            <div
              key={persona.name}
              className={`glass-card rounded-xl p-6 border ${persona.borderColor} hover:border-emerald-500/30 transition-all group`}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`h-12 w-12 rounded-xl ${persona.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <persona.icon className={`h-6 w-6 ${persona.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {persona.name}
                  </h3>
                  <div className="text-sm text-emerald-100/50">
                    {persona.role} • {persona.age}
                  </div>
                </div>
              </div>

              {/* Problem */}
              <div className="mb-3">
                <div className="text-xs text-red-400/60 font-medium mb-1">
                  PROBLEM
                </div>
                <p className="text-sm text-emerald-100/50">{persona.problem}</p>
              </div>

              {/* Solution */}
              <div className="mb-4">
                <div className="text-xs text-emerald-400/60 font-medium mb-1">
                  ZKCREDITSCORE SOLUTION
                </div>
                <p className="text-sm text-emerald-100/60">{persona.solution}</p>
              </div>

              {/* Result */}
              <div className="flex items-center justify-between pt-3 border-t border-emerald-500/10">
                <div>
                  <div className="text-xs text-emerald-100/40">
                    {persona.statLabel}
                  </div>
                  <div className={`text-lg font-bold ${persona.color}`}>
                    {persona.stat}
                  </div>
                </div>
                <div className="text-xs text-emerald-400/60 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  {persona.saving}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
