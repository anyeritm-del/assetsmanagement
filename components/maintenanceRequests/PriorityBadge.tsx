import { MAINTENANCE_PRIORITY_COLORS, MAINTENANCE_PRIORITY_LABELS } from "@/lib/constants";
import type { MaintenancePriority } from "@/lib/constants";

export function PriorityBadge({ priority }: { priority: MaintenancePriority }) {
  const label = MAINTENANCE_PRIORITY_LABELS[priority].split(" – ")[0];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
      <span className={`h-2.5 w-2.5 rounded-full ${MAINTENANCE_PRIORITY_COLORS[priority]}`} />
      {label}
    </span>
  );
}
