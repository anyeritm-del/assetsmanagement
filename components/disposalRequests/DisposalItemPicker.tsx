"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { createItemColumns } from "@/components/items/ItemColumns";
import { DisposalRequestDialog } from "@/components/disposalRequests/DisposalRequestDialog";
import { createDisposalRequestAction } from "@/lib/actions/disposalRequests";
import type { Article, Building, Floor, Item, Room, User } from "@/lib/types";

interface DisposalItemPickerProps {
  items: Item[];
  buildingsById: Map<string, Building>;
  floorsById: Map<string, Floor>;
  roomsById: Map<string, Room>;
  articlesById: Map<string, Article>;
  propertyId: string;
  users: User[];
  /** When set (e.g. arriving from an Item's "Dispose" quick action), opens the dialog with that
   * item already selected instead of requiring the user to check it in the table below. */
  preselectedItemId?: string;
}

export function DisposalItemPicker({
  items,
  buildingsById,
  floorsById,
  roomsById,
  articlesById,
  propertyId,
  users,
  preselectedItemId,
}: DisposalItemPickerProps) {
  const router = useRouter();
  const preselectedItem = preselectedItemId
    ? items.find((item) => item.id === preselectedItemId)
    : undefined;
  // Checkbox-driven selection (fed by DataTable) is kept separate from what's actually shown in
  // the dialog, so an incoming preselection isn't clobbered by DataTable's own mount effect.
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [dialogItems, setDialogItems] = useState<Item[]>(
    preselectedItem ? [preselectedItem] : [],
  );
  const [dialogOpen, setDialogOpen] = useState(Boolean(preselectedItem));

  function handleOpenDialog() {
    setDialogItems(selectedItems);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleOpenDialog}
          disabled={selectedItems.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Create Disposal Request{selectedItems.length > 0 ? ` (${selectedItems.length})` : ""}
        </button>
      </div>
      <DataTable
        columns={createItemColumns(buildingsById, floorsById, roomsById, articlesById)}
        data={items}
        searchPlaceholder="e.g. filter for item name, code, etc"
        emptyMessage="No items available to dispose."
        enableRowSelection
        onSelectedRowsChange={setSelectedItems}
      />
      <DisposalRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        propertyId={propertyId}
        selectedItems={dialogItems}
        users={users}
        action={createDisposalRequestAction}
        onCreated={() => router.push("/disposal-requests")}
      />
    </div>
  );
}
