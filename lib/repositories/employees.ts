import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { employees } from "../db/schema";
import type { Employee } from "../types";
import type { EmployeeInput } from "../validation/employee";

const repository = createTableRepository(employees, "Employees");

export async function listEmployees(): Promise<Employee[]> {
  return repository.list();
}

export async function getEmployee(id: string): Promise<Employee | null> {
  return repository.getById(id);
}

export async function getEmployeeByEmail(email: string): Promise<Employee | null> {
  // Emails are stored trimmed (input schemas trim them), so lower() alone matches the
  // employees_email index.
  const rows = await repository.list(sql`lower(${employees.email}) = ${email.trim().toLowerCase()}`);
  return rows[0] ?? null;
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
