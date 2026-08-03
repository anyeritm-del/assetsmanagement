import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Equipment } from "../types";
import { equipmentSchema } from "../validation/equipment";
import type { EquipmentInput } from "../validation/equipment";

const HEADERS = ["id", "code", "name", "description", "created_at", "updated_at"];

function fromRow(record: Record<string, unknown>): Equipment | null {
  const parsed = equipmentSchema.safeParse({
    id: String(record.id ?? ""),
    code: String(record.code ?? ""),
    name: String(record.name ?? ""),
    description: String(record.description ?? ""),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Equipment row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Equipment): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Equipment>({
  sheetName: "Equipment",
  headers: HEADERS,
  fromRow,
  toRow,
});

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
