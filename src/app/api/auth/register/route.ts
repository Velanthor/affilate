import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { registerSchema } from "@/lib/validations";
import { createServiceClient } from "@/lib/supabase/server";
import { generateReferralCode } from "@/lib/utils";
import { mailer } from "@/services/mailer";
import { verifyCaptcha } from "@/services/captcha";
import { checkRateLimit } from "@/services/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    const rateLimitOk = await checkRateLimit(`register:${ip}`, 5, 60 * 15);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Zu viele Registrierungsversuche. Bitte versuche es später erneut." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validierung fehlgeschlagen", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const captchaValid = await verifyCaptcha(data.captchaToken);
    if (!captchaValid) {
      return NextResponse.json({ error: "Captcha-Prüfung fehlgeschlagen" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Create the auth user (email confirmation handled by our own token, not Supabase's)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: false,
      user_metadata: { first_name: data.firstName, last_name: data.lastName },
    });

    if (authError || !authUser.user) {
      const isDuplicate = authError?.message?.toLowerCase().includes("already");
      return NextResponse.json(
        { error: isDuplicate ? "Diese E-Mail ist bereits registriert." : "Registrierung fehlgeschlagen." },
        { status: 400 }
      );
    }

    const referralCode = generateReferralCode(data.firstName, data.lastName);

    // Resolve parent affiliate for multi-tier chain, if a referral code was used
    let parentAffiliateId: string | null = null;
    let tierLevel = 1;

    if (data.referralCode) {
      const { data: parentAffiliate } = await supabase
        .from("affiliates")
        .select("id, tier_level")
        .eq("referral_code", data.referralCode)
        .single();

      if (parentAffiliate) {
        parentAffiliateId = parentAffiliate.id;
        tierLevel = Math.min((parentAffiliate.tier_level ?? 1) + 1, 5);
      }
    }

    const { data: defaultPlan } = await supabase
      .from("commission_plans")
      .select("id")
      .eq("is_default", true)
      .single();

    const { error: affiliateError } = await supabase.from("affiliates").insert({
      user_id: authUser.user.id,
      referral_code: referralCode,
      status: "pending",
      parent_affiliate_id: parentAffiliateId,
      tier_level: tierLevel,
      country: data.country,
      paypal_email: data.paypalEmail || null,
      iban: data.iban || null,
      bic: data.bic || null,
      tax_id: data.taxId || null,
      commission_plan_id: defaultPlan?.id ?? null,
    });

    if (affiliateError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json({ error: "Affiliate-Profil konnte nicht erstellt werden." }, { status: 500 });
    }

    // Store our own verification token (separate from Supabase's, per requirements)
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");

    await supabase.from("settings").upsert({
      key: `email_verify:${authUser.user.id}`,
      value: { tokenHash, expiresAt: Date.now() + 1000 * 60 * 60 * 24 },
    });

    await mailer.sendVerificationEmail(data.email, data.firstName, verificationToken);

    await supabase.from("logs").insert({
      action: "affiliate_registered",
      entity_type: "affiliate",
      entity_id: authUser.user.id,
      metadata: { email: data.email, referralCode: data.referralCode || null },
    });

    const supportEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (supportEmail) {
      await mailer.sendAdminNewAffiliateNotification(
        supportEmail,
        `${data.firstName} ${data.lastName}`,
        data.email
      );
    }

    return NextResponse.json({
      success: true,
      message: "Registrierung erfolgreich. Bitte bestätige deine E-Mail-Adresse.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
