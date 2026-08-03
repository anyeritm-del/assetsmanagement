import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { MaintenanceCategory } from "../types";
import { maintenanceCategorySchema } from "../validation/maintenanceCategory";
import type { MaintenanceCategoryInput } from "../validation/maintenanceCategory";

const HEADERS = ["id", "name", "created_at", "updated_at"];

function fromRow(record: Record<string, unknown>): MaintenanceCategory | null {
  const parsed = maintenanceCategorySchema.safeParse({
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed MaintenanceCategories row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: MaintenanceCategory): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<MaintenanceCategory>({
  sheetName: "MaintenanceCategories",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listMaintenanceCategories(): Promise<MaintenanceCategory[]> {
  return repository.list();
}

export async function getMaintenanceCategory(id: string): Promise<MaintenanceCategory | null> {
  return repository.getById(id);
}

export async function createMaintenanceCategory(
  input: MaintenanceCategoryInput,
): Promise<MaintenanceCategory> {
  const now = new Date().toISOString();
  const entity: MaintenanceCategory = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updateMaintenanceCategory(
  id: string,
  patch: Partial<MaintenanceCategoryInput>,
): Promise<MaintenanceCategory> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
