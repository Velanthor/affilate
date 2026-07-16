import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { verifyTotpCode } from "@/services/totp";
import { checkRateLimit } from "@/services/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validierung fehlgeschlagen", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, totpCode } = parsed.data;

    const rateLimitOk = await checkRateLimit(`login:${ip}:${email}`, 8, 60 * 15);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Zu viele Login-Versuche. Bitte versuche es in 15 Minuten erneut." },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      return NextResponse.json({ error: "E-Mail oder Passwort ist falsch." }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: profile } = await serviceClient
      .from("users")
      .select("email_verified, two_factor_enabled, two_factor_secret, first_name, role")
      .eq("id", signInData.user.id)
      .single();

    if (!profile?.email_verified) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Bitte bestätige zuerst deine E-Mail-Adresse.", code: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      );
    }

    if (profile.two_factor_enabled) {
      if (!totpCode) {
        return NextResponse.json(
          { error: "2FA-Code erforderlich.", code: "TOTP_REQUIRED" },
          { status: 401 }
        );
      }
      const valid = profile.two_factor_secret
        ? verifyTotpCode(profile.two_factor_secret, totpCode)
        : false;

      if (!valid) {
        await supabase.auth.signOut();
        return NextResponse.json({ error: "Ungültiger 2FA-Code." }, { status: 401 });
      }
    }

    await serviceClient.from("logs").insert({
      actor_id: signInData.user.id,
      action: "login_success",
      entity_type: "user",
      entity_id: signInData.user.id,
    });

    return NextResponse.json({
      success: true,
      user: { id: signInData.user.id, email, role: profile.role, firstName: profile.first_name },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
