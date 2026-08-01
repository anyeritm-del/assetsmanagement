import { CheckCircle2, type LucideIcon, Wrench, XCircle } from "lucide-react";

const STATUS_STYLES: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  inactive: {
    label: "Inactive",
    className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    icon: XCircle,
  },
  maintenance: {
    label: "Maintenance",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Wrench,
  },
  disposed: {
    label: "Disposed",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    icon: XCircle,
  },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    icon: CheckCircle2,
  };
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {style.label}
    </span>
  );
}
