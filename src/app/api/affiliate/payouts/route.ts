import { NextRequest, NextResponse } from "next/server";
import { payoutRequestSchema } from "@/lib/validations";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { mailer } from "@/services/mailer";
import { formatCurrency } from "@/lib/utils";
import { checkRateLimit } from "@/services/rate-limit";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

    const service = createServiceClient();
    const { data: affiliate } = await service
      .from("affiliates")
      .select("id, paypal_email, iban, bic, crypto_wallet_address, preferred_payout_method")
      .eq("user_id", user.id)
      .single();

    if (!affiliate) return NextResponse.json({ error: "Kein Affiliate-Profil gefunden" }, { status: 404 });

    const { data: payouts } = await service
      .from("payouts")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("requested_at", { ascending: false });

    const { data: approvedCommissions } = await service
      .from("commissions")
      .select("id, commission_amount")
      .eq("affiliate_id", affiliate.id)
      .eq("status", "approved");

    const { data: pendingPayouts } = await service
      .from("payouts")
      .select("amount")
      .eq("affiliate_id", affiliate.id)
      .in("status", ["open", "approved"]);

    const availableBalance =
      (approvedCommissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0) -
      (pendingPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0);

    const { data: minSetting } = await service
      .from("settings")
      .select("value")
      .eq("key", "payout_minimum_amount")
      .single();

    return NextResponse.json({
      payouts: payouts ?? [],
      availableBalance: Math.max(0, availableBalance),
      minimumAmount: Number(minSetting?.value ?? 25),
      payoutDetails: {
        paypalEmail: affiliate.paypal_email,
        iban: affiliate.iban,
        bic: affiliate.bic,
        cryptoWalletAddress: affiliate.crypto_wallet_address,
        preferredMethod: affiliate.preferred_payout_method,
      },
    });
  } catch (err) {
    console.error("Payouts GET error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

    const rateLimitOk = await checkRateLimit(`payout-request:${user.id}`, 5, 60 * 60);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Zu viele Auszahlungsanfragen. Bitte versuche es später erneut." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = payoutRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validierung fehlgeschlagen", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount, method, destination } = parsed.data;
    const service = createServiceClient();

    const { data: affiliate } = await service
      .from("affiliates")
      .select("id, user_id, users(email, first_name)")
      .eq("user_id", user.id)
      .single();

    if (!affiliate) return NextResponse.json({ error: "Kein Affiliate-Profil gefunden" }, { status: 404 });

    const { data: minSetting } = await service
      .from("settings")
      .select("value")
      .eq("key", "payout_minimum_amount")
      .single();
    const minimumAmount = Number(minSetting?.value ?? 25);

    if (amount < minimumAmount) {
      return NextResponse.json(
        { error: `Der Mindestbetrag für Auszahlungen ist ${formatCurrency(minimumAmount)}.` },
        { status: 400 }
      );
    }

    const { data: approvedCommissions } = await service
      .from("commissions")
      .select("id, commission_amount")
      .eq("affiliate_id", affiliate.id)
      .eq("status", "approved");

    const { data: pendingPayouts } = await service
      .from("payouts")
      .select("amount")
      .eq("affiliate_id", affiliate.id)
      .in("status", ["open", "approved"]);

    const availableBalance =
      (approvedCommissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0) -
      (pendingPayouts?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0);

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: `Nicht genügend Guthaben verfügbar. Verfügbar: ${formatCurrency(availableBalance)}.` },
        { status: 400 }
      );
    }

    // Greedily reserve approved commissions up to the requested amount
    let remaining = amount;
    const reservedCommissionIds: string[] = [];
    for (const c of approvedCommissions ?? []) {
      if (remaining <= 0) break;
      reservedCommissionIds.push(c.id);
      remaining -= Number(c.commission_amount);
    }

    const { data: payout, error: payoutError } = await service
      .from("payouts")
      .insert({
        affiliate_id: affiliate.id,
        amount,
        method,
        destination,
        status: "open",
        commission_ids: reservedCommissionIds,
      })
      .select("id")
      .single();

    if (payoutError || !payout) {
      return NextResponse.json({ error: "Auszahlung konnte nicht erstellt werden." }, { status: 500 });
    }

    const affiliateUser = affiliate.users as any;
    if (affiliateUser) {
      await mailer.sendPayoutRequestedEmail(affiliateUser.email, affiliateUser.first_name, formatCurrency(amount));
    }

    await service.from("logs").insert({
      actor_id: user.id,
      action: "payout_requested",
      entity_type: "payout",
      entity_id: payout.id,
      metadata: { amount, method },
    });

    return NextResponse.json({ success: true, message: "Auszahlung erfolgreich beantragt.", payoutId: payout.id });
  } catch (err) {
    console.error("Payout request error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
