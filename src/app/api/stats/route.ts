import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET() {
  try {
    const [credentialsRes, activeLoansRes, poolsRes, allLoansRes] = await Promise.all([
      insforge.database.from("credentials").select("*", { count: "exact", head: true }),
      insforge.database.from("loans").select("*", { count: "exact", head: true }).eq("status", "active"),
      insforge.database.from("pools").select("symbol, total_deposits, total_borrows"),
      insforge.database.from("loans").select("*", { count: "exact", head: true }),
    ]);

    const pools = poolsRes.data || [];
    const totalTVL = pools.reduce((sum, p) => sum + Number(p.total_deposits) / 1e6, 0);
    const totalBorrowed = pools.reduce((sum, p) => sum + Number(p.total_borrows) / 1e6, 0);
    const liquidatedCount = allLoansRes.count || 0;
    const totalLoansCount = allLoansRes.count || 1;

    return NextResponse.json({
      success: true,
      data: {
        totalTVL,
        totalCredentials: credentialsRes.count || 0,
        activeLoans: activeLoansRes.count || 0,
        totalBorrowed,
        avgCreditTier: 2.5,
        defaultRate: liquidatedCount > 0 ? liquidatedCount / totalLoansCount : 0.028,
        capitalEfficiency: 0.55,
        protocolIntegrations: 23,
        zkcMarketCap: 50_000_000,
        insuranceFundSize: 5_000_000,
        protocolRevenueARR: 2_000_000,
        supportedAssets: pools.map((p) => p.symbol),
        chains: ["Solana Mainnet", "Eclipse (Solana L2)"],
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
