"use client";

import { cn } from "@/lib/utils";
import type { DateRange } from "@/hooks/use-affiliate-stats";

const options: { value: DateRange; label: string }[] = [
  { value: "today", label: "Heute" },
  { value: "7d", label: "7 Tage" },
  { value: "30d", label: "30 Tage" },
  { value: "365d", label: "365 Tage" },
  { value: "custom", label: "Benutzerdefiniert" },
];

export function DateRangeFilter({
  value,
  onChange,
  customFrom,
  customTo,
  onCustomChange,
}: {
  value: DateRange;
  onChange: (v: DateRange) => void;
  customFrom?: string;
  customTo?: string;
  onCustomChange?: (from: string, to: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="glass rounded-xl p-1 flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
              value === opt.value
                ? "bg-primary-500 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomChange?.(e.target.value, customTo ?? "")}
            className="h-9 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-xs text-foreground"
          />
          <span className="text-muted-foreground text-xs">bis</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomChange?.(customFrom ?? "", e.target.value)}
            className="h-9 rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 text-xs text-foreground"
          />
        </div>
      )}
    </div>
  );
}
