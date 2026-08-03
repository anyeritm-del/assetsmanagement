import { AlertTriangle, CalendarClock, CheckCircle2, type LucideIcon } from "lucide-react";
import { PM_SCHEDULE_DUE_STATUS_LABELS } from "@/lib/constants";
import type { PMScheduleDueStatus } from "@/lib/constants";

const STYLES: Record<PMScheduleDueStatus, { className: string; icon: LucideIcon }> = {
  overdue: {
    className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    icon: AlertTriangle,
  },
  due_soon: {
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: CalendarClock,
  },
  upcoming: {
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CheckCircle2,
  },
};

export function PMDueStatusBadge({ status }: { status: PMScheduleDueStatus }) {
  const style = STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {PM_SCHEDULE_DUE_STATUS_LABELS[status]}
    </span>
  );
}
