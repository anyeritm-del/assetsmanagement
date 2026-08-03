import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Supplier } from "../types";
import { supplierSchema } from "../validation/supplier";
import type { SupplierInput } from "../validation/supplier";

// "description" is appended at the end (rather than inserted after "address") so an
// already-created Suppliers sheet only needs one new column added, not a re-ordering.
const HEADERS = [
  "id",
  "name",
  "email",
  "phone",
  "address",
  "created_at",
  "updated_at",
  "description",
];

function fromRow(record: Record<string, unknown>): Supplier | null {
  const parsed = supplierSchema.safeParse({
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    email: String(record.email ?? ""),
    phone: String(record.phone ?? ""),
    address: String(record.address ?? ""),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
    description: String(record.description ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Suppliers row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Supplier): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Supplier>({
  sheetName: "Suppliers",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listSuppliers(): Promise<Supplier[]> {
  return repository.list();
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  return repository.getById(id);
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const now = new Date().toISOString();
  const entity: Supplier = {
    id: uuidv4(),
    ...input,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updateSupplier(
  id: string,
  patch: Partial<SupplierInput>,
): Promise<Supplier> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
