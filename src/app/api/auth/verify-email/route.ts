import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { mailer } from "@/services/mailer";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Ungültiger Token" }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const supabase = createServiceClient();

    // Find matching verification record. Settings keys are namespaced `email_verify:<userId>`.
    const { data: settingsRows } = await supabase
      .from("settings")
      .select("key, value")
      .like("key", "email_verify:%");

    const match = settingsRows?.find(
      (row: any) => row.value?.tokenHash === tokenHash && row.value?.expiresAt > Date.now()
    );

    if (!match) {
      return NextResponse.json(
        { error: "Der Link ist ungültig oder abgelaufen." },
        { status: 400 }
      );
    }

    const userId = match.key.replace("email_verify:", "");

    const { error: updateError } = await supabase
      .from("users")
      .update({ email_verified: true })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json({ error: "Bestätigung fehlgeschlagen." }, { status: 500 });
    }

    await supabase
      .from("affiliates")
      .update({ status: "active" })
      .eq("user_id", userId)
      .eq("status", "pending");

    await supabase.from("settings").delete().eq("key", match.key);

    const { data: user } = await supabase
      .from("users")
      .select("email, first_name")
      .eq("id", userId)
      .single();

    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("referral_code")
      .eq("user_id", userId)
      .single();

    if (user && affiliate) {
      await mailer.sendWelcomeEmail(user.email, user.first_name, affiliate.referral_code);
    }

    await supabase.from("logs").insert({
      actor_id: userId,
      action: "email_verified",
      entity_type: "user",
      entity_id: userId,
    });

    return NextResponse.json({ success: true, message: "E-Mail erfolgreich bestätigt." });
  } catch (err) {
    console.error("Email verification error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
