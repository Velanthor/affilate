"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Check, X, CircleDollarSign, FileText, FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayoutStatusBadge } from "@/components/dashboard/payout-status-badge";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";

interface Payout {
  id: string;
  amount: number;
  method: string;
  destination: string;
  status: string;
  requestedAt: string;
  paidAt: string | null;
  rejectionReason: string | null;
  affiliateName: string;
  affiliateEmail: string;
  referralCode: string;
}

const methodLabels: Record<string, string> = { paypal: "PayPal", sepa: "SEPA", crypto: "Krypto" };

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("open");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts?status=${statusFilter}`);
      const data = await res.json();
      if (res.ok) setPayouts(data.payouts);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (payoutId: string, action: "approve" | "reject" | "mark_paid") => {
    let rejectionReason: string | undefined;
    let transactionReference: string | undefined;

    if (action === "reject") {
      rejectionReason = window.prompt("Grund für die Ablehnung:") ?? undefined;
      if (!rejectionReason) return;
    }
    if (action === "mark_paid") {
      transactionReference = window.prompt("Transaktionsreferenz (optional):") ?? undefined;
    }

    setProcessingId(payoutId);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, action, rejectionReason, transactionReference }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Aktion fehlgeschlagen");
        return;
      }
      toast.success("Auszahlung aktualisiert!");
      loadData();
    } finally {
      setProcessingId(null);
    }
  };

  const handleExport = (format: "csv" | "xlsx") => {
    window.location.href = `/api/admin/export?type=payouts&format=${format}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auszahlungen</h1>
          <p className="text-sm text-muted-foreground mt-1">Anfragen prüfen und verwalten.</p>
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

      <div className="glass rounded-xl p-1 flex gap-1 w-fit">
        {[
          { value: "open", label: "Offen" },
          { value: "approved", label: "Genehmigt" },
          { value: "paid", label: "Bezahlt" },
          { value: "rejected", label: "Abgelehnt" },
          { value: "all", label: "Alle" },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              statusFilter === opt.value ? "bg-primary-500 text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] text-left text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">Affiliate</th>
                <th className="px-5 py-3 font-medium">Betrag</th>
                <th className="px-5 py-3 font-medium">Methode</th>
                <th className="px-5 py-3 font-medium">Ziel</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Beantragt</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-5 bg-white/[0.04] rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    Keine Auszahlungen in dieser Kategorie.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{p.affiliateName}</div>
                      <div className="text-xs text-muted-foreground">{p.affiliateEmail}</div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-foreground">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{methodLabels[p.method]}</td>
                    <td className="px-5 py-3.5 text-muted-foreground max-w-[160px] truncate">{p.destination}</td>
                    <td className="px-5 py-3.5">
                      <PayoutStatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{formatDateTime(p.requestedAt)}</td>
                    <td className="px-5 py-3.5">
                      {p.status === "open" && (
                        <div className="flex gap-1.5 justify-end">
                          <Button size="icon" variant="secondary" disabled={processingId === p.id} onClick={() => handleAction(p.id, "approve")}>
                            <Check className="h-3.5 w-3.5 text-success" />
                          </Button>
                          <Button size="icon" variant="secondary" disabled={processingId === p.id} onClick={() => handleAction(p.id, "reject")}>
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      )}
                      {p.status === "approved" && (
                        <Button size="sm" variant="secondary" disabled={processingId === p.id} onClick={() => handleAction(p.id, "mark_paid")}>
                          <CircleDollarSign className="h-3.5 w-3.5" /> Als bezahlt markieren
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
