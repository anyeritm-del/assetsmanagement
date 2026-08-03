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
}

export function DisposalItemPicker({
  items,
  buildingsById,
  floorsById,
  roomsById,
  articlesById,
  propertyId,
  users,
}: DisposalItemPickerProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
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
        selectedItems={selectedItems}
        users={users}
        action={createDisposalRequestAction}
        onCreated={() => router.push("/disposal-requests")}
      />
    </div>
  );
}
