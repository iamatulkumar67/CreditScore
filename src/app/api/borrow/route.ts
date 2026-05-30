import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const { borrowerAddress, poolSymbol, borrowAmount, collateralAmount } = await request.json();

    if (!borrowerAddress || !poolSymbol || !borrowAmount || !collateralAmount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const { data: credential } = await insforge.database
      .from("credentials")
      .select()
      .eq("owner_address", borrowerAddress)
      .eq("is_revoked", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const tier = credential?.credit_tier ?? 0;
    const collateralRatios = [1.5, 1.1, 0.8, 0.6, 0.5];
    const requiredRatio = collateralRatios[tier];

    if (collateralAmount < borrowAmount * requiredRatio) {
      return NextResponse.json({ success: false, error: `Tier ${tier} requires ${requiredRatio * 100}% collateral ratio` }, { status: 400 });
    }

    const { data: pool } = await insforge.database.from("pools").select().eq("symbol", poolSymbol).single();
    if (!pool) return NextResponse.json({ success: false, error: "Pool not found" }, { status: 404 });

    const { data: lastLoan } = await insforge.database.from("loans").select("loan_id").order("loan_id", { ascending: false }).limit(1).maybeSingle();
    const nextLoanId = (lastLoan?.loan_id ?? 0) + 1;
    const interestRates = [1000, 800, 600, 400, 200];

    const { data: loan, error } = await insforge.database
      .from("loans")
      .insert({
        loan_id: nextLoanId,
        borrower_address: borrowerAddress,
        collateral_mint: pool.mint_address,
        collateral_amount: String(Math.round(collateralAmount * 1e6)),
        borrow_mint: pool.mint_address,
        borrow_amount: String(Math.round(borrowAmount * 1e6)),
        interest_rate: interestRates[tier],
        collateral_ratio: Math.round(requiredRatio * 100),
        credit_tier_at_issuance: tier,
        status: "active",
      })
      .select()
      .single();

    if (error) throw error;

    const newBorrows = String(Number(pool.total_borrows) + Math.round(borrowAmount * 1e6));
    const newDeposits = String(Number(pool.total_deposits) + Math.round(collateralAmount * 1e6));
    await insforge.database.from("pools").update({ total_borrows: newBorrows, total_deposits: newDeposits, utilization_rate: Number(newBorrows) / Number(newDeposits) }).eq("id", pool.id);

    await insforge.database.from("protocol_events").insert({ event_type: "loan_created", data: { loan_id: nextLoanId, borrower: borrowerAddress, amount: borrowAmount, pool: poolSymbol } });

    return NextResponse.json({ success: true, data: loan });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create loan";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
