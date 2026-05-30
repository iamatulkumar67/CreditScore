import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const { borrowerAddress, loanId, repayAmount } = await request.json();

    if (!borrowerAddress || !loanId || !repayAmount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const { data: loan } = await insforge.database
      .from("loans")
      .select()
      .eq("loan_id", loanId)
      .eq("borrower_address", borrowerAddress)
      .eq("status", "active")
      .single();

    if (!loan) return NextResponse.json({ success: false, error: "Active loan not found" }, { status: 404 });

    const outstanding = (Number(loan.borrow_amount) - Number(loan.repaid_amount)) / 1e6;
    const actualRepay = Math.min(repayAmount, outstanding);
    const newRepaid = String(Number(loan.repaid_amount) + Math.round(actualRepay * 1e6));
    const fullyRepaid = Number(newRepaid) >= Number(loan.borrow_amount);

    await insforge.database.from("loans").update({ repaid_amount: newRepaid, status: fullyRepaid ? "repaid" : "active", updated_at: new Date().toISOString() }).eq("id", loan.id);

    const { data: pool } = await insforge.database.from("pools").select().eq("mint_address", loan.borrow_mint).single();
    if (pool) {
      const newBorrows = String(Math.max(0, Number(pool.total_borrows) - Math.round(actualRepay * 1e6)));
      await insforge.database.from("pools").update({ total_borrows: newBorrows, utilization_rate: Number(pool.total_deposits) > 0 ? Number(newBorrows) / Number(pool.total_deposits) : 0 }).eq("id", pool.id);
    }

    await insforge.database.from("protocol_events").insert({ event_type: "loan_repaid", data: { loan_id: loanId, borrower: borrowerAddress, amount: actualRepay, fully_repaid: fullyRepaid } });

    return NextResponse.json({ success: true, data: { repaid: actualRepay, fullyRepaid, remaining: outstanding - actualRepay } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to repay";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
