import { NextRequest, NextResponse } from "next/server";
import { affiliateSettingsSchema } from "@/lib/validations";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateTotpSecret, buildOtpAuthUrl, verifyTotpCode } from "@/services/totp";

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service
    .from("users")
    .select("first_name, last_name, email, two_factor_enabled")
    .eq("id", user.id)
    .single();

  const { data: affiliate } = await service
    .from("affiliates")
    .select("paypal_email, iban, bic, crypto_wallet_address, tax_id, preferred_payout_method, referral_code, country")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ profile, affiliate });
}

export async function PUT(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const body = await req.json();
  const parsed = affiliateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const service = createServiceClient();

  await service
    .from("users")
    .update({ first_name: data.firstName, last_name: data.lastName })
    .eq("id", user.id);

  await service
    .from("affiliates")
    .update({
      paypal_email: data.paypalEmail || null,
      iban: data.iban || null,
      bic: data.bic || null,
      crypto_wallet_address: data.cryptoWalletAddress || null,
      tax_id: data.taxId || null,
      preferred_payout_method: data.preferredPayoutMethod,
    })
    .eq("user_id", user.id);

  await service.from("logs").insert({
    actor_id: user.id,
    action: "settings_updated",
    entity_type: "affiliate",
    entity_id: user.id,
  });

  return NextResponse.json({ success: true, message: "Einstellungen gespeichert." });
}
