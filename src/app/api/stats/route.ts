import { NextResponse } from "next/server";

const MOCK_STATS = {
  totalTVL: 100_000_000,
  totalCredentials: 100_432,
  activeLoans: 20_187,
  totalBorrowed: 75_000_000,
  avgCreditTier: 2.5,
  defaultRate: 0.028,
  capitalEfficiency: 0.55,
  protocolIntegrations: 23,
  zkcMarketCap: 50_000_000,
  insuranceFundSize: 5_000_000,
  protocolRevenueARR: 2_000_000,
  supportedAssets: ["USDC", "USDT", "SOL", "mSOL", "jitoSOL"],
  chains: ["Solana Mainnet", "Eclipse (Solana L2)"],
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  try {
    const res = await fetch("https://api.zkscore.credit/v1/stats", {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, data });
    }
  } catch {}

  return NextResponse.json({
    success: true,
    data: MOCK_STATS,
  });
}
