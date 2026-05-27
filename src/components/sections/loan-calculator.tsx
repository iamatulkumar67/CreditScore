"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { CREDIT_TIERS } from "@/lib/types";

const BASE_RATE = 10;
const COLLATERAL_PRICE = 85;

export default function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState(5000);
  const [selectedTier, setSelectedTier] = useState(2);
  const [duration, setDuration] = useState(12); // months

  const tier = CREDIT_TIERS[selectedTier];

  const calculations = useCallback(() => {
    const collateralRatio = tier.collateralRatio / 100;
    const standardCollateral = loanAmount * 1.5; // 150% standard
    const zkCollateral = loanAmount * collateralRatio;
    const savings = standardCollateral - zkCollateral;
    const savingsPercent = ((savings / standardCollateral) * 100).toFixed(0);

    const interestRate = Math.max(BASE_RATE - tier.interestDiscount, 2);
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
      (Math.pow(1 + monthlyRate, duration) - 1);
    const totalPayment = monthlyPayment * duration;
    const totalInterest = totalPayment - loanAmount;

    const solCollateral = (zkCollateral / COLLATERAL_PRICE).toFixed(2);
    const standardSolCollateral = (standardCollateral / COLLATERAL_PRICE).toFixed(2);

    return {
      standardCollateral,
      zkCollateral,
      savings,
      savingsPercent,
      interestRate,
      monthlyPayment,
      totalPayment,
      totalInterest,
      solCollateral,
      standardSolCollateral,
    };
  }, [loanAmount, tier, duration]);

  const calc = calculations();

  return (
    <section className="relative py-24 overflow-hidden" id="calculator">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-4">
            <Calculator className="h-4 w-4" />
            Loan Calculator
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            See Your{" "}
            <span className="gradient-text">Savings</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Compare standard DeFi lending vs ZKCreditScore. See how much collateral
            you save with ZK-verified credit.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-emerald-500/10 bg-transparent">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Loan Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Loan Amount */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-emerald-100/60">
                      Loan Amount
                    </label>
                    <span className="text-sm font-semibold text-emerald-300">
                      ${loanAmount.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    value={[loanAmount]}
                    onValueChange={(v) => setLoanAmount(v[0])}
                    min={1000}
                    max={500000}
                    step={1000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-emerald-100/30 mt-1">
                    <span>$1,000</span>
                    <span>$500,000</span>
                  </div>
                </div>

                {/* Credit Tier */}
                <div>
                  <label className="text-sm text-emerald-100/60 mb-2 block">
                    Credit Tier
                  </label>
                  <Select
                    value={selectedTier.toString()}
                    onValueChange={(v) => setSelectedTier(parseInt(v))}
                  >
                    <SelectTrigger className="w-full bg-[#0a1210] border-emerald-500/20 text-emerald-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a1210] border-emerald-500/20">
                      {CREDIT_TIERS.map((t) => (
                        <SelectItem
                          key={t.tier}
                          value={t.tier.toString()}
                          className="text-emerald-100 focus:bg-emerald-500/10 focus:text-emerald-200"
                        >
                          Tier {t.tier}: {t.name} ({t.collateralRatio}% collateral)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-emerald-100/60">
                      Duration
                    </label>
                    <span className="text-sm font-semibold text-emerald-300">
                      {duration} months
                    </span>
                  </div>
                  <Slider
                    value={[duration]}
                    onValueChange={(v) => setDuration(v[0])}
                    min={1}
                    max={36}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-emerald-100/30 mt-1">
                    <span>1 month</span>
                    <span>36 months</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Savings Highlight */}
            <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden relative">
              <div className="absolute inset-0 animate-shimmer" />
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <PiggyBank className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-emerald-100/40 uppercase tracking-wider">
                      Collateral Savings
                    </div>
                    <div className="text-3xl font-bold gradient-text">
                      ${calc.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-emerald-100/40 mb-1">
                      Standard DeFi
                    </div>
                    <div className="text-lg font-semibold text-red-400/80">
                      ${calc.standardCollateral.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({calc.standardSolCollateral} SOL)
                    </div>
                  </div>
                  <div className="text-emerald-500/40">→</div>
                  <div className="flex-1">
                    <div className="text-xs text-emerald-100/40 mb-1">
                      With ZKCreditScore
                    </div>
                    <div className="text-lg font-semibold text-emerald-400">
                      ${calc.zkCollateral.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({calc.solCollateral} SOL)
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-emerald-300/60">
                  You save <span className="text-emerald-300 font-semibold">{calc.savingsPercent}%</span> on collateral with Tier {tier.tier} ({tier.name})
                </div>
              </CardContent>
            </Card>

            {/* Detail Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="glass-card border-emerald-500/10 bg-transparent">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-teal-400" />
                    <span className="text-xs text-emerald-100/40">
                      Monthly Payment
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${calc.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-emerald-100/40 mt-1">
                    at {calc.interestRate}% APR
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-emerald-500/10 bg-transparent">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-emerald-100/40">
                      Total Interest
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${calc.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-xs text-emerald-100/40 mt-1">
                    over {duration} months
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-emerald-500/10 bg-transparent">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <PiggyBank className="h-4 w-4 text-teal-300" />
                    <span className="text-xs text-emerald-100/40">
                      Collateral Ratio
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {tier.collateralRatio}%
                  </div>
                  <div className="text-xs text-emerald-100/40 mt-1">
                    vs 150% standard
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visual Comparison Bar */}
            <Card className="glass-card border-emerald-500/10 bg-transparent">
              <CardContent className="p-6">
                <div className="text-sm text-emerald-100/40 mb-4">
                  Collateral Required Comparison
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400/70">Standard DeFi (150%)</span>
                      <span className="text-red-400/70">
                        ${calc.standardCollateral.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-4 bg-[#0a1210] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500/60 to-red-400/40 rounded-full transition-all duration-500"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-emerald-400">
                        ZKCreditScore ({tier.collateralRatio}%)
                      </span>
                      <span className="text-emerald-400">
                        ${calc.zkCollateral.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-4 bg-[#0a1210] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500/60 to-teal-400/40 rounded-full transition-all duration-500"
                        style={{
                          width: `${(tier.collateralRatio / 150) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
