import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { PMSchedule } from "../types";
import { pmScheduleSchema } from "../validation/pmSchedule";
import type { PMScheduleInput } from "../validation/pmSchedule";

const HEADERS = [
  "id",
  "property_id",
  "item_id",
  "title",
  "description",
  "frequency_interval",
  "frequency_unit",
  "start_date",
  "priority",
  "default_technician_employee_id",
  "last_run_date",
  "created_at",
  "updated_at",
];

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

function fromRow(record: Record<string, unknown>): PMSchedule | null {
  const parsed = pmScheduleSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    item_id: String(record.item_id ?? ""),
    title: String(record.title ?? ""),
    description: String(record.description ?? ""),
    frequency_interval: Number(record.frequency_interval ?? 1),
    frequency_unit: record.frequency_unit || "month",
    start_date: String(record.start_date ?? ""),
    priority: record.priority || "medium",
    default_technician_employee_id: toNullableString(record.default_technician_employee_id),
    last_run_date: toNullableString(record.last_run_date),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed PMSchedules row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: PMSchedule): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<PMSchedule>({
  sheetName: "PMSchedules",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listPMSchedulesByProperty(propertyId: string): Promise<PMSchedule[]> {
  const all = await repository.list();
  return all.filter((schedule) => schedule.property_id === propertyId);
}

export async function getPMSchedule(id: string): Promise<PMSchedule | null> {
  return repository.getById(id);
}

export async function createPMSchedule(input: PMScheduleInput): Promise<PMSchedule> {
  const now = new Date().toISOString();
  const entity: PMSchedule = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updatePMSchedule(
  id: string,
  patch: Partial<PMScheduleInput>,
): Promise<PMSchedule> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
