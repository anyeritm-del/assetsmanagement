import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { DisposalRequestItem } from "../types";
import { disposalRequestItemSchema } from "../validation/disposalRequest";

const HEADERS = ["id", "disposal_request_id", "item_id", "created_at"];

function fromRow(record: Record<string, unknown>): DisposalRequestItem | null {
  const parsed = disposalRequestItemSchema.safeParse({
    id: String(record.id ?? ""),
    disposal_request_id: String(record.disposal_request_id ?? ""),
    item_id: String(record.item_id ?? ""),
    created_at: String(record.created_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed DisposalRequestItems row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: DisposalRequestItem): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<DisposalRequestItem>({
  sheetName: "DisposalRequestItems",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listAllDisposalRequestItems(): Promise<DisposalRequestItem[]> {
  return repository.list();
}

export async function listDisposalRequestItems(
  disposalRequestId: string,
): Promise<DisposalRequestItem[]> {
  const all = await repository.list();
  return all.filter((line) => line.disposal_request_id === disposalRequestId);
}

export async function createDisposalRequestItem(
  disposalRequestId: string,
  itemId: string,
): Promise<DisposalRequestItem> {
  const entity: DisposalRequestItem = {
    id: uuidv4(),
    disposal_request_id: disposalRequestId,
    item_id: itemId,
    created_at: new Date().toISOString(),
  };
  return repository.create(entity);
}
