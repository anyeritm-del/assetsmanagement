import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { pmSchedules } from "../db/schema";
import type { PMSchedule } from "../types";
import type { PMScheduleInput } from "../validation/pmSchedule";

const repository = createTableRepository(pmSchedules, "PMSchedules");

export async function listPMSchedulesByProperty(propertyId: string): Promise<PMSchedule[]> {
  return repository.list(eq(pmSchedules.property_id, propertyId));
}

export async function getPMSchedule(id: string): Promise<PMSchedule | null> {
  return repository.getById(id);
}

export async function createPMSchedule(input: PMScheduleInput): Promise<PMSchedule> {
  const now = new Date().toISOString();
  const entity: PMSchedule = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updatePMSchedule(
  id: string,
  patch: Partial<PMScheduleInput>,
): Promise<PMSchedule> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
