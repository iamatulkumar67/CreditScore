"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldAlert,
  Bug,
  DollarSign,
  Eye,
  AlertTriangle,
  Server,
} from "lucide-react";

const RISK_CATEGORIES = [
  {
    title: "Smart Contract Risk",
    icon: Bug,
    color: "text-red-400",
    bg: "bg-red-500/10",
    borderColor: "border-red-500/20",
    risks: [
      { risk: "Reentrancy attack", severity: "Critical", mitigation: "ReentrancyGuard on all state-changing functions" },
      { risk: "Oracle manipulation", severity: "High", mitigation: "Multi-oracle (Chainlink + Pyth), TWAP pricing, circuit breakers" },
      { risk: "ZK proof forgery", severity: "Critical", mitigation: "Cryptographically impossible — ZK soundness property" },
      { risk: "Governance attack", severity: "High", mitigation: "Timelock + security council veto + quorum requirements" },
    ],
  },
  {
    title: "Credit Risk",
    icon: DollarSign,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    risks: [
      { risk: "Stale credentials", severity: "Medium", mitigation: "30-day expiry + auto liquidation threshold adjustment" },
      { risk: "Collateral price crash", severity: "High", mitigation: "Conservative LTV ratios + instant oracle updates + liquidation bots" },
      { risk: "Borrower default", severity: "Medium", mitigation: "Progressive collateral increase on tier renewal" },
      { risk: "Data source manipulation", severity: "Medium", mitigation: "Multiple data source requirement for Premium tier" },
    ],
  },
  {
    title: "Privacy Risk",
    icon: Eye,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    borderColor: "border-teal-500/20",
    risks: [
      { risk: "Proof data leakage", severity: "Low", mitigation: "Public inputs contain no personal data by design" },
      { risk: "Nullifier correlation", severity: "Low", mitigation: "Nullifiers are circuit-specific, not linkable to identity" },
      { risk: "TEE prover compromise", severity: "Medium", mitigation: "TEE fallback optional; default is local proving" },
      { risk: "Data connector breach", severity: "High", mitigation: "Data never stored after proof generation; delete immediately" },
    ],
  },
];

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "text-red-400 bg-red-500/10 border-red-500/20",
  High: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

const COMPLIANCE_ITEMS = [
  {
    regulation: "GDPR / India DPDP Act",
    status: "Compliant",
    description: "No personal data stored by protocol. Client-side processing. Right to erasure via SBT burn.",
    color: "text-emerald-400",
  },
  {
    regulation: "FATF Travel Rule",
    status: "Compatible",
    description: "Non-custodial protocol. ZK credentials can include AML/sanctions check proof.",
    color: "text-teal-400",
  },
  {
    regulation: "India RBI",
    status: "Non-NBFC",
    description: "No INR deposits — pure crypto lending. Account Aggregator follows RBI AA framework.",
    color: "text-cyan-400",
  },
  {
    regulation: "US Regulations",
    status: "Structured",
    description: "Non-US entity. IP geofencing for US persons. Legal opinion from Debevoise & Plimpton.",
    color: "text-amber-400",
  },
];

export default function RiskFramework() {
  return (
    <section className="relative py-24 overflow-hidden" id="risk">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/3 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium mb-4">
            <ShieldAlert className="h-4 w-4" />
            Risk Framework
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Security &{" "}
            <span className="gradient-text">Risk Management</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Comprehensive risk framework covering smart contract, credit, and privacy
            risks with specific mitigations for each.
          </p>
        </div>

        {/* Risk Categories */}
        <div className="space-y-8 mb-16">
          {RISK_CATEGORIES.map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`h-10 w-10 rounded-lg ${category.bg} flex items-center justify-center`}
                >
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {category.title}
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {category.risks.map((risk) => (
                  <Card
                    key={risk.risk}
                    className="glass-card border-emerald-500/10 bg-transparent hover:border-emerald-500/30 transition-all"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-white">
                          {risk.risk}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${SEVERITY_COLORS[risk.severity]}`}
                        >
                          {risk.severity}
                        </span>
                      </div>
                      <div className="text-xs text-emerald-100/40 mb-1">
                        Mitigation
                      </div>
                      <p className="text-xs text-emerald-100/60">
                        {risk.mitigation}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Insurance Fund */}
        <Card className="glass-card border-emerald-500/10 bg-transparent mb-12">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Insurance Fund
                </h3>
                <p className="text-xs text-emerald-100/40">
                  Protocol safety net for edge cases
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Fee Allocation", value: "5% of origination fees", icon: DollarSign },
                { label: "Minimum Reserve", value: "10% of protocol TVL", icon: Server },
                { label: "Coverage", value: "Up to 80% of loss", icon: ShieldAlert },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4"
                >
                  <item.icon className="h-4 w-4 text-emerald-400 mb-2" />
                  <div className="text-xs text-emerald-100/40">{item.label}</div>
                  <div className="text-sm font-medium text-emerald-300">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-emerald-400" />
            Regulatory Compliance
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {COMPLIANCE_ITEMS.map((item) => (
              <Card
                key={item.regulation}
                className="glass-card border-emerald-500/10 bg-transparent"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">
                      {item.regulation}
                    </h4>
                    <span className={`text-xs font-medium ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100/50">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
