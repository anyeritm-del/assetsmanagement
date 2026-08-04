import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DisposalRequestsTable } from "@/components/disposalRequests/DisposalRequestsTable";
import { listAllDisposalRequestItems } from "@/lib/repositories/disposalRequestItems";
import { listDisposalRequestsByProperty } from "@/lib/repositories/disposalRequests";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listUsers } from "@/lib/repositories/users";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";
import { isViewOnly } from "@/lib/viewOnlyGuard";
import type { DisposalRequestItem } from "@/lib/types";

export default async function DisposalRequestsPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to view its disposal requests.
      </div>
    );
  }

  const [requests, items, users, allRequestItems, viewOnly] = await Promise.all([
    listDisposalRequestsByProperty(selected.id),
    listItemsByProperty(selected.id),
    listUsers(),
    listAllDisposalRequestItems(),
    isViewOnly(),
  ]);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const usersById = new Map(users.map((user) => [user.id, user]));
  const requestItemsById = new Map<string, DisposalRequestItem[]>();
  for (const line of allRequestItems) {
    const existing = requestItemsById.get(line.disposal_request_id) ?? [];
    existing.push(line);
    requestItemsById.set(line.disposal_request_id, existing);
  }

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: selected.name }, { label: "Disposal Requests" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Disposal Requests
        </h1>
        {!viewOnly && (
          <Link
            href="/disposal-requests/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create New
          </Link>
        )}
      </div>
      <DisposalRequestsTable
        requests={requests}
        requestItemsById={requestItemsById}
        itemsById={itemsById}
        usersById={usersById}
      />
    </div>
  );
}
