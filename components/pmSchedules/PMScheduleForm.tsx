"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { MAINTENANCE_PRIORITIES, MAINTENANCE_PRIORITY_LABELS, PM_FREQUENCY_UNITS, PM_FREQUENCY_UNIT_LABELS } from "@/lib/constants";
import type { Employee, Item, PMSchedule } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/pmSchedules";

interface PMScheduleFormProps {
  propertyId: string;
  schedule?: PMSchedule;
  items: Item[];
  employees: Employee[];
  action: (formData: FormData) => Promise<ActionResult>;
}

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function PMScheduleForm({
  propertyId,
  schedule,
  items,
  employees,
  action,
}: PMScheduleFormProps) {
  const router = useRouter();
  const itemOptions = items.map((item) => ({ id: item.id, label: `${item.code || item.name} — ${item.name}` }));
  const employeeOptions = employees.map((employee) => ({
    id: employee.id,
    label: `${employee.name} (${employee.email})`,
  }));

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push("/preventive-maintenance");
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="property_id" value={propertyId} />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Asset <span className="text-rose-500">*</span>
        </label>
        <div className="mt-1">
          <SearchableSelect
            name="item_id"
            options={itemOptions}
            defaultValue={schedule?.item_id}
            placeholder="Search asset"
            emptyLabel="No asset selected"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Schedule Title <span className="text-rose-500">*</span>
        </label>
        <input
          name="title"
          defaultValue={schedule?.title}
          required
          placeholder="e.g. AC Filter Replacement"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Description / Instructions
        </label>
        <textarea
          name="description"
          defaultValue={schedule?.description}
          rows={3}
          placeholder="What needs to be done..."
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Frequency <span className="text-rose-500">*</span>
        </label>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Every</span>
          <input
            type="number"
            name="frequency_interval"
            min={1}
            defaultValue={schedule?.frequency_interval ?? 1}
            required
            className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
          <select
            name="frequency_unit"
            defaultValue={schedule?.frequency_unit ?? "month"}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {PM_FREQUENCY_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {PM_FREQUENCY_UNIT_LABELS[unit]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Start Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            name="start_date"
            required
            defaultValue={toDateInputValue(schedule?.start_date) || new Date().toISOString().slice(0, 10)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Priority
          </label>
          <select
            name="priority"
            defaultValue={schedule?.priority ?? "medium"}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {MAINTENANCE_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {MAINTENANCE_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Default Technician <span className="text-slate-400">(optional)</span>
        </label>
        <div className="mt-1">
          <SearchableSelect
            name="default_technician_employee_id"
            options={employeeOptions}
            defaultValue={schedule?.default_technician_employee_id}
            placeholder="Search employee"
            emptyLabel="No technician selected"
          />
        </div>
      </div>

      {schedule && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Last Run Date <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="date"
            name="last_run_date"
            defaultValue={toDateInputValue(schedule.last_run_date)}
            className="mt-1 w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-400">
            Update this after the cycle is completed to recalculate Next Due.
          </p>
        </div>
      )}

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/preventive-maintenance")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
