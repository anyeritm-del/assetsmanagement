import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DisposalDecisionForm } from "@/components/disposalRequests/DisposalDecisionForm";
import { DisposalStatusBadge } from "@/components/disposalRequests/DisposalStatusBadge";
import { decideDisposalRequestAction } from "@/lib/actions/disposalRequests";
import { DISPOSAL_REASON_LABELS } from "@/lib/constants";
import { listDisposalRequestItems } from "@/lib/repositories/disposalRequestItems";
import { getDisposalRequest } from "@/lib/repositories/disposalRequests";
import { listItems } from "@/lib/repositories/items";
import { getProperty } from "@/lib/repositories/properties";
import { getUser } from "@/lib/repositories/users";

export default async function DisposalRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getDisposalRequest(id);
  if (!request) {
    notFound();
  }

  const [lines, allItems, approver, property] = await Promise.all([
    listDisposalRequestItems(request.id),
    listItems(),
    getUser(request.approver_user_id),
    getProperty(request.property_id),
  ]);
  const itemsById = new Map(allItems.map((item) => [item.id, item]));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: property?.name ?? "Property", href: "/disposal-requests" },
          { label: "Disposal Request" },
        ]}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Disposal Request
          </h1>
          <DisposalStatusBadge status={request.status} />
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Reason</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {DISPOSAL_REASON_LABELS[request.reason]}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Requester</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {request.requester_name}
            {request.requester_email ? ` (${request.requester_email})` : ""}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Approver</dt>
          <dd className="text-slate-900 dark:text-slate-100">{approver?.name ?? "Unknown"}</dd>
          {request.decided_by && (
            <>
              <dt className="text-slate-500 dark:text-slate-400">
                {request.status === "approved" ? "Approved" : "Rejected"} By
              </dt>
              <dd className="text-slate-900 dark:text-slate-100">
                {request.decided_by}
                {request.decided_at
                  ? ` on ${new Date(request.decided_at).toLocaleString()}`
                  : ""}
              </dd>
            </>
          )}
          <dt className="text-slate-500 dark:text-slate-400">Note</dt>
          <dd className="col-span-2 text-slate-900 dark:text-slate-100">
            {request.note || "—"}
          </dd>
        </dl>

        <div className="mt-4">
          <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            Item(s) ({lines.length})
          </p>
          <ol className="list-decimal space-y-0.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {lines.map((line) => {
              const item = itemsById.get(line.item_id);
              return (
                <li key={line.id}>
                  {item?.name ?? "Unknown item"}
                  {item?.code ? ` (${item.code})` : ""}
                  {item?.serial_number ? ` SN: ${item.serial_number}` : ""}
                </li>
              );
            })}
          </ol>
        </div>

        {request.photo_view_link && (
          <div className="mt-4">
            <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">Photo</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/photo/${request.photo_drive_file_id}`}
              alt="Disposal request"
              className="h-40 w-40 rounded-lg border border-slate-200 object-cover dark:border-slate-800"
            />
          </div>
        )}
      </div>

      {request.status === "pending" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Decision
          </h2>
          <DisposalDecisionForm requestId={request.id} action={decideDisposalRequestAction} />
        </div>
      )}
    </div>
  );
}
