"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FileText, FileSpreadsheet, Pencil } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EditAffiliateModal } from "@/components/admin/edit-affiliate-modal";
import { formatCurrency, formatNumber, formatDate, cn } from "@/lib/utils";

interface AffiliateRow {
  id: string;
  referralCode: string;
  status: string;
  tierLevel: number;
  country: string | null;
  firstName: string;
  lastName: string;
  email: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  defaultCommissionRate: number;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  pending: "text-warning bg-warning/10 border-warning/20",
  active: "text-success bg-success/10 border-success/20",
  suspended: "text-warning bg-warning/10 border-warning/20",
  banned: "text-destructive bg-destructive/10 border-destructive/20",
};

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  active: "Aktiv",
  suspended: "Gesperrt",
  banned: "Gebannt",
};

export default function AdminAffiliatesPage() {
  const searchParams = useSearchParams();
  const [affiliates, setAffiliates] = useState<AffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<AffiliateRow | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: "20" });
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);

      const res = await fetch(`/api/admin/affiliates?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setAffiliates(data.affiliates);
        setTotalPages(data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    const timeout = setTimeout(loadData, 300);
    return () => clearTimeout(timeout);
  }, [loadData]);

  const handleExport = (format: "csv" | "xlsx") => {
    window.location.href = `/api/admin/export?type=affiliates&format=${format}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Affiliates</h1>
          <p className="text-sm text-muted-foreground mt-1">Alle registrierten Partner verwalten.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleExport("csv")}>
            <FileText className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={() => handleExport("xlsx")}>
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Name, E-Mail oder Referral-Code suchen..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 text-sm text-foreground"
        >
          <option value="all">Alle Status</option>
          <option value="pending">Ausstehend</option>
          <option value="active">Aktiv</option>
          <option value="suspended">Gesperrt</option>
          <option value="banned">Gebannt</option>
        </select>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Affiliate</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Klicks</th>
                <th className="px-5 py-3 font-medium">Conv.</th>
                <th className="px-5 py-3 font-medium">Umsatz</th>
                <th className="px-5 py-3 font-medium">Provision</th>
                <th className="px-5 py-3 font-medium">Registriert</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td colSpan={8} className="px-5 py-4">
                      <div className="h-5 bg-white/[0.04] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : affiliates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    Keine Affiliates gefunden.
                  </td>
                </tr>
              ) : (
                affiliates.map((a) => (
                  <tr key={a.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{a.firstName} {a.lastName}</div>
                      <div className="text-xs text-muted-foreground">{a.email} · {a.referralCode}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", statusStyles[a.status])}>
                        {statusLabels[a.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-foreground">{formatNumber(a.totalClicks)}</td>
                    <td className="px-5 py-3.5 text-foreground">{formatNumber(a.totalConversions)}</td>
                    <td className="px-5 py-3.5 text-foreground">{formatCurrency(a.totalRevenue)}</td>
                    <td className="px-5 py-3.5 text-foreground">{formatCurrency(a.totalCommissionEarned)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDate(a.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(a)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <span className="text-xs text-muted-foreground">Seite {page} von {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Zurück
              </Button>
              <Button size="sm" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Weiter
              </Button>
            </div>
          </div>
        )}
      </Card>

      {editing && (
        <EditAffiliateModal affiliate={editing} onClose={() => setEditing(null)} onSaved={loadData} />
      )}
    </div>
  );
}
