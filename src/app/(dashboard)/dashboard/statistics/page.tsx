"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TimeSeriesChart } from "@/components/dashboard/time-series-chart";
import { BreakdownBarChart } from "@/components/dashboard/breakdown-bar-chart";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAffiliateStats, type DateRange } from "@/hooks/use-affiliate-stats";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { MousePointerClick, Target, Percent, Wallet } from "lucide-react";

export default function StatisticsPage() {
  const [range, setRange] = useState<DateRange>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const { data, loading } = useAffiliateStats(range, customFrom, customTo);

  const handleExport = (format: "csv" | "xlsx") => {
    window.location.href = `/api/affiliate/export?format=${format}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistiken</h1>
          <p className="text-sm text-muted-foreground mt-1">Detaillierte Auswertung deiner Performance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleExport("csv")}>
              <FileText className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleExport("xlsx")}>
              <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Klicks" value={formatNumber(data?.range.clicks ?? 0)} icon={MousePointerClick} loading={loading} accent="primary" />
        <StatCard label="Conversions" value={formatNumber(data?.range.conversions ?? 0)} icon={Target} loading={loading} accent="emerald" />
        <StatCard label="Conversion-Rate" value={formatPercent(data?.range.conversionRate ?? 0)} icon={Percent} loading={loading} accent="cyan" />
        <StatCard label="Provision" value={formatCurrency(data?.range.commission ?? 0)} icon={Wallet} loading={loading} accent="violet" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Klicks &amp; Conversions</CardTitle>
        </CardHeader>
        <TimeSeriesChart
          data={data?.series ?? []}
          series={[
            { key: "clicks", label: "Klicks", color: "#3d5cff" },
            { key: "conversions", label: "Conversions", color: "#22d3ee" },
          ]}
        />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provision &amp; Umsatz</CardTitle>
        </CardHeader>
        <TimeSeriesChart
          data={data?.series ?? []}
          series={[
            { key: "revenue", label: "Umsatz (€)", color: "#a855f7" },
            { key: "commission", label: "Provision (€)", color: "#10b981" },
          ]}
        />
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Länder</CardTitle>
          </CardHeader>
          <BreakdownBarChart data={data?.breakdown.topCountries ?? []} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Geräte</CardTitle>
          </CardHeader>
          <BreakdownBarChart data={data?.breakdown.topDevices ?? []} />
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Browser</CardTitle>
          </CardHeader>
          <BreakdownBarChart data={data?.breakdown.topBrowsers ?? []} />
        </Card>
      </div>
    </div>
  );
}
