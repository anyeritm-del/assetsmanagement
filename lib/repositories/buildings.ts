import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { buildings } from "../db/schema";
import type { Building } from "../types";
import type { BuildingInput } from "../validation/building";

const repository = createTableRepository(buildings, "Buildings");

export async function listBuildings(): Promise<Building[]> {
  return repository.list();
}

export async function listBuildingsByProperty(propertyId: string): Promise<Building[]> {
  return repository.list(eq(buildings.property_id, propertyId));
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
