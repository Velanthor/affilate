import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import type { Database } from "@/types/database";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service, user } = admin;
  const body = await req.json();
  const { name, description, type, tier1Rate, tier2Rate, tier3Rate, fixedAmount, isLifetime, isDefault } = body;

  if (!name) return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });

  if (isDefault) {
    await service.from("commission_plans").update({ is_default: false }).eq("is_default", true);
  }

  const { data: plan, error } = await service
    .from("commission_plans")
    .insert({
      name,
      description: description || null,
      type: type || "percentage",
      tier_1_rate: tier1Rate ?? 20,
      tier_2_rate: tier2Rate ?? 5,
      tier_3_rate: tier3Rate ?? 2,
      fixed_amount: fixedAmount ?? null,
      is_lifetime: Boolean(isLifetime),
      is_default: Boolean(isDefault),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Erstellung fehlgeschlagen" }, { status: 500 });

  await service.from("logs").insert({
    actor_id: user.id,
    action: "commission_plan_created",
    entity_type: "commission_plan",
    entity_id: plan.id,
    metadata: { name },
  });

  return NextResponse.json({ success: true, plan });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service, user } = admin;
  const body = await req.json();
  const { id, isActive, isDefault } = body;

  if (!id) return NextResponse.json({ error: "ID erforderlich" }, { status: 400 });

  if (isDefault) {
    await service.from("commission_plans").update({ is_default: false }).eq("is_default", true);
  }

  const updates: Record<string, any> = {};
  if (typeof isActive === "boolean") updates.is_active = isActive;
  if (typeof isDefault === "boolean") updates.is_default = isDefault;

  const { error } = await service
    .from("commission_plans")
    .update(updates as Database["public"]["Tables"]["commission_plans"]["Update"])
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Aktualisierung fehlgeschlagen" }, { status: 500 });

  await service.from("logs").insert({
    actor_id: user.id,
    action: "commission_plan_updated",
    entity_type: "commission_plan",
    entity_id: id,
    metadata: updates,
  });

  return NextResponse.json({ success: true });
}
