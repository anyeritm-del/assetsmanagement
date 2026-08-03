import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Employee } from "../types";
import { employeeSchema } from "../validation/employee";
import type { EmployeeInput } from "../validation/employee";

const HEADERS = ["id", "name", "email", "created_at", "updated_at"];

function fromRow(record: Record<string, unknown>): Employee | null {
  const parsed = employeeSchema.safeParse({
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    email: String(record.email ?? ""),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Employees row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Employee): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Employee>({
  sheetName: "Employees",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listEmployees(): Promise<Employee[]> {
  return repository.list();
}

export async function getEmployee(id: string): Promise<Employee | null> {
  return repository.getById(id);
}

export async function getEmployeeByEmail(email: string): Promise<Employee | null> {
  const all = await repository.list();
  const normalized = email.trim().toLowerCase();
  return all.find((employee) => employee.email.trim().toLowerCase() === normalized) ?? null;
}

export async function createEmployee(input: EmployeeInput): Promise<Employee> {
  const now = new Date().toISOString();
  const entity: Employee = { id: uuidv4(), ...input, created_at: now, updated_at: now };
  return repository.create(entity);
}

export async function updateEmployee(
  id: string,
  patch: Partial<EmployeeInput>,
): Promise<Employee> {
  return repository.update(id, { ...patch, updated_at: new Date().toISOString() });
}
