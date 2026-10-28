import { v4 as uuidv4 } from "uuid";
import { createTableRepository } from "./tableRepository";
import { departments } from "../db/schema";
import type { Department } from "../types";
import type { DepartmentInput } from "../validation/department";

const repository = createTableRepository(departments, "Departments");

export async function listDepartments(): Promise<Department[]> {
  return repository.list();
}

export async function getDepartment(id: string): Promise<Department | null> {
  return repository.getById(id);
}

export async function createDepartment(input: DepartmentInput): Promise<Department> {
  const now = new Date().toISOString();
  const entity: Department = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updateDepartment(
  id: string,
  patch: Partial<DepartmentInput>,
): Promise<Department> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
