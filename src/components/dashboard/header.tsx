"use client";

import { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { getInitials, cn } from "@/lib/utils";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ausstehend", color: "text-warning bg-warning/10 border-warning/20" },
  active: { label: "Aktiv", color: "text-success bg-success/10 border-success/20" },
  suspended: { label: "Pausiert", color: "text-warning bg-warning/10 border-warning/20" },
  banned: { label: "Gesperrt", color: "text-destructive bg-destructive/10 border-destructive/20" },
};

export function DashboardHeader({
  firstName,
  lastName,
  email,
  avatarUrl,
  affiliateStatus,
}: {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  affiliateStatus: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = statusLabels[affiliateStatus] ?? statusLabels.pending;

  return (
    <header className="h-16 glass border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
      <div className="lg:hidden w-8" />

      <div className="hidden sm:flex items-center gap-3">
        <span
          className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", status.color)}
        >
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <button className="relative p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/[0.05] transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center text-xs font-bold text-white shrink-0">
              {getInitials(firstName, lastName)}
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground">
              {firstName} {lastName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 glass-card !p-2 z-20">
                <div className="px-3 py-2 border-b border-white/[0.06] mb-1">
                  <div className="text-sm font-medium text-foreground">{firstName} {lastName}</div>
                  <div className="text-xs text-muted-foreground truncate">{email}</div>
                </div>
                <a href="/dashboard/settings" className="block px-3 py-2 text-sm rounded-lg hover:bg-white/[0.05] text-foreground">
                  Einstellungen
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
