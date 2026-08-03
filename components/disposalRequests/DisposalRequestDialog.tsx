"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useActionState } from "react";
import { X } from "lucide-react";
import { PhotoUploadField } from "@/components/ui/PhotoUploadField";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DISPOSAL_REASONS, DISPOSAL_REASON_LABELS } from "@/lib/constants";
import type { Item, User } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/disposalRequests";

interface DisposalRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  selectedItems: Item[];
  users: User[];
  action: (formData: FormData) => Promise<ActionResult>;
  onCreated: () => void;
}

export function DisposalRequestDialog({
  open,
  onOpenChange,
  propertyId,
  selectedItems,
  users,
  action,
  onCreated,
}: DisposalRequestDialogProps) {
  const userOptions = users.map((user) => ({ id: user.id, label: `${user.name} (${user.email})` }));

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result.success) {
        onOpenChange(false);
        onCreated();
      }
      return result;
    },
    null,
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Disposal Request
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Selected item ({selectedItems.length}):
            </p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
              {selectedItems.map((item) => (
                <li key={item.id}>
                  {item.name} {item.code ? `(${item.code})` : ""}
                  {item.serial_number ? ` SN: ${item.serial_number}` : ""}
                </li>
              ))}
            </ol>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="property_id" value={propertyId} />
            {selectedItems.map((item) => (
              <input key={item.id} type="hidden" name="item_id" value={item.id} />
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Reason
              </label>
              <select
                name="reason"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="" disabled>
                  Select Status
                </option>
                {DISPOSAL_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {DISPOSAL_REASON_LABELS[reason]}
                  </option>
                ))}
              </select>
            </div>

            <PhotoUploadField />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Note
              </label>
              <textarea
                name="note"
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Approver
              </label>
              <div className="mt-1">
                <SearchableSelect
                  name="approver_user_id"
                  options={userOptions}
                  placeholder="Search approver"
                  emptyLabel="No approver selected"
                />
              </div>
            </div>

            {state?.error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                {state.error}
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending || selectedItems.length === 0}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isPending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
