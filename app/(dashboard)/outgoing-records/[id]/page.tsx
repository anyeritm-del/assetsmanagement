import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ApprovalPanel } from "@/components/outgoingRecords/ApprovalPanel";
import { OutgoingStatusBadge } from "@/components/outgoingRecords/OutgoingStatusBadge";
import { decideOutgoingStageAction } from "@/lib/actions/outgoingRecords";
import { formatCurrency } from "@/lib/currency";
import { getOutgoingRecordOverallStatus } from "@/lib/outgoingRecordStatus";
import { listItems } from "@/lib/repositories/items";
import { listOutgoingRecordItems } from "@/lib/repositories/outgoingRecordItems";
import { getOutgoingRecord } from "@/lib/repositories/outgoingRecords";
import { getProperty } from "@/lib/repositories/properties";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function OutgoingRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getOutgoingRecord(id);
  if (!record) {
    notFound();
  }

  const [lines, allItems, sourceProperty, destinationProperty, viewOnly] = await Promise.all([
    listOutgoingRecordItems(record.id),
    listItems(),
    getProperty(record.source_property_id),
    getProperty(record.destination_property_id),
    isViewOnly(),
  ]);
  const itemsById = new Map(allItems.map((item) => [item.id, item]));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: sourceProperty?.name ?? "Property", href: "/outgoing-records" },
          { label: "Outgoing" },
        ]}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Loan Request
          </h1>
          <OutgoingStatusBadge status={getOutgoingRecordOverallStatus(record)} />
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">From</dt>
          <dd className="text-slate-900 dark:text-slate-100">{sourceProperty?.name ?? "—"}</dd>
          <dt className="text-slate-500 dark:text-slate-400">To</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {destinationProperty?.name ?? "—"}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Expected Return</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {record.expected_return_date || "—"}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Requested By</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {record.requested_by_name} ({record.requested_by_email})
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Reason</dt>
          <dd className="col-span-2 text-slate-900 dark:text-slate-100">{record.reason}</dd>
        </dl>

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Acquisition Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lines.map((line) => {
                const item = itemsById.get(line.item_id);
                return (
                  <tr key={line.id}>
                    <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                      {item?.name ?? "Unknown item"}
                    </td>
                    <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                      {line.quantity}
                    </td>
                    <td className="px-3 py-2 text-slate-900 dark:text-slate-100">
                      {item ? formatCurrency(item.acquisition_value) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Approval Chain
        </h2>
        <ApprovalPanel record={record} decideAction={decideOutgoingStageAction} viewOnly={viewOnly} />
      </div>
    </div>
  );
}
