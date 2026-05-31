"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, CheckCircle, Rocket, Lock, Zap } from "lucide-react";
import { insforge } from "@/lib/insforge";

export default function BetaSignup() {
  const [form, setForm] = useState({ name: "", email: "", wallet_address: "", use_case: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;

    setStatus("loading");
    const { error } = await insforge.database
      .from("beta_signups")
      .insert({ name: form.name, email: form.email, wallet_address: form.wallet_address || null, use_case: form.use_case || null });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message?.includes("duplicate") ? "This email is already registered for beta!" : "Something went wrong. Please try again.");
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[#060b09] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-20 w-20 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">You&apos;re In! 🎉</h1>
          <p className="text-emerald-100/60">
            Welcome to the ZKCreditScore beta. We&apos;ll notify you at <span className="text-emerald-300 font-medium">{form.email}</span> when access is ready.
          </p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white">
            <Link href="/">← Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b09] flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px]" />

      <div className="relative max-w-lg w-full space-y-8">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-emerald-100/60 hover:text-emerald-300 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-emerald-400" />
            <span className="text-lg font-bold gradient-text">ZKCreditScore</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Join the <span className="gradient-text">Beta</span>
          </h1>
          <p className="text-emerald-100/60">
            Be among the first to access under-collateralized DeFi lending powered by Zero-Knowledge Proofs. Early beta users get priority access + exclusive ZKCR token allocation.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: Rocket, text: "Early Access" },
            { icon: Lock, text: "Privacy First" },
            { icon: Zap, text: "ZKCR Airdrop" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="glass-card rounded-lg p-3 flex items-center gap-2">
              <Icon className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-100/80">{text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 space-y-5 border border-emerald-500/20">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-emerald-100/80">Name *</Label>
            <Input id="name" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-emerald-950/30 border-emerald-500/20 text-white placeholder:text-emerald-100/30 focus:border-emerald-500/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-emerald-100/80">Email *</Label>
            <Input id="email" type="email" required placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-emerald-950/30 border-emerald-500/20 text-white placeholder:text-emerald-100/30 focus:border-emerald-500/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet" className="text-emerald-100/80">Solana Wallet Address <span className="text-emerald-100/40">(optional)</span></Label>
            <Input id="wallet" placeholder="Your Phantom wallet address" value={form.wallet_address} onChange={(e) => setForm({ ...form, wallet_address: e.target.value })} className="bg-emerald-950/30 border-emerald-500/20 text-white placeholder:text-emerald-100/30 focus:border-emerald-500/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="use_case" className="text-emerald-100/80">How will you use ZKCreditScore? <span className="text-emerald-100/40">(optional)</span></Label>
            <Input id="use_case" placeholder="e.g., Under-collateralized borrowing, protocol integration..." value={form.use_case} onChange={(e) => setForm({ ...form, use_case: e.target.value })} className="bg-emerald-950/30 border-emerald-500/20 text-white placeholder:text-emerald-100/30 focus:border-emerald-500/50" />
          </div>

          {status === "error" && (
            <p className="text-red-400 text-sm">{errorMsg}</p>
          )}

          <Button type="submit" disabled={status === "loading"} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-12 text-base shadow-lg shadow-emerald-600/25">
            {status === "loading" ? "Signing up..." : "Sign Up for Beta Access"}
          </Button>

          <p className="text-xs text-emerald-100/40 text-center">
            No spam. We&apos;ll only email you about beta access and launch updates.
          </p>
        </form>
      </div>
    </div>
  );
}
