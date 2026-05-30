import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SolanaWalletProvider } from "@/components/providers/wallet-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZKCreditScore — Dashboard",
  description: "ZKCreditScore app dashboard — manage your ZK credentials, borrow, supply, and stake.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </div>
  );
}
