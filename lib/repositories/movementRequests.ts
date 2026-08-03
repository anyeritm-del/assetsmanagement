import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { MovementRequest } from "../types";
import { movementRequestSchema } from "../validation/movementRequest";
import type { MovementRequestInput } from "../validation/movementRequest";
import { createMovementRequestItem } from "./movementRequestItems";
import { updateItem } from "./items";

const HEADERS = [
  "id",
  "property_id",
  "destination_building_id",
  "destination_room_id",
  "note",
  "approver_user_id",
  "requester_name",
  "requester_email",
  "status",
  "decided_by",
  "decided_at",
  "created_at",
  "updated_at",
];

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

function fromRow(record: Record<string, unknown>): MovementRequest | null {
  const parsed = movementRequestSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    destination_building_id: String(record.destination_building_id ?? ""),
    destination_room_id: toNullableString(record.destination_room_id),
    note: String(record.note ?? ""),
    approver_user_id: String(record.approver_user_id ?? ""),
    requester_name: String(record.requester_name ?? ""),
    requester_email: String(record.requester_email ?? ""),
    status: record.status || "pending",
    decided_by: toNullableString(record.decided_by),
    decided_at: toNullableString(record.decided_at),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed MovementRequests row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: MovementRequest): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<MovementRequest>({
  sheetName: "MovementRequests",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listAllMovementRequests(): Promise<MovementRequest[]> {
  return repository.list();
}

export async function listMovementRequestsByProperty(
  propertyId: string,
): Promise<MovementRequest[]> {
  const all = await repository.list();
  return all.filter((request) => request.property_id === propertyId);
}

export async function getMovementRequest(id: string): Promise<MovementRequest | null> {
  return repository.getById(id);
}

export async function createMovementRequestWithItems(
  input: MovementRequestInput,
  requesterName: string,
  requesterEmail: string,
): Promise<MovementRequest> {
  const { item_ids, ...requestInput } = input;
  const now = new Date().toISOString();

  const entity: MovementRequest = {
    id: uuidv4(),
    ...requestInput,
    requester_name: requesterName,
    requester_email: requesterEmail,
    status: "pending",
    decided_by: null,
    decided_at: null,
    created_at: now,
    updated_at: now,
  };
  const created = await repository.create(entity);
  await Promise.all(item_ids.map((itemId) => createMovementRequestItem(created.id, itemId)));
  return created;
}

export async function decideMovementRequest(
  id: string,
  decision: "approved" | "rejected",
  decidedBy: string,
  itemIds: string[],
  destinationBuildingId: string,
  destinationRoomId: string | null,
): Promise<MovementRequest> {
  const now = new Date().toISOString();
  const updated = await repository.update(id, {
    status: decision,
    decided_by: decidedBy,
    decided_at: now,
    updated_at: now,
  });

  if (decision === "approved") {
    await Promise.all(
      itemIds.map((itemId) =>
        updateItem(itemId, {
          building_id: destinationBuildingId,
          room_id: destinationRoomId,
        }),
      ),
    );
  }

  return updated;
}
