import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { forgotPasswordSchema } from "@/lib/validations";
import { createServiceClient } from "@/lib/supabase/server";
import { mailer } from "@/services/mailer";
import { checkRateLimit } from "@/services/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
    }

    const { email } = parsed.data;

    const rateLimitOk = await checkRateLimit(`forgot-password:${ip}`, 5, 60 * 15);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte versuche es später erneut." },
        { status: 429 }
      );
    }

    const supabase = createServiceClient();
    const { data: user } = await supabase
      .from("users")
      .select("id, first_name")
      .eq("email", email)
      .single();

    // Always respond with success to avoid leaking which emails are registered
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      await supabase.from("settings").upsert({
        key: `password_reset:${user.id}`,
        value: { tokenHash, expiresAt: Date.now() + 1000 * 60 * 60 },
      });

      await mailer.sendPasswordResetEmail(email, user.first_name, token);

      await supabase.from("logs").insert({
        actor_id: user.id,
        action: "password_reset_requested",
        entity_type: "user",
        entity_id: user.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Falls ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
