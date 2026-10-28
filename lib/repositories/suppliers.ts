import { v4 as uuidv4 } from "uuid";
import { createTableRepository } from "./tableRepository";
import { suppliers } from "../db/schema";
import type { Supplier } from "../types";
import type { SupplierInput } from "../validation/supplier";

const repository = createTableRepository(suppliers, "Suppliers");

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
