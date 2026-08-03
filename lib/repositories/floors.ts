import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Floor } from "../types";
import { floorSchema } from "../validation/floor";
import type { FloorInput } from "../validation/floor";

const HEADERS = [
  "id",
  "property_id",
  "building_id",
  "name",
  "description",
  "status",
  "created_at",
  "updated_at",
];

function fromRow(record: Record<string, unknown>): Floor | null {
  const parsed = floorSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    building_id: String(record.building_id ?? ""),
    name: String(record.name ?? ""),
    description: String(record.description ?? ""),
    status: record.status || "active",
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Floors row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Floor): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Floor>({
  sheetName: "Floors",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listFloors(): Promise<Floor[]> {
  return repository.list();
}

export async function listFloorsByBuilding(buildingId: string): Promise<Floor[]> {
  const all = await repository.list();
  return all.filter((floor) => floor.building_id === buildingId);
}

export async function listFloorsByProperty(propertyId: string): Promise<Floor[]> {
  const all = await repository.list();
  return all.filter((floor) => floor.property_id === propertyId);
}

export async function getFloor(id: string): Promise<Floor | null> {
  return repository.getById(id);
}

export async function createFloor(input: FloorInput): Promise<Floor> {
  const now = new Date().toISOString();
  const entity: Floor = {
    id: uuidv4(),
    ...input,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updateFloor(id: string, patch: Partial<FloorInput>): Promise<Floor> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
