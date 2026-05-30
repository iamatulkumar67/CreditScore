import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET() {
  try {
    const { data, error } = await insforge.database
      .from("pools")
      .select()
      .order("total_deposits", { ascending: false });

    if (error) throw error;

    const pools = (data || []).map((p) => ({
      id: p.id,
      mintAddress: p.mint_address,
      symbol: p.symbol,
      totalDeposits: Number(p.total_deposits) / 1e6,
      totalBorrows: Number(p.total_borrows) / 1e6,
      utilizationRate: p.utilization_rate,
      borrowApy: p.borrow_apy,
      supplyApy: p.supply_apy,
      baseRate: p.base_rate,
    }));

    return NextResponse.json({ success: true, data: pools });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch pools" }, { status: 500 });
  }
}
