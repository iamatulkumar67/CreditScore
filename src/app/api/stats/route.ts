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
        protocolIntegrations: pools.length,
        zkcMarketCap: 0,
        insuranceFundSize: 0,
        protocolRevenueARR: 0,
        supportedAssets: pools.map((p) => p.symbol),
        chains: ["Solana Devnet"],
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 500 });
  }
}
