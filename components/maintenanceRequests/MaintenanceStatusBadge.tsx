import { CheckCircle2, CircleDot, Clock, XCircle, type LucideIcon } from "lucide-react";
import { MAINTENANCE_REQUEST_STATUS_LABELS } from "@/lib/constants";
import type { MaintenanceRequestStatus } from "@/lib/constants";

const STYLES: Record<MaintenanceRequestStatus, { className: string; icon: LucideIcon }> = {
  open: {
    className: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    icon: CircleDot,
  },
  in_progress: {
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock,
  },
  completed: {
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  cancelled: {
    className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    icon: XCircle,
  },
};

export function MaintenanceStatusBadge({ status }: { status: MaintenanceRequestStatus }) {
  const style = STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {MAINTENANCE_REQUEST_STATUS_LABELS[status]}
    </span>
  );
}
