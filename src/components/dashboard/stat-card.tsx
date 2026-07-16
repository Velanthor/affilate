"use client";

import { motion } from "framer-motion";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  loading,
  accent = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  loading?: boolean;
  accent?: "primary" | "cyan" | "emerald" | "violet";
}) {
  const accentClasses: Record<string, string> = {
    primary: "from-primary-500/20 to-primary-500/5 text-primary-300",
    cyan: "from-accent-cyan/20 to-accent-cyan/5 text-accent-cyan",
    emerald: "from-accent-emerald/20 to-accent-emerald/5 text-accent-emerald",
    violet: "from-accent-violet/20 to-accent-violet/5 text-accent-violet",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          {loading ? (
            <div className="h-7 w-24 mt-2 rounded bg-white/[0.06] animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          )}
          {trend && !loading && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs mt-2 font-medium",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>
        <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0", accentClasses[accent])}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </motion.div>
  );
}
