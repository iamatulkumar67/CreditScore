import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST(request: Request) {
  try {
    const { ownerAddress, creditTier, claimsBitmap } = await request.json();

    if (!ownerAddress || creditTier === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (creditTier < 0 || creditTier > 4) {
      return NextResponse.json({ success: false, error: "Invalid credit tier (0-4)" }, { status: 400 });
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Revoke existing credentials
    await insforge.database.from("credentials").update({ is_revoked: true, updated_at: new Date().toISOString() }).eq("owner_address", ownerAddress).eq("is_revoked", false);

    const { data, error } = await insforge.database
      .from("credentials")
      .insert({ owner_address: ownerAddress, credit_tier: creditTier, claims_bitmap: claimsBitmap || 0, issued_at: issuedAt.toISOString(), expires_at: expiresAt.toISOString(), issuer_address: "ZKCreditProtocol", is_revoked: false })
      .select()
      .single();

    if (error) throw error;

    await insforge.database.from("protocol_events").insert({ event_type: "credential_issued", data: { owner: ownerAddress, tier: creditTier, expires_at: expiresAt.toISOString() } });

    return NextResponse.json({ success: true, data: { id: data.id, creditTier, expiresAt: expiresAt.toISOString() } });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to verify";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
