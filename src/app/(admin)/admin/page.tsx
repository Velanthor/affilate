"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, TrendingUp, Wallet, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TimeSeriesChart } from "@/components/dashboard/time-series-chart";
import { BreakdownBarChart } from "@/components/dashboard/breakdown-bar-chart";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface AdminStats {
  counts: { totalAffiliates: number; activeAffiliates: number; pendingAffiliates: number; openPayoutsCount: number };
  totals: { clicks: number; conversions: number; revenue: number; commissionEarned: number; commissionPaid: number };
  openPayoutsAmount: number;
  topAffiliates: { id: string; referralCode: string; name: string; email: string; revenue: number; commission: number; conversions: number }[];
  topCountries: { name: string; count: number }[];
  series: { date: string; clicks: number; conversions: number; revenue: number }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin-Übersicht</h1>
        <p className="text-sm text-muted-foreground mt-1">Plattformweite Kennzahlen auf einen Blick.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Affiliates gesamt" value={formatNumber(data?.counts.totalAffiliates ?? 0)} icon={Users} loading={loading} accent="primary" />
        <StatCard label="Aktive Affiliates" value={formatNumber(data?.counts.activeAffiliates ?? 0)} icon={Users} loading={loading} accent="emerald" />
        <StatCard label="Offene Auszahlungen" value={formatCurrency(data?.openPayoutsAmount ?? 0)} icon={Wallet} loading={loading} accent="cyan" />
        <StatCard label="Wartend auf Prüfung" value={formatNumber(data?.counts.pendingAffiliates ?? 0)} icon={Clock} loading={loading} accent="violet" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Gesamtumsatz (alle Affiliates)" value={formatCurrency(data?.totals.revenue ?? 0)} icon={TrendingUp} loading={loading} accent="emerald" />
        <StatCard label="Provisionen ausgezahlt" value={formatCurrency(data?.totals.commissionPaid ?? 0)} icon={Wallet} loading={loading} accent="primary" />
        <StatCard label="Klicks gesamt" value={formatNumber(data?.totals.clicks ?? 0)} icon={TrendingUp} loading={loading} accent="cyan" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plattform-Performance (30 Tage)</CardTitle>
        </CardHeader>
        <TimeSeriesChart
          data={data?.series ?? []}
          series={[
            { key: "clicks", label: "Klicks", color: "#3d5cff" },
            { key: "conversions", label: "Conversions", color: "#22d3ee" },
            { key: "revenue", label: "Umsatz (€)", color: "#a855f7" },
          ]}
        />
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top-Affiliates</CardTitle>
          </CardHeader>
          <div className="space-y-1">
            {data?.topAffiliates.map((a, i) => (
              <Link
                key={a.id}
                href={`/admin/affiliates?search=${a.referralCode}`}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                  <div>
                    <div className="text-sm font-medium text-foreground">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">{formatCurrency(a.revenue)}</div>
                  <div className="text-xs text-muted-foreground">{a.conversions} Conversions</div>
                </div>
              </Link>
            ))}
            {(!data || data.topAffiliates.length === 0) && !loading && (
              <p className="text-sm text-muted-foreground text-center py-6">Noch keine Daten.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top-Länder (90 Tage)</CardTitle>
          </CardHeader>
          <BreakdownBarChart data={data?.topCountries ?? []} height={280} />
        </Card>
      </div>
    </div>
  );
}
