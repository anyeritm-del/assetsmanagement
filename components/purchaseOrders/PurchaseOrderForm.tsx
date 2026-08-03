"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { PurchaseOrder, Supplier } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/purchaseOrders";

interface PurchaseOrderFormProps {
  propertyId: string;
  suppliers: Supplier[];
  purchaseOrder?: PurchaseOrder;
  action: (formData: FormData) => Promise<ActionResult>;
}

export function PurchaseOrderForm({
  propertyId,
  suppliers,
  purchaseOrder,
  action,
}: PurchaseOrderFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        router.push("/purchase-orders");
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
          Supplier
        </label>
        <div className="mt-1">
          <SearchableSelect
            name="supplier_id"
            options={suppliers.map((supplier) => ({ id: supplier.id, label: supplier.name }))}
            defaultValue={purchaseOrder?.supplier_id}
            placeholder="Start typing to Search Supplier"
            emptyLabel="No supplier"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Received Date
          </label>
          <input
            type="date"
            name="received_date"
            defaultValue={purchaseOrder?.received_date}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Purchase Number
          </label>
          <input
            name="purchase_number"
            defaultValue={purchaseOrder?.purchase_number}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Title
        </label>
        <input
          name="title"
          defaultValue={purchaseOrder?.title}
          required
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Value
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            name="value"
            defaultValue={purchaseOrder?.value ?? 0}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Quantity
          </label>
          <input
            type="number"
            min={0}
            name="quantity"
            defaultValue={purchaseOrder?.quantity ?? 1}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={purchaseOrder?.description}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <PhotoUploadField
        existingPhotoUrl={
          purchaseOrder?.photo_drive_file_id
            ? `/api/photo/${purchaseOrder.photo_drive_file_id}`
            : null
        }
      />

      {state?.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/purchase-orders")}
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
