import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    const { data, error } = await insforge.database
      .from("loans")
      .select()
      .eq("borrower_address", address)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const loans = (data || []).map((l) => ({
      id: l.id,
      loanId: l.loan_id,
      collateralMint: l.collateral_mint,
      collateralAmount: Number(l.collateral_amount) / 1e6,
      borrowMint: l.borrow_mint,
      borrowAmount: Number(l.borrow_amount) / 1e6,
      interestRate: l.interest_rate / 100,
      collateralRatio: l.collateral_ratio / 100,
      creditTierAtIssuance: l.credit_tier_at_issuance,
      status: l.status,
      repaidAmount: Number(l.repaid_amount) / 1e6,
      createdAt: l.created_at,
    }));

    return NextResponse.json({ success: true, data: loans });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch loans" }, { status: 500 });
  }
}
