"use client";

import { Shield, Github, X, Globe, FileText, Mail } from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Protocol",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Credit Tiers", href: "#credit-tiers" },
      { label: "Loan Calculator", href: "#calculator" },
      { label: "Dashboard", href: "#dashboard" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Integration SDK", href: "https://github.com/iamatulkumar67/zkcreditscore-sdk" },
      { label: "Smart Contracts", href: "#" },
      { label: "ZK Circuits", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Governance Forum", href: "#" },
      { label: "Discord", href: "#" },
      { label: "X", href: "https://x.com/ZkCreditScore" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Risk Disclaimer", href: "#" },
      { label: "Compliance", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-emerald-500/10 bg-[#040807]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-7 w-7 text-emerald-400" />
              <span className="text-lg font-bold gradient-text">
                ZKCreditScore
              </span>
            </div>
            <p className="text-sm text-emerald-100/40 leading-relaxed mb-4 max-w-xs">
              Privacy-preserving, decentralized lending protocol using Zero-Knowledge
              Proofs for real-world creditworthiness verification.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Github, href: "https://github.com/iamatulkumar67/zkcreditscore-sdk", label: "GitHub" },
                { icon: X, href: "https://x.com/ZkCreditScore", label: "X" },
                { icon: Globe, href: "#", label: "Website" },
                { icon: FileText, href: "#", label: "Docs" },
                { icon: Mail, href: "#", label: "Email" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="h-9 w-9 rounded-lg border border-emerald-500/10 flex items-center justify-center text-emerald-100/40 hover:text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-emerald-100/70 mb-3">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-emerald-100/40 hover:text-emerald-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-emerald-500/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-emerald-100/30">
            © 2026 ZKCreditScore Protocol. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-emerald-100/30">
            <span>Built on Solana</span>
            <span>•</span>
            <a
              href="https://github.com/iamatulkumar67/zkcreditscore-sdk"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-300 transition-colors"
            >
              SDK v0.1.0
            </a>
            <span>•</span>
            <span>Audited by Trail of Bits & OpenZeppelin</span>
            <span>•</span>
            <span>v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
