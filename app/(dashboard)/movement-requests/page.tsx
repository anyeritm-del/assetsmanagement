import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MovementRequestsTable } from "@/components/movementRequests/MovementRequestsTable";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listAllMovementRequestItems } from "@/lib/repositories/movementRequestItems";
import { listMovementRequestsByProperty } from "@/lib/repositories/movementRequests";
import { listUsers } from "@/lib/repositories/users";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";
import type { MovementRequestItem } from "@/lib/types";

export default async function MovementRequestsPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view its movement requests.
      </div>
    );
  }

  const [requests, items, users, allRequestItems] = await Promise.all([
    listMovementRequestsByProperty(selected.id),
    listItemsByProperty(selected.id),
    listUsers(),
    listAllMovementRequestItems(),
  ]);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const usersById = new Map(users.map((user) => [user.id, user]));
  const requestItemsById = new Map<string, MovementRequestItem[]>();
  for (const line of allRequestItems) {
    const existing = requestItemsById.get(line.movement_request_id) ?? [];
    existing.push(line);
    requestItemsById.set(line.movement_request_id, existing);
  }

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Movement Requests" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Movement Requests
        </h1>
        <Link
          href="/movement-requests/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Create New
        </Link>
      </div>
      <MovementRequestsTable
        requests={requests}
        requestItemsById={requestItemsById}
        itemsById={itemsById}
        usersById={usersById}
      />
    </div>
  );
}
