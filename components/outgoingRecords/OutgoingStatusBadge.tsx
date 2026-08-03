import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { OUTGOING_RECORD_OVERALL_STATUS_LABELS } from "@/lib/constants";
import type { OutgoingRecordOverallStatus } from "@/lib/constants";

const STYLES: Record<OutgoingRecordOverallStatus, { className: string; icon: typeof Clock }> = {
  pending_fc: {
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock,
  },
  pending_hr: {
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock,
  },
  pending_gm: {
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock,
  },
  approved: {
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  rejected: {
    className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    icon: XCircle,
  },
};

export function OutgoingStatusBadge({ status }: { status: OutgoingRecordOverallStatus }) {
  const style = STYLES[status];
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${style.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {OUTGOING_RECORD_OVERALL_STATUS_LABELS[status]}
    </span>
  );
}
