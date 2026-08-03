"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { Item, Property } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/outgoingRecords";

interface OutgoingRecordFormProps {
  sourcePropertyId: string;
  destinationProperties: Property[];
  items: Item[];
  action: (formData: FormData) => Promise<ActionResult>;
}

export function OutgoingRecordForm({
  sourcePropertyId,
  destinationProperties,
  items,
  action,
}: OutgoingRecordFormProps) {
  const router = useRouter();
  const nextRowKey = useRef(1);
  const [rowKeys, setRowKeys] = useState<number[]>([0]);
  const itemOptions = items.map((item) => ({ id: item.id, label: item.name }));

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push("/outgoing-records");
        router.refresh();
      }
      return result;
    },
    null,
  );

  function addRow() {
    setRowKeys((prev) => [...prev, nextRowKey.current++]);
  }

  function removeRow(key: number) {
    setRowKeys((prev) => (prev.length > 1 ? prev.filter((rowKey) => rowKey !== key) : prev));
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="source_property_id" value={sourcePropertyId} />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Destination Hotel
        </label>
        <select
          name="destination_property_id"
          required
          defaultValue=""
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="" disabled>
            Select a hotel
          </option>
          {destinationProperties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Items
          </label>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        </div>
        <div className="space-y-2">
          {rowKeys.map((key) => (
            <div key={key} className="flex items-start gap-2">
              <div className="flex-1">
                <SearchableSelect
                  name="item_id"
                  options={itemOptions}
                  placeholder="Search item to lend"
                  emptyLabel="No item selected"
                />
              </div>
              <input
                type="number"
                min={1}
                name="quantity"
                defaultValue={1}
                required
                className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
              />
              <button
                type="button"
                onClick={() => removeRow(key)}
                disabled={rowKeys.length === 1}
                aria-label="Remove item row"
                title="Remove item row"
                className="mt-1 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Expected Return Date
        </label>
        <input
          type="date"
          name="expected_return_date"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Reason
        </label>
        <textarea
          name="reason"
          rows={3}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      {items.length === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          This property has no items yet to lend out.
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/outgoing-records")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || items.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </form>
  );
}
