import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { MovementReportView } from "@/components/reports/MovementReportView";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listAllMovementRequestItems } from "@/lib/repositories/movementRequestItems";
import { listMovementRequestsByProperty } from "@/lib/repositories/movementRequests";
import { listUsers } from "@/lib/repositories/users";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";
import type { MovementRequestItem } from "@/lib/types";

export default async function MovementReportPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to generate its movement report.
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
      <Breadcrumb items={[{ label: "Report" }, { label: "Movement" }]} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Report</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Movement</p>
      <MovementReportView
        requests={requests}
        requestItemsById={requestItemsById}
        itemsById={itemsById}
        usersById={usersById}
      />
    </div>
  );
}
