import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import type { Executor } from "../db/client";
import { outgoingRecordItems } from "../db/schema";
import type { OutgoingRecordItem } from "../types";
import type { OutgoingRecordLineInput } from "../validation/outgoingRecord";

const repository = createTableRepository(outgoingRecordItems, "OutgoingRecordItems");

export async function listAllOutgoingRecordItems(): Promise<OutgoingRecordItem[]> {
  return repository.list();
}

export async function listOutgoingRecordItems(
  outgoingRecordId: string,
): Promise<OutgoingRecordItem[]> {
  return repository.list(eq(outgoingRecordItems.outgoing_record_id, outgoingRecordId));
}

export async function createOutgoingRecordItem(
  outgoingRecordId: string,
  input: OutgoingRecordLineInput,
  executor?: Executor,
): Promise<OutgoingRecordItem> {
  const entity: OutgoingRecordItem = {
    id: uuidv4(),
    outgoing_record_id: outgoingRecordId,
    item_id: input.item_id,
    quantity: input.quantity,
    created_at: new Date().toISOString(),
  };
  return repository.create(entity, executor);
}
