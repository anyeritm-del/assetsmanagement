import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Property } from "../types";
import { propertySchema } from "../validation/property";
import type { PropertyInput } from "../validation/property";

const HEADERS = ["id", "name", "code", "status", "created_at", "updated_at"];

function fromRow(record: Record<string, unknown>): Property | null {
  const parsed = propertySchema.safeParse({
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    code: String(record.code ?? ""),
    status: record.status || "active",
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Properties row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Property): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Property>({
  sheetName: "Properties",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listProperties(): Promise<Property[]> {
  return repository.list();
}

export async function listActiveProperties(): Promise<Property[]> {
  const all = await repository.list();
  return all.filter((property) => property.status === "active");
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
