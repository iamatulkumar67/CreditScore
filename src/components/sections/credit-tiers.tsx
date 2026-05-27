"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Shield,
  TrendingUp,
  Award,
  Crown,
  Lock,
} from "lucide-react";
import { CREDIT_TIERS } from "@/lib/types";

const TIER_ICONS = [Lock, Shield, TrendingUp, Award, Crown];

export default function CreditTiers() {
  const [selectedTier, setSelectedTier] = useState(2);

  const selected = CREDIT_TIERS[selectedTier];

  return (
    <section className="relative py-24 overflow-hidden" id="credit-tiers">
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            Credit Tiers
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Better Credit,{" "}
            <span className="gradient-text">Better Terms</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Prove your creditworthiness privately via ZK proofs. Each tier unlocks
            lower collateral requirements and better interest rates.
          </p>
        </div>

        {/* Tier Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CREDIT_TIERS.map((tier, index) => {
            const Icon = TIER_ICONS[index];
            return (
              <button
                key={tier.tier}
                onClick={() => setSelectedTier(index)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                  selectedTier === index
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10"
                    : "border-emerald-500/10 bg-transparent text-emerald-100/50 hover:border-emerald-500/30 hover:text-emerald-100/80"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Tier {tier.tier}: {tier.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Tier Detail */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Card */}
          <div className="lg:col-span-2 gradient-border p-px rounded-xl">
            <div className="bg-[#0a1210] rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${selected.color}20` }}
                >
                  {(() => {
                    const Icon = TIER_ICONS[selectedTier];
                    return <Icon className="h-7 w-7" style={{ color: selected.color }} />;
                  })()}
                </div>
                <div>
                  <div className="text-xs text-emerald-100/40 font-mono">
                    TIER {selected.tier}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{selected.name}</h3>
                </div>
              </div>

              <p className="text-emerald-100/60 mb-6">{selected.description}</p>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-card rounded-lg p-4 text-center">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: selected.color }}
                  >
                    {selected.collateralRatio}%
                  </div>
                  <div className="text-xs text-emerald-100/40 mt-1">
                    Collateral Ratio
                  </div>
                </div>
                <div className="glass-card rounded-lg p-4 text-center">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: selected.color }}
                  >
                    {selected.maxLoan}
                  </div>
                  <div className="text-xs text-emerald-100/40 mt-1">
                    Max Loan Amount
                  </div>
                </div>
                <div className="glass-card rounded-lg p-4 text-center">
                  <div
                    className="text-3xl font-bold"
                    style={{ color: selected.color }}
                  >
                    -{selected.interestDiscount}%
                  </div>
                  <div className="text-xs text-emerald-100/40 mt-1">
                    Interest Discount
                  </div>
                </div>
              </div>

              {/* Required Claims */}
              {selected.requiredClaims.length > 0 && (
                <div>
                  <div className="text-xs text-emerald-100/40 mb-2 font-medium">
                    Required ZK Claims
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.requiredClaims.map((claim) => (
                      <Badge
                        key={claim}
                        variant="outline"
                        className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {claim.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Sidebar */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-emerald-100/40 uppercase tracking-wider">
              All Tiers Comparison
            </h4>
            {CREDIT_TIERS.map((tier, index) => {
              const Icon = TIER_ICONS[index];
              return (
                <button
                  key={tier.tier}
                  onClick={() => setSelectedTier(index)}
                  className={`w-full text-left glass-card rounded-xl p-4 transition-all hover:border-emerald-500/30 ${
                    selectedTier === index ? "border-emerald-500/30 ring-1 ring-emerald-500/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon
                        className="h-4 w-4"
                        style={{ color: tier.color }}
                      />
                      <div>
                        <div className="text-sm font-medium text-white">
                          {tier.name}
                        </div>
                        <div className="text-xs text-emerald-100/40">
                          {tier.collateralRatio}% collateral
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: tier.color }}
                    >
                      -{tier.interestDiscount}%
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
