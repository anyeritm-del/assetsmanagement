"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { ITEM_STATUSES, ITEM_STATUS_LABELS } from "@/lib/constants";
import type { Building, Item } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/items";
import { PhotoUploadField } from "./PhotoUploadField";

interface ItemFormProps {
  propertyId: string;
  buildings: Building[];
  item?: Item;
  action: (formData: FormData) => Promise<ActionResult>;
}

export function ItemForm({ propertyId, buildings, item, action }: ItemFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push("/items");
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
          Item Name
        </label>
        <input
          name="name"
          defaultValue={item?.name}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Building
          </label>
          <select
            name="building_id"
            defaultValue={item?.building_id ?? buildings[0]?.id}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Floor Number
          </label>
          <input
            type="number"
            name="floor_number"
            defaultValue={item?.floor_number ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Category
          </label>
          <input
            name="category"
            defaultValue={item?.category}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Code / SKU
          </label>
          <input
            name="code"
            defaultValue={item?.code}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Quantity
          </label>
          <input
            type="number"
            min={0}
            name="quantity"
            defaultValue={item?.quantity ?? 1}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Status
          </label>
          <select
            name="status"
            defaultValue={item?.status ?? "active"}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          >
            {ITEM_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ITEM_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Notes
        </label>
        <textarea
          name="notes"
          defaultValue={item?.notes}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <PhotoUploadField
        existingPhotoUrl={item?.photo_drive_file_id ? `/api/photo/${item.photo_drive_file_id}` : null}
      />

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      {buildings.length === 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Create a building in the Location module first before adding items.
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/items")}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending || buildings.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
