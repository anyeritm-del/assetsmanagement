import { v4 as uuidv4 } from "uuid";
import { createTableRepository } from "./tableRepository";
import { equipment } from "../db/schema";
import type { Equipment } from "../types";
import type { EquipmentInput } from "../validation/equipment";

const repository = createTableRepository(equipment, "Equipment");

export async function listEquipment(): Promise<Equipment[]> {
  return repository.list();
}

export async function getEquipment(id: string): Promise<Equipment | null> {
  return repository.getById(id);
}

export async function createEquipment(input: EquipmentInput): Promise<Equipment> {
  const now = new Date().toISOString();
  const entity: Equipment = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updateEquipment(
  id: string,
  patch: Partial<EquipmentInput>,
): Promise<Equipment> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
