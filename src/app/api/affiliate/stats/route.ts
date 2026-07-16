import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

function getRangeStart(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "365d":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") ?? "30d";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const service = createServiceClient();
    const { data: affiliate } = await service
      .from("affiliates")
      .select(
        "id, referral_code, tier_level, total_clicks, total_conversions, total_revenue_generated, total_commission_earned, total_commission_paid"
      )
      .eq("user_id", user.id)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: "Kein Affiliate-Profil gefunden" }, { status: 404 });
    }

    let rangeStart: Date | null = from ? new Date(from) : getRangeStart(range);
    const rangeEnd = to ? new Date(to) : new Date();

    let clicksQuery = service
      .from("clicks")
      .select("id, created_at, converted, country_code, device_type, browser, campaign_id")
      .eq("affiliate_id", affiliate.id);
    if (rangeStart) clicksQuery = clicksQuery.gte("created_at", rangeStart.toISOString());
    clicksQuery = clicksQuery.lte("created_at", rangeEnd.toISOString());
    const { data: clicks } = await clicksQuery;

    let commissionsQuery = service
      .from("commissions")
      .select("id, created_at, commission_amount, status, tier_level")
      .eq("affiliate_id", affiliate.id);
    if (rangeStart) commissionsQuery = commissionsQuery.gte("created_at", rangeStart.toISOString());
    commissionsQuery = commissionsQuery.lte("created_at", rangeEnd.toISOString());
    const { data: commissions } = await commissionsQuery;

    let referralsQuery = service
      .from("referrals")
      .select("id, created_at, order_value")
      .eq("affiliate_id", affiliate.id);
    if (rangeStart) referralsQuery = referralsQuery.gte("created_at", rangeStart.toISOString());
    referralsQuery = referralsQuery.lte("created_at", rangeEnd.toISOString());
    const { data: referrals } = await referralsQuery;

    const totalClicksInRange = clicks?.length ?? 0;
    const totalConversionsInRange = referrals?.length ?? 0;
    const conversionRate = totalClicksInRange > 0 ? (totalConversionsInRange / totalClicksInRange) * 100 : 0;
    const revenueInRange = referrals?.reduce((sum, r) => sum + Number(r.order_value), 0) ?? 0;
    const commissionInRange = commissions?.reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0;
    const pendingCommission =
      commissions?.filter((c) => c.status === "pending").reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0;
    const paidCommission =
      commissions?.filter((c) => c.status === "paid").reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0;

    // Time series (daily buckets)
    const seriesMap = new Map<string, { clicks: number; conversions: number; commission: number; revenue: number }>();
    for (const click of clicks ?? []) {
      const day = click.created_at.slice(0, 10);
      const entry = seriesMap.get(day) ?? { clicks: 0, conversions: 0, commission: 0, revenue: 0 };
      entry.clicks += 1;
      seriesMap.set(day, entry);
    }
    for (const referral of referrals ?? []) {
      const day = referral.created_at.slice(0, 10);
      const entry = seriesMap.get(day) ?? { clicks: 0, conversions: 0, commission: 0, revenue: 0 };
      entry.conversions += 1;
      entry.revenue += Number(referral.order_value);
      seriesMap.set(day, entry);
    }
    for (const commission of commissions ?? []) {
      const day = commission.created_at.slice(0, 10);
      const entry = seriesMap.get(day) ?? { clicks: 0, conversions: 0, commission: 0, revenue: 0 };
      entry.commission += Number(commission.commission_amount);
      seriesMap.set(day, entry);
    }
    const series = Array.from(seriesMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({ date, ...values }));

    // Breakdown helpers
    const countBy = (items: any[] | null, key: string) => {
      const map = new Map<string, number>();
      for (const item of items ?? []) {
        const value = item[key] ?? "Unbekannt";
        map.set(value, (map.get(value) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
    };

    const topCountries = countBy(clicks, "country_code");
    const topDevices = countBy(clicks, "device_type");
    const topBrowsers = countBy(clicks, "browser");

    // Today / week / month quick numbers (independent of the selected range)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: allCommissions } = await service
      .from("commissions")
      .select("commission_amount, created_at, status")
      .eq("affiliate_id", affiliate.id);

    const sumSince = (since: string) =>
      allCommissions
        ?.filter((c) => c.created_at >= since && c.status !== "rejected")
        .reduce((sum, c) => sum + Number(c.commission_amount), 0) ?? 0;

    return NextResponse.json({
      affiliate: {
        referralCode: affiliate.referral_code,
        tierLevel: affiliate.tier_level,
      },
      totals: {
        totalRevenue: Number(affiliate.total_revenue_generated),
        totalCommissionEarned: Number(affiliate.total_commission_earned),
        totalCommissionPaid: Number(affiliate.total_commission_paid),
        pendingCommission: Number(affiliate.total_commission_earned) - Number(affiliate.total_commission_paid),
        totalClicks: affiliate.total_clicks,
        totalConversions: affiliate.total_conversions,
      },
      range: {
        clicks: totalClicksInRange,
        conversions: totalConversionsInRange,
        conversionRate,
        revenue: revenueInRange,
        commission: commissionInRange,
        pendingCommission,
        paidCommission,
      },
      quick: {
        today: sumSince(todayStart),
        thisWeek: sumSince(weekStart),
        thisMonth: sumSince(monthStart),
      },
      series,
      breakdown: { topCountries, topDevices, topBrowsers },
    });
  } catch (err) {
    console.error("Stats error:", err);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
