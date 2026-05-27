import { NextResponse } from "next/server";

// Mock protocol statistics — in production these would come from on-chain data / The Graph
const PROTOCOL_STATS = {
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
  supportedAssets: ["USDC", "USDT", "DAI", "ETH", "WBTC"],
  chains: ["Polygon zkEVM", "Arbitrum One"],
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: PROTOCOL_STATS,
  });
}
