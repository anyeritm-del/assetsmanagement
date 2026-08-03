"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useActionState, useState } from "react";
import { X } from "lucide-react";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import type { Building, Floor, Item, Room, User } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/movementRequests";

interface MovementRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  selectedItems: Item[];
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  users: User[];
  action: (formData: FormData) => Promise<ActionResult>;
  onCreated: () => void;
}

export function MovementRequestDialog({
  open,
  onOpenChange,
  propertyId,
  selectedItems,
  buildings,
  floors,
  rooms,
  users,
  action,
  onCreated,
}: MovementRequestDialogProps) {
  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const floorsForBuilding = floors.filter((floor) => floor.building_id === buildingId);
  const roomsForFloor = rooms.filter((room) => room.floor_id === floorId);
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
              Movement Request
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

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Building
                </label>
                <select
                  name="destination_building_id"
                  required
                  value={buildingId}
                  onChange={(event) => {
                    setBuildingId(event.target.value);
                    setFloorId("");
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="" disabled>
                    Select building
                  </option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Floor
                </label>
                <select
                  value={floorId}
                  onChange={(event) => setFloorId(event.target.value)}
                  disabled={!buildingId}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900"
                >
                  <option value="">Select floor</option>
                  {floorsForBuilding.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Location
                </label>
                <select
                  name="destination_room_id"
                  defaultValue=""
                  disabled={!floorId}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:disabled:bg-slate-900"
                >
                  <option value="">Select location</option>
                  {roomsForFloor.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Note
              </label>
              <textarea
                name="note"
                rows={4}
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
