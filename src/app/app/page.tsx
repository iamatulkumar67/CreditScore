"use client";

export const dynamic = 'force-dynamic';

import Link from "next/link";
import React, { useEffect, useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  Wallet,
  ArrowLeft,
  ChevronRight,
  Zap,
  Lock,
  BarChart3,
  Coins,
  TrendingUp,
  Activity,
  UserCheck,
  LogOut,
  Loader2,
} from "lucide-react";
import ErrorBoundary from "@/components/error-boundary";
import { ActionModal } from "@/components/action-modal";

const DEFAULT_POOLS = [
  { name: "USDC Lending Pool", tvl: "$45.0M", apy: "6.8%", utilization: "78%", color: "text-blue-400" },
  { name: "SOL Lending Pool", tvl: "$25.0M", apy: "5.2%", utilization: "60%", color: "text-purple-400" },
  { name: "USDT Lending Pool", tvl: "$15.0M", apy: "7.1%", utilization: "80%", color: "text-green-400" },
  { name: "mSOL Lending Pool", tvl: "$10.0M", apy: "4.5%", utilization: "80%", color: "text-emerald-400" },
];

const DEFAULT_STATS = [
  { label: "Total Value Locked", value: "$100.0M", icon: BarChart3, change: "+12.4%" },
  { label: "Active Loans", value: "0", icon: Activity, change: "+8.2%" },
  { label: "Credentials Issued", value: "0", icon: UserCheck, change: "+23.7%" },
  { label: "ZKCR Staked", value: "142.5M", icon: Coins, change: "+5.1%" },
];

interface PoolData {
  name: string;
  tvl: string;
  apy: string;
  utilization: string;
  color: string;
}

function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function useSDK() {
  const { publicKey, connected } = useWallet();
  const [creditTier, setCreditTier] = useState<{ tier: string; expiresAt: Date | null }>({ tier: "Not Verified", expiresAt: null });
  const [pools, setPools] = useState<PoolData[]>(DEFAULT_POOLS);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [position, setPosition] = useState({ deposits: 0, borrowed: 0, available: 0, healthFactor: 0 });
  const [loading, setLoading] = useState(false);
  const [poolSymbols, setPoolSymbols] = useState<string[]>(["USDC", "SOL", "USDT", "mSOL", "jitoSOL"]);

  useEffect(() => {
    const load = async () => {
    setLoading(true);
    const colors = ["text-blue-400", "text-purple-400", "text-green-400", "text-emerald-400", "text-cyan-400"];

    Promise.allSettled([
      fetch("/api/stats").then(r => r.json()).then(res => {
        if (res.success && res.data) {
          const d = res.data;
          setStats([
            { label: "Total Value Locked", value: `$${(d.totalTVL / 1e6).toFixed(1)}M`, icon: BarChart3, change: "+12.4%" },
            { label: "Active Loans", value: d.activeLoans.toLocaleString(), icon: Activity, change: "+8.2%" },
            { label: "Credentials Issued", value: d.totalCredentials.toLocaleString(), icon: UserCheck, change: "+23.7%" },
            { label: "ZKCR Staked", value: "142.5M", icon: Coins, change: "+5.1%" },
          ]);
        }
      }),
      fetch("/api/pools").then(r => r.json()).then(res => {
        if (res.success && res.data?.length > 0) {
          setPoolSymbols(res.data.map((p: any) => p.symbol));
          setPools(res.data.map((p: any, i: number) => ({
            name: `${p.symbol} Lending Pool`,
            tvl: `$${p.totalDeposits.toFixed(1)}M`,
            apy: `${(p.borrowApy * 100).toFixed(1)}%`,
            utilization: `${(p.utilizationRate * 100).toFixed(0)}%`,
            color: colors[i % colors.length],
          })));
        }
      }),
      connected && publicKey
        ? fetch(`/api/credentials/${publicKey.toBase58()}`).then(r => r.json()).then(res => {
            if (res.success && res.data) {
              setCreditTier({ tier: `Tier ${res.data.creditTier}`, expiresAt: new Date(res.data.expiresAt) });
            }
          })
        : Promise.resolve(),
      connected && publicKey
        ? fetch(`/api/loans/${publicKey.toBase58()}`).then(r => r.json()).then(res => {
            if (res.success && res.data) {
              const active = res.data.filter((l: any) => l.status === "active");
              const totalBorrowed = active.reduce((s: number, l: any) => s + l.borrowAmount, 0);
              const totalCollateral = active.reduce((s: number, l: any) => s + l.collateralAmount, 0);
              setPosition({
                deposits: totalCollateral,
                borrowed: totalBorrowed,
                available: Math.max(0, totalCollateral * 0.8 - totalBorrowed),
                healthFactor: totalBorrowed > 0 ? totalCollateral / totalBorrowed : 0,
              });
            }
          })
        : Promise.resolve(),
    ]).finally(() => setLoading(false));
    };
    load();
  }, [connected, publicKey?.toBase58()]);

  return { creditTier, pools, stats, position, loading, poolSymbols };
}

function Dashboard() {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const { creditTier, pools, stats, position, loading, poolSymbols } = useSDK();
  const [generating, setGenerating] = useState(false);
  const [showBorrow, setShowBorrow] = useState(false);
  const [showSupply, setShowSupply] = useState(false);
  const [showStake, setShowStake] = useState(false);

  const handleGenerateProof = useCallback(async () => {
    if (!connected || !publicKey) { setVisible(true); return; }
    setGenerating(true);
    try {
      // Simulate ZK proof generation and issue credential
      await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownerAddress: publicKey.toBase58(), creditTier: 2, claimsBitmap: 1 }),
      });
      window.location.reload();
    } catch (e) {
      console.error("Proof generation failed:", e);
    } finally {
      setGenerating(false);
    }
  }, [connected, publicKey, setVisible]);

  const handleBorrow = async (data: { pool?: string; amount: number; collateral?: number }) => {
    if (!publicKey) return;
    const res = await fetch("/api/borrow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ borrowerAddress: publicKey.toBase58(), poolSymbol: data.pool, borrowAmount: data.amount, collateralAmount: data.collateral }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    window.location.reload();
  };

  const handleSupply = async (data: { pool?: string; amount: number }) => {
    if (!publicKey) return;
    const res = await fetch("/api/supply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierAddress: publicKey.toBase58(), poolSymbol: data.pool, amount: data.amount }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    window.location.reload();
  };

  const handleStake = async (data: { amount: number }) => {
    if (!publicKey) return;
    const res = await fetch("/api/stake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stakerAddress: publicKey.toBase58(), amount: data.amount }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.error);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#060b09]">
      <header className="border-b border-emerald-500/10 bg-[#060b09]/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-emerald-100/50 hover:text-emerald-300 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-emerald-500/10" />
              <Link href="/app" className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-emerald-400" />
                <span className="text-base font-bold gradient-text">ZKCreditScore</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10">
                <Zap className="h-4 w-4 mr-1" />
                Devnet
              </Button>
              {connected ? (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30">
                    <Wallet className="h-4 w-4 mr-1" />
                    {shortAddress(publicKey!.toBase58())}
                  </Button>
                  <Button variant="ghost" onClick={disconnect} className="text-emerald-100/50 hover:text-red-400 hover:bg-red-500/10" title="Disconnect">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setVisible(true)} disabled={connecting} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  <Wallet className="h-4 w-4 mr-1" />
                  {connecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8 border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
          <CardContent className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-100/50">Your Credit Tier</p>
                <p className="text-xl font-bold gradient-text">{loading ? "Loading..." : creditTier.tier}</p>
                <p className="text-xs text-emerald-100/40 mt-0.5">
                  {creditTier.expiresAt ? `Expires ${creditTier.expiresAt.toLocaleDateString()}` : "Generate a ZK proof to unlock under-collateralized loans"}
                </p>
              </div>
            </div>
            <Button onClick={handleGenerateProof} disabled={generating} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {generating ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Shield className="mr-1 h-4 w-4" />}
              {generating ? "Generating..." : "Generate ZK Proof"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-emerald-500/10">
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-emerald-100/50">{stat.label}</span>
                  <stat.icon className="h-4 w-4 text-emerald-500/50" />
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-emerald-400 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="border-emerald-500/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Lending Pools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="grid grid-cols-4 gap-4 px-4 py-2 text-xs text-emerald-100/40 font-medium">
                    <span>Pool</span>
                    <span className="text-right">TVL</span>
                    <span className="text-right">APY</span>
                    <span className="text-right">Utilization</span>
                  </div>
                  {pools.map((pool) => (
                    <div key={pool.name} className="grid grid-cols-4 gap-4 px-4 py-3 rounded-lg hover:bg-emerald-500/5 transition-colors cursor-pointer group">
                      <span className="text-sm text-emerald-100/80 group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${pool.color.replace("text", "bg")}`} />
                        {pool.name}
                      </span>
                      <span className="text-sm text-right text-emerald-100/80">{pool.tvl}</span>
                      <span className="text-sm text-right text-emerald-400">{pool.apy}</span>
                      <span className="text-sm text-right text-emerald-100/80">{pool.utilization}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-emerald-500/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Borrow", desc: "Get a loan against collateral", icon: Coins, action: () => connected ? setShowBorrow(true) : setVisible(true) },
                  { label: "Supply", desc: "Earn interest on deposits", icon: TrendingUp, action: () => connected ? setShowSupply(true) : setVisible(true) },
                  { label: "Stake ZKCR", desc: "Stake tokens for rewards", icon: Zap, action: () => connected ? setShowStake(true) : setVisible(true) },
                  { label: "Verify Identity", desc: "Generate ZK credential", icon: Lock, action: handleGenerateProof },
                ].map((action) => (
                  <Button key={action.label} variant="ghost" onClick={action.action} className="w-full justify-start gap-3 h-auto py-3 px-4 text-left">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <action.icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-emerald-100/80">{action.label}</div>
                      <div className="text-xs text-emerald-100/40">{action.desc}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-emerald-500/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Your Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Total Deposits", value: connected ? `$${position.deposits.toFixed(2)}` : "—" },
                    { label: "Total Borrowed", value: connected ? `$${position.borrowed.toFixed(2)}` : "—" },
                    { label: "Available to Borrow", value: connected ? `$${position.available.toFixed(2)}` : "—" },
                    { label: "Health Factor", value: connected ? (position.healthFactor > 0 ? position.healthFactor.toFixed(2) : "—") : "—" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1">
                      <span className="text-xs text-emerald-100/50">{item.label}</span>
                      <span className="text-sm font-medium text-emerald-100/80">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {connected && publicKey && (
          <Card className="border-emerald-500/10">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-400" />
                Connected Wallet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{shortAddress(publicKey.toBase58())}</p>
                  <p className="text-xs text-emerald-100/40">Connected via Phantom on Devnet</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <ActionModal open={showBorrow} onClose={() => setShowBorrow(false)} title="Borrow" type="borrow" pools={poolSymbols} onSubmit={handleBorrow} />
      <ActionModal open={showSupply} onClose={() => setShowSupply(false)} title="Supply" type="supply" pools={poolSymbols} onSubmit={handleSupply} />
      <ActionModal open={showStake} onClose={() => setShowStake(false)} title="Stake ZKCR" type="stake" onSubmit={handleStake} />
    </div>
  );
}

export default function AppPage() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
