import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { mailer } from "@/services/mailer";
import { formatCurrency } from "@/lib/utils";

/**
 * Called server-to-server by the main VELANTHOR platform when a referred
 * customer completes a purchase (checkout success / subscription renewal).
 * Authenticated via HMAC signature, not user session — this is a webhook.
 *
 * Expected header: x-velanthor-signature = hex(hmac_sha256(body, CONVERSION_WEBHOOK_SECRET))
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-velanthor-signature");

    if (!signature) {
      return NextResponse.json({ error: "Signatur fehlt" }, { status: 401 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.CONVERSION_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    const validSignature =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!validSignature) {
      return NextResponse.json({ error: "Ungültige Signatur" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const { referralCode, sessionId, customerEmail, customerExternalId, orderValue, isRecurring } = body;

    if (!customerEmail || typeof orderValue !== "number" || orderValue <= 0) {
      return NextResponse.json({ error: "Ungültige Nutzlast" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Resolve the affiliate: prefer an active tracked session, fall back to the raw referral code
    let affiliateId: string | null = null;
    let clickId: string | null = null;
    let campaignId: string | null = null;

    if (sessionId) {
      const { data: session } = await supabase
        .from("sessions")
        .select("affiliate_id, click_id, expires_at")
        .eq("id", sessionId)
        .single();

      if (session && new Date(session.expires_at) > new Date()) {
        affiliateId = session.affiliate_id;
        clickId = session.click_id;
      }
    }

    if (!affiliateId && referralCode) {
      const { data: affiliate } = await supabase
        .from("affiliates")
        .select("id, status")
        .eq("referral_code", referralCode)
        .single();
      if (affiliate?.status === "active") affiliateId = affiliate.id;
    }

    if (!affiliateId) {
      return NextResponse.json({ success: true, attributed: false });
    }

    if (clickId) {
      const { data: click } = await supabase.from("clicks").select("campaign_id").eq("id", clickId).single();
      campaignId = click?.campaign_id ?? null;
      await supabase.from("clicks").update({ converted: true }).eq("id", clickId);
    }

    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .insert({
        affiliate_id: affiliateId,
        click_id: clickId,
        campaign_id: campaignId,
        customer_email: customerEmail,
        customer_external_id: customerExternalId ?? null,
        order_value: orderValue,
        is_recurring: Boolean(isRecurring),
      })
      .select("id")
      .single();

    if (referralError || !referral) {
      console.error("Referral insert failed:", referralError);
      return NextResponse.json({ error: "Conversion konnte nicht gespeichert werden" }, { status: 500 });
    }

    // The DB trigger `generate_tiered_commissions` fires automatically on insert
    // and creates commission rows for tier 1/2/3 up the parent chain.

    const { data: commission } = await supabase
      .from("commissions")
      .select("commission_amount")
      .eq("referral_id", referral.id)
      .eq("tier_level", 1)
      .single();

    const { data: affiliateUser } = await supabase
      .from("affiliates")
      .select("user_id, users(email, first_name)")
      .eq("id", affiliateId)
      .single();

    if (affiliateUser?.users && commission) {
      const user = affiliateUser.users as any;
      await mailer.sendNewConversionEmail(
        user.email,
        user.first_name,
        formatCurrency(orderValue),
        formatCurrency(commission.commission_amount)
      );
    }

    await supabase.from("logs").insert({
      action: "conversion_tracked",
      entity_type: "referral",
      entity_id: referral.id,
      metadata: { affiliateId, orderValue, customerEmail },
    });

    return NextResponse.json({ success: true, attributed: true, referralId: referral.id });
  } catch (err) {
    console.error("Conversion tracking error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
