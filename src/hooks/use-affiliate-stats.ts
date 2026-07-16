"use client";

import { useEffect, useState, useCallback } from "react";

export interface AffiliateStats {
  affiliate: { referralCode: string; tierLevel: number };
  totals: {
    totalRevenue: number;
    totalCommissionEarned: number;
    totalCommissionPaid: number;
    pendingCommission: number;
    totalClicks: number;
    totalConversions: number;
  };
  range: {
    clicks: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    commission: number;
    pendingCommission: number;
    paidCommission: number;
  };
  quick: { today: number; thisWeek: number; thisMonth: number };
  series: { date: string; clicks: number; conversions: number; commission: number; revenue: number }[];
  breakdown: {
    topCountries: { name: string; count: number }[];
    topDevices: { name: string; count: number }[];
    topBrowsers: { name: string; count: number }[];
  };
}

export type DateRange = "today" | "7d" | "30d" | "365d" | "custom";

export function useAffiliateStats(range: DateRange, customFrom?: string, customTo?: string) {
  const [data, setData] = useState<AffiliateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ range });
      if (range === "custom" && customFrom && customTo) {
        params.set("from", customFrom);
        params.set("to", customTo);
      }
      const res = await fetch(`/api/affiliate/stats?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Fehler beim Laden der Statistiken");
      setData(json);
    } catch (err: any) {
      setError(err.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }, [range, customFrom, customTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
