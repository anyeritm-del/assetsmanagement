"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { MAINTENANCE_REQUEST_STATUSES, MAINTENANCE_REQUEST_STATUS_LABELS } from "@/lib/constants";
import type { MaintenanceRequestStatus } from "@/lib/constants";
import type { ActionResult } from "@/lib/actions/maintenanceRequests";

interface MaintenanceStatusFormProps {
  requestId: string;
  currentStatus: MaintenanceRequestStatus;
  action: (id: string, formData: FormData) => Promise<ActionResult>;
}

export function MaintenanceStatusForm({
  requestId,
  currentStatus,
  action,
}: MaintenanceStatusFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(requestId, formData);
      if (result.success) {
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Status
        </label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        >
          {MAINTENANCE_REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {MAINTENANCE_REQUEST_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? "Updating..." : "Update Status"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-rose-600 dark:text-rose-400">{state.error}</p>
      )}
    </form>
  );
}
