import { v4 as uuidv4 } from "uuid";
import { createTableRepository } from "./tableRepository";
import { maintenanceCategories } from "../db/schema";
import type { MaintenanceCategory } from "../types";
import type { MaintenanceCategoryInput } from "../validation/maintenanceCategory";

const repository = createTableRepository(maintenanceCategories, "MaintenanceCategories");

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
