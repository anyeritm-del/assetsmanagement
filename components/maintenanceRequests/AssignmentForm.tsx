"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { Employee } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/maintenanceRequests";

interface AssignmentFormProps {
  requestId: string;
  employees: Employee[];
  currentAssigneeId: string | null;
  action: (id: string, formData: FormData) => Promise<ActionResult>;
}

export function AssignmentForm({
  requestId,
  employees,
  currentAssigneeId,
  action,
}: AssignmentFormProps) {
  const router = useRouter();
  const employeeOptions = employees.map((employee) => ({
    id: employee.id,
    label: `${employee.name} (${employee.email})`,
  }));

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
      <div className="w-64">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Assigned To
        </label>
        <div className="mt-1">
          <SearchableSelect
            name="assigned_to_employee_id"
            options={employeeOptions}
            defaultValue={currentAssigneeId}
            placeholder="Search technician"
            emptyLabel="Unassigned"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save Assignment"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-rose-600 dark:text-rose-400">{state.error}</p>
      )}
    </form>
  );
}
