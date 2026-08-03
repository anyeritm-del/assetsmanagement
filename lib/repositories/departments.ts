import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Department } from "../types";
import { departmentSchema } from "../validation/department";
import type { DepartmentInput } from "../validation/department";

const HEADERS = ["id", "code", "name", "created_at", "updated_at"];

function fromRow(record: Record<string, unknown>): Department | null {
  const parsed = departmentSchema.safeParse({
    id: String(record.id ?? ""),
    code: String(record.code ?? ""),
    name: String(record.name ?? ""),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Departments row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Department): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Department>({
  sheetName: "Departments",
  headers: HEADERS,
  fromRow,
  toRow,
});

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
