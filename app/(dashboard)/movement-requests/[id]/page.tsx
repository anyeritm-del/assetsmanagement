import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DisposalStatusBadge } from "@/components/disposalRequests/DisposalStatusBadge";
import { MovementDecisionForm } from "@/components/movementRequests/MovementDecisionForm";
import { decideMovementRequestAction } from "@/lib/actions/movementRequests";
import { getBuilding } from "@/lib/repositories/buildings";
import { listItems } from "@/lib/repositories/items";
import { listMovementRequestItems } from "@/lib/repositories/movementRequestItems";
import { getMovementRequest } from "@/lib/repositories/movementRequests";
import { getProperty } from "@/lib/repositories/properties";
import { getRoom } from "@/lib/repositories/rooms";
import { getUser } from "@/lib/repositories/users";
import { isViewOnly } from "@/lib/viewOnlyGuard";

export default async function MovementRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getMovementRequest(id);
  if (!request) {
    notFound();
  }

  const [lines, allItems, approver, property, destinationBuilding, destinationRoom, viewOnly] =
    await Promise.all([
      listMovementRequestItems(request.id),
      listItems(),
      getUser(request.approver_user_id),
      getProperty(request.property_id),
      getBuilding(request.destination_building_id),
      request.destination_room_id ? getRoom(request.destination_room_id) : null,
      isViewOnly(),
    ]);
  const itemsById = new Map(allItems.map((item) => [item.id, item]));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: property?.name ?? "Property", href: "/movement-requests" },
          { label: "Movement Request" },
        ]}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Movement Request
          </h1>
          <DisposalStatusBadge status={request.status} />
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Destination Building</dt>
          <dd className="text-slate-900 dark:text-slate-100">
            {destinationBuilding?.name ?? "—"}
          </dd>
          <dt className="text-slate-500 dark:text-slate-400">Destination Location</dt>
          <dd className="text-slate-900 dark:text-slate-100">{destinationRoom?.name ?? "—"}</dd>
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
      </div>

      {request.status === "pending" && !viewOnly && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Decision
          </h2>
          <MovementDecisionForm requestId={request.id} action={decideMovementRequestAction} />
        </div>
      )}
    </div>
  );
}
