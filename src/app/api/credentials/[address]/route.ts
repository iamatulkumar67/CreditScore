import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function GET(_req: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;

    const { data, error } = await insforge.database
      .from("credentials")
      .select()
      .eq("owner_address", address)
      .eq("is_revoked", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ success: true, data: null, message: "No credential found" });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        ownerAddress: data.owner_address,
        creditTier: data.credit_tier,
        claimsBitmap: data.claims_bitmap,
        issuedAt: data.issued_at,
        expiresAt: data.expires_at,
        isRevoked: data.is_revoked,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to fetch credential" }, { status: 500 });
  }
}
