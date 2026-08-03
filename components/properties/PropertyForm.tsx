"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { PROPERTY_STATUSES } from "@/lib/constants";
import type { Property } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/properties";

interface PropertyFormProps {
  property?: Property;
  action: (formData: FormData) => Promise<ActionResult>;
}

export function PropertyForm({ property, action }: PropertyFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push("/properties");
        router.refresh();
      }
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Hotel Name
        </label>
        <input
          name="name"
          defaultValue={property?.name}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Code
          </label>
          <input
            name="code"
            defaultValue={property?.code}
            required
            placeholder="e.g. aston-cilegon"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
          <p className="mt-1 text-xs text-slate-400">Lowercase letters, numbers, and hyphens only.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Status
          </label>
          <select
            name="status"
            defaultValue={property?.status ?? "active"}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {PROPERTY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status === "active" ? "Active" : "Inactive"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/properties")}
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
