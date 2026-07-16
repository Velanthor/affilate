import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Nicht autorisiert" }, { status: 403 });

  const { service } = admin;

  const [{ count: totalAffiliates }, { count: activeAffiliates }, { count: pendingAffiliates }] = await Promise.all([
    service.from("affiliates").select("*", { count: "exact", head: true }),
    service.from("affiliates").select("*", { count: "exact", head: true }).eq("status", "active"),
    service.from("affiliates").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const { data: affiliatesAgg } = await service
    .from("affiliates")
    .select("total_clicks, total_conversions, total_revenue_generated, total_commission_earned, total_commission_paid");

  const totals = (affiliatesAgg ?? []).reduce(
    (acc, a) => ({
      clicks: acc.clicks + (a.total_clicks ?? 0),
      conversions: acc.conversions + (a.total_conversions ?? 0),
      revenue: acc.revenue + Number(a.total_revenue_generated ?? 0),
      commissionEarned: acc.commissionEarned + Number(a.total_commission_earned ?? 0),
      commissionPaid: acc.commissionPaid + Number(a.total_commission_paid ?? 0),
    }),
    { clicks: 0, conversions: 0, revenue: 0, commissionEarned: 0, commissionPaid: 0 }
  );

  const { count: openPayoutsCount } = await service
    .from("payouts")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  const { data: openPayoutsSum } = await service.from("payouts").select("amount").eq("status", "open");
  const openPayoutsAmount = (openPayoutsSum ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  // Top affiliates by revenue
  const { data: topAffiliates } = await service
    .from("affiliates")
    .select("id, referral_code, total_revenue_generated, total_commission_earned, total_conversions, users(first_name, last_name, email)")
    .order("total_revenue_generated", { ascending: false })
    .limit(10);

  // Top countries (from clicks, last 90 days)
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentClicks } = await service.from("clicks").select("country_code").gte("created_at", since);
  const countryMap = new Map<string, number>();
  for (const c of recentClicks ?? []) {
    const key = c.country_code ?? "Unbekannt";
    countryMap.set(key, (countryMap.get(key) ?? 0) + 1);
  }
  const topCountries = Array.from(countryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Time series for the last 30 days (clicks + conversions + revenue)
  const seriesSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: seriesClicks }, { data: seriesReferrals }] = await Promise.all([
    service.from("clicks").select("created_at").gte("created_at", seriesSince),
    service.from("referrals").select("created_at, order_value").gte("created_at", seriesSince),
  ]);

  const seriesMap = new Map<string, { clicks: number; conversions: number; revenue: number }>();
  for (const c of seriesClicks ?? []) {
    const day = c.created_at.slice(0, 10);
    const entry = seriesMap.get(day) ?? { clicks: 0, conversions: 0, revenue: 0 };
    entry.clicks += 1;
    seriesMap.set(day, entry);
  }
  for (const r of seriesReferrals ?? []) {
    const day = r.created_at.slice(0, 10);
    const entry = seriesMap.get(day) ?? { clicks: 0, conversions: 0, revenue: 0 };
    entry.conversions += 1;
    entry.revenue += Number(r.order_value);
    seriesMap.set(day, entry);
  }
  const series = Array.from(seriesMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({ date, ...values }));

  return NextResponse.json({
    counts: {
      totalAffiliates: totalAffiliates ?? 0,
      activeAffiliates: activeAffiliates ?? 0,
      pendingAffiliates: pendingAffiliates ?? 0,
      openPayoutsCount: openPayoutsCount ?? 0,
    },
    totals,
    openPayoutsAmount,
    topAffiliates: (topAffiliates ?? []).map((a: any) => ({
      id: a.id,
      referralCode: a.referral_code,
      name: a.users ? `${a.users.first_name} ${a.users.last_name}` : "—",
      email: a.users?.email ?? "—",
      revenue: Number(a.total_revenue_generated),
      commission: Number(a.total_commission_earned),
      conversions: a.total_conversions,
    })),
    topCountries,
    series,
  });
}
