import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { outgoingRecords } from "../db/schema";
import { getDb } from "../db/client";
import type { OutgoingRecord } from "../types";
import type { OutgoingRecordInput } from "../validation/outgoingRecord";
import { createOutgoingRecordItem } from "./outgoingRecordItems";

const repository = createTableRepository(outgoingRecords, "OutgoingRecords");

export async function listAllOutgoingRecords(): Promise<OutgoingRecord[]> {
  return repository.list();
}

export async function listOutgoingRecordsByProperty(propertyId: string): Promise<OutgoingRecord[]> {
  return repository.list(eq(outgoingRecords.source_property_id, propertyId));
}

export async function getOutgoingRecord(id: string): Promise<OutgoingRecord | null> {
  return repository.getById(id);
}

export async function createOutgoingRecordWithItems(
  input: OutgoingRecordInput,
  requestedByName: string,
  requestedByEmail: string,
): Promise<OutgoingRecord> {
  const { items, ...recordInput } = input;
  const now = new Date().toISOString();
  const entity: OutgoingRecord = {
    id: uuidv4(),
    ...recordInput,
    requested_by_name: requestedByName,
    requested_by_email: requestedByEmail,
    fc_status: "pending",
    fc_decided_by: null,
    fc_decided_at: null,
    fc_notes: "",
    hr_status: "pending",
    hr_decided_by: null,
    hr_decided_at: null,
    hr_notes: "",
    gm_status: "pending",
    gm_decided_by: null,
    gm_decided_at: null,
    gm_notes: "",
    created_at: now,
    updated_at: now,
  };
  // One transaction so a failure never leaves a record without its item lines.
  return getDb().transaction(async (tx) => {
    const created = await repository.create(entity, tx);
    for (const line of items) {
      await createOutgoingRecordItem(created.id, line, tx);
    }
    return created;
  });
}

export async function updateOutgoingRecord(
  id: string,
  patch: Partial<OutgoingRecord>,
): Promise<OutgoingRecord> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
