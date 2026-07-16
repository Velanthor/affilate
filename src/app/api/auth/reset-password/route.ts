import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { resetPasswordSchema } from "@/lib/validations";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validierung fehlgeschlagen", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { password, token } = parsed.data;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const supabase = createServiceClient();
    const { data: settingsRows } = await supabase
      .from("settings")
      .select("key, value")
      .like("key", "password_reset:%");

    const match = settingsRows?.find(
      (row: any) => row.value?.tokenHash === tokenHash && row.value?.expiresAt > Date.now()
    );

    if (!match) {
      return NextResponse.json(
        { error: "Der Link ist ungültig oder abgelaufen." },
        { status: 400 }
      );
    }

    const userId = match.key.replace("password_reset:", "");

    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password,
    });

    if (updateError) {
      return NextResponse.json({ error: "Passwort konnte nicht geändert werden." }, { status: 500 });
    }

    await supabase.from("settings").delete().eq("key", match.key);

    await supabase.from("logs").insert({
      actor_id: userId,
      action: "password_reset_completed",
      entity_type: "user",
      entity_id: userId,
    });

    return NextResponse.json({ success: true, message: "Passwort erfolgreich geändert." });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
