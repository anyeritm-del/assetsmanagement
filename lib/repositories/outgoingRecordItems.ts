import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { OutgoingRecordItem } from "../types";
import { outgoingRecordItemSchema } from "../validation/outgoingRecord";
import type { OutgoingRecordLineInput } from "../validation/outgoingRecord";

const HEADERS = ["id", "outgoing_record_id", "item_id", "quantity", "created_at"];

function fromRow(record: Record<string, unknown>): OutgoingRecordItem | null {
  const parsed = outgoingRecordItemSchema.safeParse({
    id: String(record.id ?? ""),
    outgoing_record_id: String(record.outgoing_record_id ?? ""),
    item_id: String(record.item_id ?? ""),
    quantity: Number(record.quantity ?? 1),
    created_at: String(record.created_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed OutgoingRecordItems row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: OutgoingRecordItem): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<OutgoingRecordItem>({
  sheetName: "OutgoingRecordItems",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listAllOutgoingRecordItems(): Promise<OutgoingRecordItem[]> {
  return repository.list();
}

export async function listOutgoingRecordItems(
  outgoingRecordId: string,
): Promise<OutgoingRecordItem[]> {
  const all = await repository.list();
  return all.filter((line) => line.outgoing_record_id === outgoingRecordId);
}

export async function createOutgoingRecordItem(
  outgoingRecordId: string,
  input: OutgoingRecordLineInput,
): Promise<OutgoingRecordItem> {
  const entity: OutgoingRecordItem = {
    id: uuidv4(),
    outgoing_record_id: outgoingRecordId,
    item_id: input.item_id,
    quantity: input.quantity,
    created_at: new Date().toISOString(),
  };
  return repository.create(entity);
}
