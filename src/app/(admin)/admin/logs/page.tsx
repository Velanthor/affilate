"use client";

import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

interface LogEntry {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: any;
  actorName: string;
  actorEmail: string | null;
  createdAt: string;
}

const actionLabels: Record<string, string> = {
  affiliate_registered: "Affiliate registriert",
  email_verified: "E-Mail bestätigt",
  login_success: "Login erfolgreich",
  password_reset_requested: "Passwort-Reset angefordert",
  password_reset_completed: "Passwort zurückgesetzt",
  payout_requested: "Auszahlung beantragt",
  payout_approve: "Auszahlung genehmigt",
  payout_reject: "Auszahlung abgelehnt",
  payout_mark_paid: "Auszahlung als bezahlt markiert",
  affiliate_updated_by_admin: "Affiliate durch Admin bearbeitet",
  commission_added_manually: "Provision manuell hinzugefügt",
  commission_removed_manually: "Provision manuell entfernt",
  conversion_tracked: "Conversion erfasst",
  settings_updated: "Einstellungen aktualisiert",
  "2fa_enabled": "2FA aktiviert",
  "2fa_disabled": "2FA deaktiviert",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/logs?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs ?? []);
        setTotalPages(data.pagination?.totalPages ?? 1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit-Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Chronologisches Protokoll aller sicherheitsrelevanten Aktionen.</p>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="divide-y divide-white/[0.04]">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-white/[0.02] animate-pulse" />)
          ) : logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">Keine Log-Einträge vorhanden.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                  <ScrollText className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-foreground">{actionLabels[log.action] ?? log.action}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(log.createdAt)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {log.actorName}
                    {log.actorEmail && ` (${log.actorEmail})`}
                    {log.entityType && ` · ${log.entityType}`}
                  </p>
                </div>
              </div>
            ))
          )}
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
    </div>
  );
}
