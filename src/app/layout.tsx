import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZKCreditScore — Privacy-Preserving DeFi Lending Protocol",
  description:
    "Decentralized lending protocol using Zero-Knowledge Proofs to enable under-collateralized loans based on real-world creditworthiness — without revealing sensitive financial data.",
  keywords: [
    "ZKCreditScore",
    "DeFi",
    "Zero-Knowledge Proofs",
    "Lending",
    "Credit Score",
    "Privacy",
    "Blockchain",
    "Under-collateralized",
  ],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#060b09] text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
