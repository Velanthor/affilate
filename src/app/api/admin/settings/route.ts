import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

const MANAGED_KEYS = ["payout_minimum_amount", "cookie_duration_days", "platform_name", "support_email"];

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;
  const { data } = await service.from("settings").select("key, value").in("key", MANAGED_KEYS);

  const settings: Record<string, any> = {};
  for (const row of data ?? []) settings[row.key] = row.value;

  const { data: plans } = await service.from("commission_plans").select("*").order("created_at");

  return NextResponse.json({ settings, commissionPlans: plans ?? [] });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service, user } = admin;
  const body = await req.json();

  const updates = Object.entries(body)
    .filter(([key]) => MANAGED_KEYS.includes(key))
    .map(([key, value]) => ({ key, value, updated_by: user.id, updated_at: new Date().toISOString() }));

  if (updates.length === 0) {
    return NextResponse.json({ error: "Keine gültigen Einstellungen übergeben" }, { status: 400 });
  }

  const { error } = await service.from("settings").upsert(updates);
  if (error) return NextResponse.json({ error: "Speichern fehlgeschlagen" }, { status: 500 });

  await service.from("logs").insert({
    actor_id: user.id,
    action: "settings_updated",
    entity_type: "settings",
    metadata: body,
  });

  return NextResponse.json({ success: true, message: "Einstellungen gespeichert." });
}
