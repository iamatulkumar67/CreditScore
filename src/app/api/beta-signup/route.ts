import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const { name, email, wallet_address, use_case } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    const { error } = await insforge.database
      .from("beta_signups")
      .insert({ name, email, wallet_address: wallet_address || null, use_case: use_case || null });

    if (error) {
      if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        return NextResponse.json({ success: false, error: "duplicate" }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to process signup" }, { status: 500 });
  }
}
