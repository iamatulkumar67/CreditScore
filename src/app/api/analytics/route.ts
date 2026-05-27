import { NextResponse } from "next/server";

// Historical analytics data — in production would query The Graph / on-chain indexer
const ANALYTICS_DATA = {
  tvlHistory: [
    { month: "2025-07", tvl: 5_000_000, loans: 2_000_000 },
    { month: "2025-08", tvl: 12_000_000, loans: 5_000_000 },
    { month: "2025-09", tvl: 18_000_000, loans: 8_000_000 },
    { month: "2025-10", tvl: 25_000_000, loans: 11_000_000 },
    { month: "2025-11", tvl: 32_000_000, loans: 14_000_000 },
    { month: "2025-12", tvl: 38_000_000, loans: 17_000_000 },
    { month: "2026-01", tvl: 48_000_000, loans: 22_000_000 },
    { month: "2026-02", tvl: 56_000_000, loans: 26_000_000 },
    { month: "2026-03", tvl: 65_000_000, loans: 30_000_000 },
    { month: "2026-04", tvl: 72_000_000, loans: 34_000_000 },
    { month: "2026-05", tvl: 82_000_000, loans: 38_000_000 },
    { month: "2026-06", tvl: 100_000_000, loans: 48_000_000 },
  ],
  tierDistribution: [
    { tier: 0, name: "None", percentage: 25, count: 25_108 },
    { tier: 1, name: "Basic", percentage: 20, count: 20_086 },
    { tier: 2, name: "Good", percentage: 30, count: 30_130 },
    { tier: 3, name: "Excellent", percentage: 18, count: 18_078 },
    { tier: 4, name: "Premium", percentage: 7, count: 7_030 },
  ],
  topAssets: [
    { asset: "USDC", tvl: 45_000_000, borrowVolume: 35_000_000, utilization: 77.8 },
    { asset: "SOL", tvl: 25_000_000, borrowVolume: 15_000_000, utilization: 60.0 },
    { asset: "USDT", tvl: 15_000_000, borrowVolume: 12_000_000, utilization: 80.0 },
    { asset: "mSOL", tvl: 10_000_000, borrowVolume: 8_000_000, utilization: 80.0 },
    { asset: "jitoSOL", tvl: 5_000_000, borrowVolume: 5_000_000, utilization: 100.0 },
  ],
  interestRateModel: {
    baseRate: 0.02,
    optimalUtilization: 0.8,
    slope1: 0.08,
    slope2: 0.75,
    tierDiscounts: [0, 0.02, 0.04, 0.06, 0.08],
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    data: ANALYTICS_DATA,
  });
}
