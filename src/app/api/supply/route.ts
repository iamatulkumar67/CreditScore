import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const { supplierAddress, poolSymbol, amount } = await request.json();

    if (!supplierAddress || !poolSymbol || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const { data: pool } = await insforge.database.from("pools").select().eq("symbol", poolSymbol).single();
    if (!pool) return NextResponse.json({ success: false, error: "Pool not found" }, { status: 404 });

    const newDeposits = String(Number(pool.total_deposits) + Math.round(amount * 1e6));
    await insforge.database.from("pools").update({ total_deposits: newDeposits, utilization_rate: Number(newDeposits) > 0 ? Number(pool.total_borrows) / Number(newDeposits) : 0, updated_at: new Date().toISOString() }).eq("id", pool.id);

    await insforge.database.from("protocol_events").insert({ event_type: "supply", data: { supplier: supplierAddress, pool: poolSymbol, amount } });

    return NextResponse.json({ success: true, data: { pool: poolSymbol, deposited: amount } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to supply";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
