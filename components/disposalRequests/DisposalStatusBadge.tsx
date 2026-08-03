import { CheckCircle2, Clock, XCircle, type LucideIcon } from "lucide-react";
import type { ApprovalStageStatus } from "@/lib/constants";

const STYLES: Record<ApprovalStageStatus, { label: string; className: string; icon: LucideIcon }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    className: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    icon: XCircle,
  },
};

export function DisposalStatusBadge({ status }: { status: ApprovalStageStatus }) {
  const style = STYLES[status];
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
