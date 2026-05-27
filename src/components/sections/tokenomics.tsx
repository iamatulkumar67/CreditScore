"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Coins, TrendingUp, Users, Shield } from "lucide-react";
import { TOKEN_ALLOCATIONS } from "@/lib/types";

const TOKEN_UTILITIES = [
  {
    icon: TrendingUp,
    title: "Fee Discounts",
    description: "10–30% protocol fee discount by staking ZKC",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Users,
    title: "Governance",
    description: "1 ZKC = 1 vote with quadratic voting for parameter changes",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  {
    icon: Coins,
    title: "Staking Rewards",
    description: "40% of protocol revenue distributed to ZKC stakers",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Shield,
    title: "Credential Boost",
    description: "Use ZKC as collateral for credit tier improvement",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

const REVENUE_SOURCES = [
  { source: "Origination Fee", mechanism: "0.5% of loan amount", toProtocol: "100%" },
  { source: "Interest Spread", mechanism: "Borrow rate minus supply rate", toProtocol: "20%" },
  { source: "Liquidation Fee", mechanism: "1% of liquidated amount", toProtocol: "100%" },
  { source: "Credential Issuance", mechanism: "$2 equivalent in ZKC per proof", toProtocol: "100%" },
  { source: "Integration License", mechanism: "$500/month enterprise SDK", toProtocol: "100%" },
];

export default function Tokenomics() {
  return (
    <section className="relative py-24 overflow-hidden" id="tokenomics">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4">
            <Coins className="h-4 w-4" />
            Tokenomics
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            <span className="gradient-text">ZKC</span> Token
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            SPL token on Solana. 1 billion total supply with carefully designed
            vesting schedules and utility mechanisms.
          </p>
        </div>

        {/* Token Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Allocation Chart */}
          <Card className="glass-card border-emerald-500/10 bg-transparent">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Token Allocation
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={TOKEN_ALLOCATIONS}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={2}
                      dataKey="percentage"
                      nameKey="category"
                    >
                      {TOKEN_ALLOCATIONS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#0a1210",
                        border: "1px solid #10b98133",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Allocation"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {TOKEN_ALLOCATIONS.map((item) => (
                  <div key={item.category} className="flex items-center gap-2 text-xs">
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-emerald-100/60 truncate">
                      {item.category}
                    </span>
                    <span className="text-emerald-100/80 font-medium ml-auto">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Token Details */}
          <div className="space-y-4">
            {/* Token Info */}
            <Card className="glass-card border-emerald-500/10 bg-transparent">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Token Details
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Token Name", value: "ZKCredit (ZKC)" },
                    { label: "Standard", value: "SPL (Token 2022)" },
                    { label: "Total Supply", value: "1,000,000,000 ZKC" },
                    { label: "Primary Chain", value: "Solana Mainnet" },
                    { label: "Bridged To", value: "Eclipse (Solana L2)" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center py-2 border-b border-emerald-500/10 last:border-0"
                    >
                      <span className="text-sm text-emerald-100/50">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-emerald-300">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Distribution */}
            <Card className="glass-card border-emerald-500/10 bg-transparent">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Revenue Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "ZKC Stakers", value: "40%", color: "#10b981" },
                    { label: "Insurance/Reserve Fund", value: "30%", color: "#14b8a6" },
                    { label: "Protocol Treasury", value: "20%", color: "#2dd4bf" },
                    { label: "Security Council", value: "10%", color: "#f59e0b" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-emerald-100/60">{item.label}</span>
                        <span style={{ color: item.color }} className="font-medium">
                          {item.value}
                        </span>
                      </div>
                      <div className="h-2 bg-[#0a1210] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: item.value,
                            backgroundColor: item.color,
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Token Utility */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {TOKEN_UTILITIES.map((item) => (
            <Card
              key={item.title}
              className="glass-card border-emerald-500/10 bg-transparent hover:border-emerald-500/30 transition-all"
            >
              <CardContent className="p-5">
                <div
                  className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center mb-3`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-emerald-100/50 leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Sources Table */}
        <Card className="glass-card border-emerald-500/10 bg-transparent">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Revenue Sources
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    <th className="text-left py-3 px-4 text-emerald-100/40 font-medium">
                      Source
                    </th>
                    <th className="text-left py-3 px-4 text-emerald-100/40 font-medium">
                      Mechanism
                    </th>
                    <th className="text-left py-3 px-4 text-emerald-100/40 font-medium">
                      To Protocol
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {REVENUE_SOURCES.map((row) => (
                    <tr
                      key={row.source}
                      className="border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-emerald-300">
                        {row.source}
                      </td>
                      <td className="py-3 px-4 text-emerald-100/60">
                        {row.mechanism}
                      </td>
                      <td className="py-3 px-4 text-emerald-400">
                        {row.toProtocol}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
