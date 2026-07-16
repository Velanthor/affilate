import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateTotpSecret, buildOtpAuthUrl, verifyTotpCode } from "@/services/totp";

/** Step 1: generate a new secret + QR provisioning URL, not yet persisted as enabled. */
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const service = createServiceClient();
  const { data: profile } = await service.from("users").select("email").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });

  const secret = generateTotpSecret();
  const otpAuthUrl = buildOtpAuthUrl(profile.email, secret);

  // Store the pending (unverified) secret temporarily so /verify can confirm it
  await service.from("settings").upsert({
    key: `totp_pending:${user.id}`,
    value: { secret, createdAt: Date.now() },
  });

  return NextResponse.json({ secret, otpAuthUrl });
}

/** Step 2: verify the code the user entered from their authenticator app, then enable 2FA. */
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Code erforderlich" }, { status: 400 });

  const service = createServiceClient();
  const { data: pending } = await service
    .from("settings")
    .select("value")
    .eq("key", `totp_pending:${user.id}`)
    .single();

  if (!pending?.value?.secret) {
    return NextResponse.json({ error: "Keine ausstehende 2FA-Einrichtung gefunden." }, { status: 400 });
  }

  const valid = verifyTotpCode(pending.value.secret, code);
  if (!valid) {
    return NextResponse.json({ error: "Ungültiger Code." }, { status: 400 });
  }

  await service
    .from("users")
    .update({ two_factor_enabled: true, two_factor_secret: pending.value.secret })
    .eq("id", user.id);

  await service.from("settings").delete().eq("key", `totp_pending:${user.id}`);

  await service.from("logs").insert({
    actor_id: user.id,
    action: "2fa_enabled",
    entity_type: "user",
    entity_id: user.id,
  });

  return NextResponse.json({ success: true, message: "2FA erfolgreich aktiviert." });
}

/** Disable 2FA. */
export async function DELETE() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });

  const service = createServiceClient();
  await service
    .from("users")
    .update({ two_factor_enabled: false, two_factor_secret: null })
    .eq("id", user.id);

  await service.from("logs").insert({
    actor_id: user.id,
    action: "2fa_disabled",
    entity_type: "user",
    entity_id: user.id,
  });

  return NextResponse.json({ success: true, message: "2FA deaktiviert." });
}
