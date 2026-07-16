import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status");
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  let query = service
    .from("affiliates")
    .select(
      "id, referral_code, status, tier_level, country, total_clicks, total_conversions, total_revenue_generated, total_commission_earned, total_commission_paid, created_at, default_commission_rate, users(first_name, last_name, email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    // Search by referral code directly; name/email search requires a join filter
    const { data: matchingUsers } = await service
      .from("users")
      .select("id")
      .or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);

    const userIds = (matchingUsers ?? []).map((u) => u.id);

    if (userIds.length > 0) {
      query = query.or(`referral_code.ilike.%${search}%,user_id.in.(${userIds.join(",")})`);
    } else {
      query = query.ilike("referral_code", `%${search}%`);
    }
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error("Admin affiliates list error:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Affiliates" }, { status: 500 });
  }

  const affiliates = (data ?? []).map((a: any) => ({
    id: a.id,
    referralCode: a.referral_code,
    status: a.status,
    tierLevel: a.tier_level,
    country: a.country,
    firstName: a.users?.first_name ?? "—",
    lastName: a.users?.last_name ?? "",
    email: a.users?.email ?? "—",
    totalClicks: a.total_clicks,
    totalConversions: a.total_conversions,
    totalRevenue: Number(a.total_revenue_generated),
    totalCommissionEarned: Number(a.total_commission_earned),
    totalCommissionPaid: Number(a.total_commission_paid),
    defaultCommissionRate: Number(a.default_commission_rate),
    createdAt: a.created_at,
  }));

  return NextResponse.json({
    affiliates,
    pagination: { page, pageSize, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / pageSize) },
  });
}
