import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;
  const { data: campaigns } = await service.from("campaigns").select("*").order("created_at", { ascending: false });

  // Attach click/conversion counts per campaign
  const campaignsWithStats = await Promise.all(
    (campaigns ?? []).map(async (c) => {
      const { count: clicks } = await service
        .from("clicks")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", c.id);
      const { count: conversions } = await service
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", c.id);
      return { ...c, clicks: clicks ?? 0, conversions: conversions ?? 0 };
    })
  );

  return NextResponse.json({ campaigns: campaignsWithStats });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service, user } = admin;
  const body = await req.json();
  const { name, description } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 });
  }

  const slug = slugify(name);
  const { data: campaign, error } = await service
    .from("campaigns")
    .insert({ name, slug, description: description || null, created_by: user.id })
    .select()
    .single();

  if (error) {
    const isDuplicate = error.message?.includes("duplicate");
    return NextResponse.json(
      { error: isDuplicate ? "Eine Kampagne mit diesem Namen existiert bereits." : "Erstellung fehlgeschlagen." },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, campaign });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;
  const body = await req.json();
  const { id, isActive } = body;

  if (!id) return NextResponse.json({ error: "ID erforderlich" }, { status: 400 });

  const { error } = await service.from("campaigns").update({ is_active: isActive }).eq("id", id);
  if (error) return NextResponse.json({ error: "Aktualisierung fehlgeschlagen" }, { status: 500 });

  return NextResponse.json({ success: true });
}
