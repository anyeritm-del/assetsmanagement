import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import type { Executor } from "../db/client";
import { movementRequestItems } from "../db/schema";
import type { MovementRequestItem } from "../types";

const repository = createTableRepository(movementRequestItems, "MovementRequestItems");

export async function listAllMovementRequestItems(): Promise<MovementRequestItem[]> {
  return repository.list();
}

export async function listMovementRequestItems(
  movementRequestId: string,
): Promise<MovementRequestItem[]> {
  return repository.list(eq(movementRequestItems.movement_request_id, movementRequestId));
}

export async function createMovementRequestItem(
  movementRequestId: string,
  itemId: string,
  executor?: Executor,
): Promise<MovementRequestItem> {
  const entity: MovementRequestItem = {
    id: uuidv4(),
    movement_request_id: movementRequestId,
    item_id: itemId,
    created_at: new Date().toISOString(),
  };
  return repository.create(entity, executor);
}
