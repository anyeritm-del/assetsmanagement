"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Move } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { createItemColumns } from "@/components/items/ItemColumns";
import { MovementRequestDialog } from "@/components/movementRequests/MovementRequestDialog";
import { createMovementRequestAction } from "@/lib/actions/movementRequests";
import type { Article, Building, Floor, Item, Room, User } from "@/lib/types";

interface MovementItemPickerProps {
  items: Item[];
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  articlesById: Map<string, Article>;
  buildingsById: Map<string, Building>;
  floorsById: Map<string, Floor>;
  roomsById: Map<string, Room>;
  propertyId: string;
  users: User[];
  /** When set (e.g. arriving from an Item's "Move" quick action), opens the dialog with that item
   * already selected instead of requiring the user to check it in the table below. */
  preselectedItemId?: string;
}

export function MovementItemPicker({
  items,
  buildings,
  floors,
  rooms,
  articlesById,
  buildingsById,
  floorsById,
  roomsById,
  propertyId,
  users,
  preselectedItemId,
}: MovementItemPickerProps) {
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
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Move className="h-4 w-4" />
          Create Movement Request{selectedItems.length > 0 ? ` (${selectedItems.length})` : ""}
        </button>
      </div>
      <DataTable
        columns={createItemColumns(buildingsById, floorsById, roomsById, articlesById)}
        data={items}
        searchPlaceholder="e.g. filter for item name, code, etc"
        emptyMessage="No items available to move."
        enableRowSelection
        onSelectedRowsChange={setSelectedItems}
      />
      <MovementRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        propertyId={propertyId}
        selectedItems={dialogItems}
        buildings={buildings}
        floors={floors}
        rooms={rooms}
        users={users}
        action={createMovementRequestAction}
        onCreated={() => router.push("/movement-requests")}
      />
    </div>
  );
}
