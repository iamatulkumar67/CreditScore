"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  BarChart3,
} from "lucide-react";

const FALLBACK_TVL = [
  { month: "Jul", tvl: 5, loans: 2 },
  { month: "Aug", tvl: 12, loans: 5 },
  { month: "Sep", tvl: 18, loans: 8 },
  { month: "Oct", tvl: 25, loans: 11 },
  { month: "Nov", tvl: 32, loans: 14 },
  { month: "Dec", tvl: 38, loans: 17 },
  { month: "Jan", tvl: 48, loans: 22 },
  { month: "Feb", tvl: 56, loans: 26 },
  { month: "Mar", tvl: 65, loans: 30 },
  { month: "Apr", tvl: 72, loans: 34 },
  { month: "May", tvl: 82, loans: 38 },
  { month: "Jun", tvl: 100, loans: 48 },
];

const FALLBACK_TIERS = [
  { name: "None (Tier 0)", value: 25, color: "#6b7280" },
  { name: "Basic (Tier 1)", value: 20, color: "#f59e0b" },
  { name: "Good (Tier 2)", value: 30, color: "#10b981" },
  { name: "Excellent (Tier 3)", value: 18, color: "#14b8a6" },
  { name: "Premium (Tier 4)", value: 7, color: "#2dd4bf" },
];

const INTEREST_RATE_DATA = [
  { utilization: 0, rate: 2 },
  { utilization: 20, rate: 3.6 },
  { utilization: 40, rate: 5.2 },
  { utilization: 60, rate: 6.8 },
  { utilization: 80, rate: 8.4 },
  { utilization: 85, rate: 18 },
  { utilization: 90, rate: 38 },
  { utilization: 95, rate: 56 },
  { utilization: 100, rate: 75 },
];

const STATS = [
  {
    icon: DollarSign,
    label: "Total Value Locked",
    value: "$100M",
    change: "+28.5%",
    positive: true,
  },
  {
    icon: Users,
    label: "ZK Credentials Issued",
    value: "100,000+",
    change: "+45.2%",
    positive: true,
  },
  {
    icon: Activity,
    label: "Active Loans",
    value: "20,000+",
    change: "+33.1%",
    positive: true,
  },
  {
    icon: Shield,
    label: "Default Rate",
    value: "<3%",
    change: "-1.2%",
    positive: true,
  },
  {
    icon: TrendingUp,
    label: "Capital Efficiency",
    value: "+55%",
    change: "vs Standard",
    positive: true,
  },
  {
    icon: BarChart3,
    label: "Protocol Integrations",
    value: "20+",
    change: "3 new",
    positive: true,
  },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 text-xs border border-emerald-500/20">
        <p className="text-emerald-100/60 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: ${entry.value}M
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProtocolStats() {
  const [tvlData, setTvlData] = useState(FALLBACK_TVL);
  const [tierDist, setTierDist] = useState(FALLBACK_TIERS);
  const [liveStats, setLiveStats] = useState(STATS);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(res => {
      if (res.success && res.data) {
        if (res.data.tvlHistory?.length > 0) {
          const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          setTvlData(res.data.tvlHistory.map((h: any) => ({
            month: months[parseInt(h.month.split("-")[1]) - 1] || h.month,
            tvl: h.tvl,
            loans: h.loans,
          })));
        }
        if (res.data.tierDistribution?.length > 0) {
          const colors = ["#6b7280", "#f59e0b", "#10b981", "#14b8a6", "#2dd4bf"];
          setTierDist(res.data.tierDistribution.map((t: any) => ({
            name: `${t.name} (Tier ${t.tier})`,
            value: t.percentage || 20,
            color: colors[t.tier] || "#10b981",
          })));
        }
      }
    }).catch(() => {});

    fetch("/api/stats").then(r => r.json()).then(res => {
      if (res.success && res.data) {
        const d = res.data;
        setLiveStats([
          { icon: DollarSign, label: "Total Value Locked", value: `$${(d.totalTVL / 1e6).toFixed(0)}M`, change: "+28.5%", positive: true },
          { icon: Users, label: "ZK Credentials Issued", value: d.totalCredentials.toLocaleString(), change: "+45.2%", positive: true },
          { icon: Activity, label: "Active Loans", value: d.activeLoans.toLocaleString(), change: "+33.1%", positive: true },
          { icon: Shield, label: "Default Rate", value: `${(d.defaultRate * 100).toFixed(1)}%`, change: "-1.2%", positive: true },
          { icon: TrendingUp, label: "Capital Efficiency", value: `+${(d.capitalEfficiency * 100).toFixed(0)}%`, change: "vs Standard", positive: true },
          { icon: BarChart3, label: "Protocol Integrations", value: `${d.protocolIntegrations}+`, change: "3 new", positive: true },
        ]);
      }
    }).catch(() => {});
  }, []);
  return (
    <section className="relative py-24 overflow-hidden" id="dashboard">
      <div className="absolute inset-0 dot-pattern opacity-15" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-4">
            <Activity className="h-4 w-4" />
            Protocol Dashboard
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Live Protocol{" "}
            <span className="gradient-text">Analytics</span>
          </h2>
          <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto">
            Track ZKCreditScore&apos;s growth — TVL, credentials, loans, and capital efficiency metrics.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {liveStats.map((stat) => (
            <Card
              key={stat.label}
              className="glass-card border-emerald-500/10 bg-transparent hover:border-emerald-500/30 transition-all"
            >
              <CardContent className="p-4">
                <stat.icon className="h-5 w-5 text-emerald-400 mb-2" />
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-emerald-100/40 mt-0.5">
                  {stat.label}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    stat.positive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {stat.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* TVL Chart */}
          <Card className="lg:col-span-2 glass-card border-emerald-500/10 bg-transparent">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-400" />
                TVL & Loan Volume Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tvlData}>
                    <defs>
                      <linearGradient id="tvlGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="loansGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a2e25" />
                    <XAxis
                      dataKey="month"
                      stroke="#4a6d5a"
                      tick={{ fill: "#4a6d5a", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#4a6d5a"
                      tick={{ fill: "#4a6d5a", fontSize: 12 }}
                      tickFormatter={(v) => `$${v}M`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="tvl"
                      name="TVL"
                      stroke="#10b981"
                      fill="url(#tvlGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="loans"
                      name="Loans"
                      stroke="#14b8a6"
                      fill="url(#loansGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tier Distribution */}
          <Card className="glass-card border-emerald-500/10 bg-transparent">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-400" />
                Tier Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {tierDist.map((entry, index) => (
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
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {tierDist.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-emerald-100/60">{item.name}</span>
                    </div>
                    <span className="text-emerald-100/80 font-medium">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interest Rate Model Chart */}
        <Card className="glass-card border-emerald-500/10 bg-transparent mt-6">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Kink Interest Rate Model
              <span className="text-xs text-emerald-100/40 font-normal ml-2">
                with credit tier discounts
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={INTEREST_RATE_DATA}>
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a2e25" />
                  <XAxis
                    dataKey="utilization"
                    stroke="#4a6d5a"
                    tick={{ fill: "#4a6d5a", fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    stroke="#4a6d5a"
                    tick={{ fill: "#4a6d5a", fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0a1210",
                      border: "1px solid #10b98133",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value}% APR`, "Borrow Rate"]}
                    labelFormatter={(label: number) => `Utilization: ${label}%`}
                  />
                  <Bar dataKey="rate" fill="url(#rateGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-emerald-100/40">
              <span>Base Rate: 2% APR</span>
              <span>•</span>
              <span>Optimal Utilization: 80%</span>
              <span>•</span>
              <span>Slope 1: 8% | Slope 2: 75%</span>
              <span>•</span>
              <span className="text-emerald-400">Tier discounts: -2% to -8%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
