import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { OutgoingRecord } from "../types";
import { outgoingRecordSchema } from "../validation/outgoingRecord";
import type { OutgoingRecordInput } from "../validation/outgoingRecord";
import { createOutgoingRecordItem } from "./outgoingRecordItems";

const HEADERS = [
  "id",
  "source_property_id",
  "destination_property_id",
  "reason",
  "expected_return_date",
  "requested_by_name",
  "requested_by_email",
  "fc_status",
  "fc_decided_by",
  "fc_decided_at",
  "fc_notes",
  "hr_status",
  "hr_decided_by",
  "hr_decided_at",
  "hr_notes",
  "gm_status",
  "gm_decided_by",
  "gm_decided_at",
  "gm_notes",
  "created_at",
  "updated_at",
];

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

function fromRow(record: Record<string, unknown>): OutgoingRecord | null {
  const parsed = outgoingRecordSchema.safeParse({
    id: String(record.id ?? ""),
    source_property_id: String(record.source_property_id ?? ""),
    destination_property_id: String(record.destination_property_id ?? ""),
    reason: String(record.reason ?? ""),
    expected_return_date: toNullableString(record.expected_return_date),
    requested_by_name: String(record.requested_by_name ?? ""),
    requested_by_email: String(record.requested_by_email ?? ""),
    fc_status: record.fc_status || "pending",
    fc_decided_by: toNullableString(record.fc_decided_by),
    fc_decided_at: toNullableString(record.fc_decided_at),
    fc_notes: String(record.fc_notes ?? ""),
    hr_status: record.hr_status || "pending",
    hr_decided_by: toNullableString(record.hr_decided_by),
    hr_decided_at: toNullableString(record.hr_decided_at),
    hr_notes: String(record.hr_notes ?? ""),
    gm_status: record.gm_status || "pending",
    gm_decided_by: toNullableString(record.gm_decided_by),
    gm_decided_at: toNullableString(record.gm_decided_at),
    gm_notes: String(record.gm_notes ?? ""),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Outgoing Records row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: OutgoingRecord): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<OutgoingRecord>({
  sheetName: "OutgoingRecords",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listAllOutgoingRecords(): Promise<OutgoingRecord[]> {
  return repository.list();
}

export async function listOutgoingRecordsByProperty(propertyId: string): Promise<OutgoingRecord[]> {
  const all = await repository.list();
  return all.filter((record) => record.source_property_id === propertyId);
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
  const created = await repository.create(entity);
  await Promise.all(items.map((line) => createOutgoingRecordItem(created.id, line)));
  return created;
}

export async function updateOutgoingRecord(
  id: string,
  patch: Partial<OutgoingRecord>,
): Promise<OutgoingRecord> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
