import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DisposalReportView } from "@/components/reports/DisposalReportView";
import { listAllDisposalRequestItems } from "@/lib/repositories/disposalRequestItems";
import { listDisposalRequestsByProperty } from "@/lib/repositories/disposalRequests";
import { listItemsByProperty } from "@/lib/repositories/items";
import { listUsers } from "@/lib/repositories/users";
import { getSelectedPropertyContext } from "@/lib/selectedProperty";
import type { DisposalRequestItem } from "@/lib/types";

export default async function DisposalReportPage() {
  const { selected } = await getSelectedPropertyContext();

  if (!selected) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700">
        Select a property to generate its disposal report.
      </div>
    );
  }

  const [requests, items, users, allRequestItems] = await Promise.all([
    listDisposalRequestsByProperty(selected.id),
    listItemsByProperty(selected.id),
    listUsers(),
    listAllDisposalRequestItems(),
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
      <Breadcrumb items={[{ label: "Report" }, { label: "Disposal" }]} />
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Report</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Disposal</p>
      <DisposalReportView
        requests={requests}
        requestItemsById={requestItemsById}
        itemsById={itemsById}
        usersById={usersById}
      />
    </div>
  );
}
