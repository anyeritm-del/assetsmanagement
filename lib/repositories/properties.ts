import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { properties } from "../db/schema";
import type { Property } from "../types";
import type { PropertyInput } from "../validation/property";

const repository = createTableRepository(properties, "Properties");

export async function listProperties(): Promise<Property[]> {
  return repository.list();
}

export async function listActiveProperties(): Promise<Property[]> {
  return repository.list(eq(properties.status, "active"));
}

export async function getProperty(id: string): Promise<Property | null> {
  return repository.getById(id);
}

export async function createProperty(input: PropertyInput): Promise<Property> {
  const now = new Date().toISOString();
  const entity: Property = {
    id: uuidv4(),
    ...input,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updateProperty(
  id: string,
  patch: Partial<PropertyInput>,
): Promise<Property> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
