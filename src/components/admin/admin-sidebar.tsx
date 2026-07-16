"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Megaphone,
  Settings,
  ScrollText,
  LogOut,
  Menu,
  X,
  ArrowLeftCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Übersicht", icon: LayoutDashboard },
  { href: "/admin/affiliates", label: "Affiliates", icon: Users },
  { href: "/admin/payouts", label: "Auszahlungen", icon: Wallet },
  { href: "/admin/campaigns", label: "Kampagnen", icon: Megaphone },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/settings", label: "Einstellungen", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 glass rounded-lg p-2"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 z-40 glass border-r border-white/[0.08] flex flex-col transition-transform duration-300",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/[0.08]">
          <span className="text-lg font-extrabold tracking-tight gradient-text">VELANTHOR</span>
          <span className="ml-2 text-[10px] font-semibold text-accent-violet bg-accent-violet/10 border border-accent-violet/20 rounded px-1.5 py-0.5">
            ADMIN
          </span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-accent-violet/20 to-primary-500/10 text-foreground border border-white/[0.08]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                )}
              >
                <item.icon className={cn("h-4 w-4", active && "text-accent-violet")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.08] space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.04] w-full transition-all"
          >
            <ArrowLeftCircle className="h-4 w-4" />
            Zum Affiliate-Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-all"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </aside>
    </>
  );
}
