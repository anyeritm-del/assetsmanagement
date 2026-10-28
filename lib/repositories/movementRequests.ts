import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { movementRequests } from "../db/schema";
import { getDb } from "../db/client";
import type { MovementRequest } from "../types";
import type { MovementRequestInput } from "../validation/movementRequest";
import { createMovementRequestItem } from "./movementRequestItems";
import { updateItems } from "./items";

const repository = createTableRepository(movementRequests, "MovementRequests");

export async function listAllMovementRequests(): Promise<MovementRequest[]> {
  return repository.list();
}

export async function listMovementRequestsByProperty(
  propertyId: string,
): Promise<MovementRequest[]> {
  return repository.list(eq(movementRequests.property_id, propertyId));
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
  // One transaction so a failure never leaves a request without its item lines.
  return getDb().transaction(async (tx) => {
    const created = await repository.create(entity, tx);
    for (const itemId of item_ids) {
      await createMovementRequestItem(created.id, itemId, tx);
    }
    return created;
  });
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
  // One transaction so an approval never lands without its items actually being moved.
  return getDb().transaction(async (tx) => {
    const updated = await repository.update(
      id,
      { status: decision, decided_by: decidedBy, decided_at: now, updated_at: now },
      tx,
    );
    if (decision === "approved") {
      await updateItems(
        itemIds,
        { building_id: destinationBuildingId, room_id: destinationRoomId },
        tx,
      );
    }
    return updated;
  });
}
