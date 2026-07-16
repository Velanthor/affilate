import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/** Admin manually adds a commission (e.g. for a manually-processed sale or bonus). */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service, user } = admin;
  const body = await req.json();
  const { amount, notes, referralId } = body;

  if (typeof amount !== "number" || amount === 0) {
    return NextResponse.json({ error: "Ungültiger Betrag" }, { status: 400 });
  }

  let targetReferralId = referralId;

  // A commission row requires a referral_id — create a synthetic manual referral if none given
  if (!targetReferralId) {
    const { data: manualReferral, error: referralError } = await service
      .from("referrals")
      .insert({
        affiliate_id: params.id,
        customer_email: "manual-adjustment@velanthor.internal",
        order_value: Math.abs(amount),
      })
      .select("id")
      .single();

    if (referralError || !manualReferral) {
      return NextResponse.json({ error: "Manuelle Provision konnte nicht erstellt werden." }, { status: 500 });
    }
    targetReferralId = manualReferral.id;

    // The DB trigger auto-generates tiered commissions on referral insert.
    // For a precise manual adjustment we instead void those and insert our own exact row.
    await service.from("commissions").delete().eq("referral_id", targetReferralId);
  }

  const { data: commission, error } = await service
    .from("commissions")
    .insert({
      affiliate_id: params.id,
      referral_id: targetReferralId,
      tier_level: 1,
      type: "fixed",
      base_amount: Math.abs(amount),
      commission_amount: amount,
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      notes: notes || "Manuelle Anpassung durch Admin",
    })
    .select("id")
    .single();

  if (error || !commission) {
    return NextResponse.json({ error: "Provision konnte nicht gespeichert werden." }, { status: 500 });
  }

  await service.from("logs").insert({
    actor_id: user.id,
    action: amount > 0 ? "commission_added_manually" : "commission_removed_manually",
    entity_type: "commission",
    entity_id: commission.id,
    metadata: { affiliateId: params.id, amount, notes },
  });

  return NextResponse.json({ success: true, message: "Provision gespeichert." });
}
