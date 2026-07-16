"use client";

import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  MousePointerClick,
  Target,
  Percent,
  Clock,
  CalendarDays,
  CalendarRange,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReferralLinkCard } from "@/components/dashboard/referral-link-card";
import { TimeSeriesChart } from "@/components/dashboard/time-series-chart";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAffiliateStats, type DateRange } from "@/hooks/use-affiliate-stats";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const { data, loading } = useAffiliateStats(range, customFrom, customTo);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Übersicht</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Willkommen zurück — hier ist deine aktuelle Performance.
          </p>
        </div>
        <DateRangeFilter
          value={range}
          onChange={setRange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomChange={(from, to) => {
            setCustomFrom(from);
            setCustomTo(to);
          }}
        />
      </div>

      {/* Quick earnings row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Einnahmen heute"
          value={formatCurrency(data?.quick.today ?? 0)}
          icon={Clock}
          loading={loading}
          accent="cyan"
        />
        <StatCard
          label="Diese Woche"
          value={formatCurrency(data?.quick.thisWeek ?? 0)}
          icon={CalendarDays}
          loading={loading}
          accent="primary"
        />
        <StatCard
          label="Dieser Monat"
          value={formatCurrency(data?.quick.thisMonth ?? 0)}
          icon={CalendarRange}
          loading={loading}
          accent="violet"
        />
      </div>

      {/* Main widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Gesamtumsatz"
          value={formatCurrency(data?.totals.totalRevenue ?? 0)}
          icon={TrendingUp}
          loading={loading}
          accent="emerald"
        />
        <StatCard
          label="Provisionen gesamt"
          value={formatCurrency(data?.totals.totalCommissionEarned ?? 0)}
          icon={Wallet}
          loading={loading}
          accent="primary"
        />
        <StatCard
          label="Ausstehende Provision"
          value={formatCurrency(data?.totals.pendingCommission ?? 0)}
          icon={Clock}
          loading={loading}
          accent="cyan"
        />
        <StatCard
          label="Ausgezahlte Provision"
          value={formatCurrency(data?.totals.totalCommissionPaid ?? 0)}
          icon={Wallet}
          loading={loading}
          accent="violet"
        />
        <StatCard
          label="Klicks (Zeitraum)"
          value={formatNumber(data?.range.clicks ?? 0)}
          icon={MousePointerClick}
          loading={loading}
          accent="primary"
        />
        <StatCard
          label="Conversions (Zeitraum)"
          value={formatNumber(data?.range.conversions ?? 0)}
          icon={Target}
          loading={loading}
          accent="emerald"
        />
        <StatCard
          label="Conversion-Rate"
          value={formatPercent(data?.range.conversionRate ?? 0)}
          icon={Percent}
          loading={loading}
          accent="cyan"
        />
        <StatCard
          label="Umsatz (Zeitraum)"
          value={formatCurrency(data?.range.revenue ?? 0)}
          icon={TrendingUp}
          loading={loading}
          accent="violet"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance über Zeit</CardTitle>
        </CardHeader>
        <TimeSeriesChart
          data={data?.series ?? []}
          series={[
            { key: "clicks", label: "Klicks", color: "#3d5cff" },
            { key: "conversions", label: "Conversions", color: "#22d3ee" },
          ]}
        />
      </Card>

      {data?.affiliate.referralCode && (
        <ReferralLinkCard referralCode={data.affiliate.referralCode} />
      )}
    </div>
  );
}
