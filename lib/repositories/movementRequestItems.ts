import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { MovementRequestItem } from "../types";
import { movementRequestItemSchema } from "../validation/movementRequest";

const HEADERS = ["id", "movement_request_id", "item_id", "created_at"];

function fromRow(record: Record<string, unknown>): MovementRequestItem | null {
  const parsed = movementRequestItemSchema.safeParse({
    id: String(record.id ?? ""),
    movement_request_id: String(record.movement_request_id ?? ""),
    item_id: String(record.item_id ?? ""),
    created_at: String(record.created_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed MovementRequestItems row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: MovementRequestItem): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<MovementRequestItem>({
  sheetName: "MovementRequestItems",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listAllMovementRequestItems(): Promise<MovementRequestItem[]> {
  return repository.list();
}

export async function listMovementRequestItems(
  movementRequestId: string,
): Promise<MovementRequestItem[]> {
  const all = await repository.list();
  return all.filter((line) => line.movement_request_id === movementRequestId);
}

export async function createMovementRequestItem(
  movementRequestId: string,
  itemId: string,
): Promise<MovementRequestItem> {
  const entity: MovementRequestItem = {
    id: uuidv4(),
    movement_request_id: movementRequestId,
    item_id: itemId,
    created_at: new Date().toISOString(),
  };
  return repository.create(entity);
}
