"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Code2, BookOpen } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/10 rounded-full blur-[200px]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
          <Shield className="h-4 w-4" />
          Join the ZK Credit Revolution
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Real Credit, Finally in DeFi
          <br />
          <span className="gradient-text">
            — Without Sacrificing Privacy
          </span>
        </h2>

        <p className="text-lg text-emerald-100/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join thousands of users who are already accessing under-collateralized
          loans with privacy-preserving ZK credit credentials. No whitelist.
          No data sharing. Pure cryptographic proof.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Button asChild
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-xl shadow-emerald-600/25 text-base px-8 h-14"
          >
            <Link href="/app">
              Launch App
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 text-base px-8 h-14"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Read Docs
          </Button>
          <a
            href="https://github.com/iamatulkumar67/zkcreditscore-sdk"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              variant="outline"
              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200 text-base px-8 h-14"
            >
              <Code2 className="mr-2 h-5 w-5" />
              Integration SDK
            </Button>
          </a>
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {[
            { value: "100K+", label: "Credentials" },
            { value: "$100M", label: "TVL" },
            { value: "<3%", label: "Default Rate" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-xs text-emerald-100/40 mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
