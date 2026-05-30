import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const { stakerAddress, amount } = await request.json();

    if (!stakerAddress || !amount) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    await insforge.database.from("protocol_events").insert({ event_type: "stake", data: { staker: stakerAddress, amount, token: "ZKCR" } });

    return NextResponse.json({ success: true, data: { staked: amount, token: "ZKCR" } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to stake";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
