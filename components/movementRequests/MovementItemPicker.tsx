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
}: MovementItemPickerProps) {
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
        selectedItems={selectedItems}
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
