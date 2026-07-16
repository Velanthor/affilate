import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Offen", className: "text-warning bg-warning/10 border-warning/20" },
  approved: { label: "Genehmigt", className: "text-primary-300 bg-primary-500/10 border-primary-500/20" },
  rejected: { label: "Abgelehnt", className: "text-destructive bg-destructive/10 border-destructive/20" },
  paid: { label: "Bezahlt", className: "text-success bg-success/10 border-success/20" },
};

export function PayoutStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? statusConfig.open;
  return (
    <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap", config.className)}>
      {config.label}
    </span>
  );
}
