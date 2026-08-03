import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ApprovalsTable } from "@/components/outgoingRecords/ApprovalsTable";
import { DisposalRequestsTable } from "@/components/disposalRequests/DisposalRequestsTable";
import { MovementRequestsTable } from "@/components/movementRequests/MovementRequestsTable";
import { getActiveStage } from "@/lib/outgoingRecordStatus";
import { listAllDisposalRequestItems } from "@/lib/repositories/disposalRequestItems";
import { listAllDisposalRequests } from "@/lib/repositories/disposalRequests";
import { listItems } from "@/lib/repositories/items";
import { listAllMovementRequestItems } from "@/lib/repositories/movementRequestItems";
import { listAllMovementRequests } from "@/lib/repositories/movementRequests";
import { listAllOutgoingRecordItems } from "@/lib/repositories/outgoingRecordItems";
import { listAllOutgoingRecords } from "@/lib/repositories/outgoingRecords";
import { listProperties } from "@/lib/repositories/properties";
import { listUsers } from "@/lib/repositories/users";
import type { DisposalRequestItem, MovementRequestItem, OutgoingRecordItem } from "@/lib/types";

export default async function ApprovalsPage() {
  const [
    allOutgoingRecords,
    allDisposalRequests,
    allMovementRequests,
    items,
    properties,
    users,
    allOutgoingRecordItems,
    allDisposalRequestItems,
    allMovementRequestItems,
  ] = await Promise.all([
    listAllOutgoingRecords(),
    listAllDisposalRequests(),
    listAllMovementRequests(),
    listItems(),
    listProperties(),
    listUsers(),
    listAllOutgoingRecordItems(),
    listAllDisposalRequestItems(),
    listAllMovementRequestItems(),
  ]);

  // Cross-property inbox: approvers oversee the whole hotel group, not a single property, so
  // unlike the per-module lists this isn't scoped to the selected property.
  const pendingOutgoingRecords = allOutgoingRecords.filter(
    (record) => getActiveStage(record) !== null,
  );
  const pendingDisposalRequests = allDisposalRequests.filter(
    (request) => request.status === "pending",
  );
  const pendingMovementRequests = allMovementRequests.filter(
    (request) => request.status === "pending",
  );

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const propertiesById = new Map(properties.map((property) => [property.id, property]));
  const usersById = new Map(users.map((user) => [user.id, user]));

  const outgoingRecordItemsById = new Map<string, OutgoingRecordItem[]>();
  for (const line of allOutgoingRecordItems) {
    const existing = outgoingRecordItemsById.get(line.outgoing_record_id) ?? [];
    existing.push(line);
    outgoingRecordItemsById.set(line.outgoing_record_id, existing);
  }

  const disposalRequestItemsById = new Map<string, DisposalRequestItem[]>();
  for (const line of allDisposalRequestItems) {
    const existing = disposalRequestItemsById.get(line.disposal_request_id) ?? [];
    existing.push(line);
    disposalRequestItemsById.set(line.disposal_request_id, existing);
  }

  const movementRequestItemsById = new Map<string, MovementRequestItem[]>();
  for (const line of allMovementRequestItems) {
    const existing = movementRequestItemsById.get(line.movement_request_id) ?? [];
    existing.push(line);
    movementRequestItemsById.set(line.movement_request_id, existing);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Breadcrumb items={[{ label: "Approval" }]} />
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Pending Approvals
        </h1>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Outgoing Loan Requests
        </h2>
        <ApprovalsTable
          records={pendingOutgoingRecords}
          recordItemsById={outgoingRecordItemsById}
          itemsById={itemsById}
          propertiesById={propertiesById}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Disposal Requests
        </h2>
        <DisposalRequestsTable
          requests={pendingDisposalRequests}
          requestItemsById={disposalRequestItemsById}
          itemsById={itemsById}
          usersById={usersById}
          propertiesById={propertiesById}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Movement Requests
        </h2>
        <MovementRequestsTable
          requests={pendingMovementRequests}
          requestItemsById={movementRequestItemsById}
          itemsById={itemsById}
          usersById={usersById}
          propertiesById={propertiesById}
        />
      </div>
    </div>
  );
}
