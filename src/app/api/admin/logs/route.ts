import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = 50;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await service
    .from("logs")
    .select("*, users(first_name, last_name, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: "Fehler beim Laden der Logs" }, { status: 500 });

  const logs = (data ?? []).map((l: any) => ({
    id: l.id,
    action: l.action,
    entityType: l.entity_type,
    entityId: l.entity_id,
    metadata: l.metadata,
    actorName: l.users ? `${l.users.first_name} ${l.users.last_name}` : "System",
    actorEmail: l.users?.email ?? null,
    createdAt: l.created_at,
  }));

  return NextResponse.json({ logs, pagination: { page, pageSize, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / pageSize) } });
}
