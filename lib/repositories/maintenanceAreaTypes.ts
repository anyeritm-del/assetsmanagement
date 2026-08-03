import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { MaintenanceAreaType } from "../types";
import { maintenanceAreaTypeSchema } from "../validation/maintenanceAreaType";
import type { MaintenanceAreaTypeInput } from "../validation/maintenanceAreaType";

const HEADERS = ["id", "name", "created_at", "updated_at"];

function fromRow(record: Record<string, unknown>): MaintenanceAreaType | null {
  const parsed = maintenanceAreaTypeSchema.safeParse({
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed MaintenanceAreaTypes row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: MaintenanceAreaType): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<MaintenanceAreaType>({
  sheetName: "MaintenanceAreaTypes",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listMaintenanceAreaTypes(): Promise<MaintenanceAreaType[]> {
  return repository.list();
}

export async function getMaintenanceAreaType(id: string): Promise<MaintenanceAreaType | null> {
  return repository.getById(id);
}

export async function createMaintenanceAreaType(
  input: MaintenanceAreaTypeInput,
): Promise<MaintenanceAreaType> {
  const now = new Date().toISOString();
  const entity: MaintenanceAreaType = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updateMaintenanceAreaType(
  id: string,
  patch: Partial<MaintenanceAreaTypeInput>,
): Promise<MaintenanceAreaType> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
