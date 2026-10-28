import { v4 as uuidv4 } from "uuid";
import { createTableRepository } from "./tableRepository";
import { maintenanceAreaTypes } from "../db/schema";
import type { MaintenanceAreaType } from "../types";
import type { MaintenanceAreaTypeInput } from "../validation/maintenanceAreaType";

const repository = createTableRepository(maintenanceAreaTypes, "MaintenanceAreaTypes");

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
