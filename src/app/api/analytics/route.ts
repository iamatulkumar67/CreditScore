import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET() {
  try {
    const [tvlRes, credentialsRes, poolsRes] = await Promise.all([
      insforge.database.from("tvl_snapshots").select().order("month", { ascending: true }).limit(12),
      insforge.database.from("credentials").select("credit_tier"),
      insforge.database.from("pools").select().order("total_deposits", { ascending: false }),
    ]);

    const tvlHistory = (tvlRes.data || []).map((s) => ({
      month: s.month,
      tvl: Number(s.total_tvl) / 1e6,
      loans: Number(s.total_loans) / 1e6,
    }));

    const tierNames = ["None", "Basic", "Good", "Excellent", "Premium"];
    const tierCounts = [0, 0, 0, 0, 0];
    (credentialsRes.data || []).forEach((c) => { tierCounts[c.credit_tier]++; });
    const total = credentialsRes.data?.length || 1;
    const tierDistribution = tierCounts.map((count, tier) => ({
      tier,
      name: tierNames[tier],
      percentage: Math.round((count / total) * 100),
      count,
    }));

    const topAssets = (poolsRes.data || []).map((p) => ({
      asset: p.symbol,
      tvl: Number(p.total_deposits) / 1e6,
      borrowVolume: Number(p.total_borrows) / 1e6,
      utilization: p.utilization_rate * 100,
    }));

    return NextResponse.json({
      success: true,
      data: {
        tvlHistory,
        tierDistribution,
        topAssets,
        interestRateModel: {
          baseRate: 0.02,
          optimalUtilization: 0.8,
          slope1: 0.08,
          slope2: 0.75,
          tierDiscounts: [0, 0.02, 0.04, 0.06, 0.08],
        },
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
