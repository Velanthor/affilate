import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import type { Database } from "@/types/database";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;
  const { data: affiliate } = await service
    .from("affiliates")
    .select("*, users(first_name, last_name, email, created_at)")
    .eq("id", params.id)
    .single();

  if (!affiliate) return NextResponse.json({ error: "Affiliate nicht gefunden" }, { status: 404 });

  const { data: commissions } = await service
    .from("commissions")
    .select("*")
    .eq("affiliate_id", params.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const { data: payouts } = await service
    .from("payouts")
    .select("*")
    .eq("affiliate_id", params.id)
    .order("requested_at", { ascending: false });

  return NextResponse.json({ affiliate, commissions, payouts });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service, user } = admin;
  const body = await req.json();

  const allowedFields = ["status", "default_commission_rate", "default_commission_type", "notes", "tier_level"];
  const updates: Record<string, any> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Keine gültigen Felder zum Aktualisieren" }, { status: 400 });
  }

  const { error } = await service
    .from("affiliates")
    .update(updates as Database["public"]["Tables"]["affiliates"]["Update"])
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: "Aktualisierung fehlgeschlagen" }, { status: 500 });
  }

  await service.from("logs").insert({
    actor_id: user.id,
    action: "affiliate_updated_by_admin",
    entity_type: "affiliate",
    entity_id: params.id,
    metadata: updates,
  });

  return NextResponse.json({ success: true, message: "Affiliate aktualisiert." });
}
