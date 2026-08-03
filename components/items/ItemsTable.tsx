"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { createItemColumns } from "@/components/items/ItemColumns";
import { DisposalRequestDialog } from "@/components/disposalRequests/DisposalRequestDialog";
import { createDisposalRequestAction } from "@/lib/actions/disposalRequests";
import type { Article, Building, Floor, Item, Room, User } from "@/lib/types";

const ITEM_URL_PATTERN = /\/items\/([0-9a-f-]{36})/i;

interface ItemsTableProps {
  items: Item[];
  buildingsById: Map<string, Building>;
  floorsById: Map<string, Floor>;
  roomsById: Map<string, Room>;
  articlesById: Map<string, Article>;
  propertyId: string;
  users: User[];
}

export function ItemsTable({
  items,
  buildingsById,
  floorsById,
  roomsById,
  articlesById,
  propertyId,
  users,
}: ItemsTableProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [disposalDialogOpen, setDisposalDialogOpen] = useState(false);

  function handleEnterInSearch(value: string, filteredRows: Item[]) {
    // A scanned QR label contains a full "/items/<id>" URL -- jump straight there.
    const urlMatch = value.match(ITEM_URL_PATTERN);
    if (urlMatch) {
      router.push(`/items/${urlMatch[1]}`);
      return;
    }
    // Otherwise, if the typed/scanned code narrowed the list to exactly one item, open it.
    if (filteredRows.length === 1) {
      router.push(`/items/${filteredRows[0].id}`);
    }
  }

  function handlePrintQrCode() {
    const ids = selectedItems.map((item) => item.id).join(",");
    window.open(`/items/print-labels?ids=${ids}`, "_blank");
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setDisposalDialogOpen(true)}
          disabled={selectedItems.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Create Disposal Request{selectedItems.length > 0 ? ` (${selectedItems.length})` : ""}
        </button>
        <button
          type="button"
          onClick={handlePrintQrCode}
          disabled={selectedItems.length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <QrCode className="h-4 w-4" />
          Print QR Code{selectedItems.length > 0 ? ` (${selectedItems.length})` : ""}
        </button>
      </div>
      <DataTable
        columns={createItemColumns(buildingsById, floorsById, roomsById, articlesById)}
        data={items}
        searchPlaceholder="e.g. filter for item name, code, etc, or scan a label"
        emptyMessage="No items yet. Create one to get started."
        onEnterInSearch={handleEnterInSearch}
        enableRowSelection
        onSelectedRowsChange={setSelectedItems}
      />
      <DisposalRequestDialog
        open={disposalDialogOpen}
        onOpenChange={setDisposalDialogOpen}
        propertyId={propertyId}
        selectedItems={selectedItems}
        users={users}
        action={createDisposalRequestAction}
        onCreated={() => router.refresh()}
      />
    </div>
  );
}
