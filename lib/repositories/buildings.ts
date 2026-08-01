import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Building } from "../types";
import { buildingSchema } from "../validation/building";
import type { BuildingInput } from "../validation/building";

const HEADERS = [
  "id",
  "property_id",
  "name",
  "description",
  "total_floor",
  "status",
  "created_at",
  "updated_at",
];

function fromRow(record: Record<string, unknown>): Building | null {
  const parsed = buildingSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    name: String(record.name ?? ""),
    description: String(record.description ?? ""),
    total_floor: Number(record.total_floor ?? 0),
    status: record.status || "active",
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Buildings row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Building): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Building>({
  sheetName: "Buildings",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listBuildings(): Promise<Building[]> {
  return repository.list();
}

export async function listBuildingsByProperty(propertyId: string): Promise<Building[]> {
  const all = await repository.list();
  return all.filter((building) => building.property_id === propertyId);
}

export async function getBuilding(id: string): Promise<Building | null> {
  return repository.getById(id);
}

export async function createBuilding(input: BuildingInput): Promise<Building> {
  const now = new Date().toISOString();
  const entity: Building = {
    id: uuidv4(),
    ...input,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updateBuilding(
  id: string,
  patch: Partial<BuildingInput>,
): Promise<Building> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
