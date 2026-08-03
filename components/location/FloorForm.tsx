"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { FLOOR_STATUSES } from "@/lib/constants";
import type { Floor } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/floors";

interface FloorFormProps {
  propertyId: string;
  buildingId: string;
  floor?: Floor;
  action: (formData: FormData) => Promise<ActionResult>;
}

export function FloorForm({ propertyId, buildingId, floor, action }: FloorFormProps) {
  const router = useRouter();
  const backHref = `/location/${buildingId}/floors`;
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push(backHref);
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="building_id" value={buildingId} />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Floor Name
        </label>
        <input
          name="name"
          defaultValue={floor?.name}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={floor?.description}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Status
        </label>
        <select
          name="status"
          defaultValue={floor?.status ?? "active"}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        >
          {FLOOR_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push(backHref)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
