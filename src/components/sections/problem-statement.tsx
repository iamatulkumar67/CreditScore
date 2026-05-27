"use client";

import { AlertTriangle, Lock, DollarSign, Users } from "lucide-react";

const PROBLEMS = [
  {
    icon: Lock,
    title: "The Overcollateralization Trap",
    description:
      "Borrowers must lock 125–200% collateral to get a loan. $1,500+ locked for every $1,000 borrowed — capital is highly inefficient.",
    stat: "150-200%",
    statLabel: "Required collateral ratio",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: DollarSign,
    title: "Capital Inefficiency",
    description:
      "Locked collateral can't be used productively. $38B in DeFi lending TVL — but zero productive credit. Pure speculation only.",
    stat: "$0",
    statLabel: "Productive credit in DeFi",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Users,
    title: "Excluded Users",
    description:
      "Retail users and small businesses can't access DeFi lending. The $10.3 trillion real-world credit market is completely locked out.",
    stat: "7.8M+",
    statLabel: "DeFi users vs billions excluded",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    icon: AlertTriangle,
    title: "Privacy vs Effectiveness",
    description:
      "Existing solutions force a choice: sacrifice privacy (share KYC data) or sacrifice effectiveness (use only on-chain data that's gameable).",
    stat: "0",
    statLabel: "Protocols solving both",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
];

export default function ProblemStatement() {
  return (
    <section className="relative py-24 overflow-hidden" id="problem">
      <div className="absolute inset-0 dot-pattern opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-4">
            <AlertTriangle className="h-4 w-4" />
            The Problem
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            DeFi Lending is{" "}
            <span className="text-red-400">Broken</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Current DeFi lending protocols force overcollateralization, exclude productive credit,
            and offer no privacy-preserving way to prove creditworthiness.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {PROBLEMS.map((problem) => (
            <div
              key={problem.title}
              className={`glass-card rounded-xl p-6 hover:border-emerald-500/20 transition-all group`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-12 w-12 rounded-xl ${problem.bg} ${problem.border} border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <problem.icon className={`h-6 w-6 ${problem.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-sm text-emerald-100/50 leading-relaxed mb-4">
                    {problem.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${problem.color}`}>
                      {problem.stat}
                    </span>
                    <span className="text-xs text-emerald-100/40">
                      {problem.statLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h3 className="text-xl font-semibold text-white mb-6 text-center">
            Existing Solutions and Their Limitations
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-500/20">
                  <th className="text-left py-3 px-4 text-emerald-100/60 font-medium">
                    Protocol
                  </th>
                  <th className="text-left py-3 px-4 text-emerald-100/60 font-medium">
                    Approach
                  </th>
                  <th className="text-left py-3 px-4 text-emerald-100/60 font-medium">
                    Critical Problem
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Aave/Compound", approach: "Pure overcollateralization", problem: "125–200% collateral, no credit scoring" },
                  { name: "Maple Finance", approach: "Institutional whitelist", problem: "KYC required, not permissionless" },
                  { name: "TrueFi", approach: "Reputation-based", problem: "Whale-dominated, opaque scoring" },
                  { name: "Goldfinch", approach: "Real-world underwriters", problem: "Centralized auditors, not scalable" },
                  { name: "Spectral Finance", approach: "On-chain credit score", problem: "Wallet activity only, gameable" },
                ].map((row) => (
                  <tr
                    key={row.name}
                    className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-emerald-300">
                      {row.name}
                    </td>
                    <td className="py-3 px-4 text-emerald-100/60">
                      {row.approach}
                    </td>
                    <td className="py-3 px-4 text-red-400/80">
                      {row.problem}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
