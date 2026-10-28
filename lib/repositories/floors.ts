import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { floors } from "../db/schema";
import type { Floor } from "../types";
import type { FloorInput } from "../validation/floor";

const repository = createTableRepository(floors, "Floors");

export async function listFloors(): Promise<Floor[]> {
  return repository.list();
}

export async function listFloorsByBuilding(buildingId: string): Promise<Floor[]> {
  return repository.list(eq(floors.building_id, buildingId));
}

export async function listFloorsByProperty(propertyId: string): Promise<Floor[]> {
  return repository.list(eq(floors.property_id, propertyId));
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
