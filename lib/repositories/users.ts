import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { User } from "../types";
import { userSchema } from "../validation/user";
import type { UserInput } from "../validation/user";

const HEADERS = [
  "id",
  "name",
  "email",
  "level",
  "status",
  "password_hash",
  "created_at",
  "updated_at",
  // Appended at the end so an already-created Users sheet only needs a column added.
  "assigned_property_id",
  "can_manage_maintenance",
];

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

function toBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "TRUE" || value === 1 || value === "1";
}

function fromRow(record: Record<string, unknown>): User | null {
  const parsed = userSchema.safeParse({
    id: String(record.id ?? ""),
    name: String(record.name ?? ""),
    email: String(record.email ?? ""),
    level: record.level || "user",
    status: record.status || "active",
    password_hash: String(record.password_hash ?? ""),
    assigned_property_id: toNullableString(record.assigned_property_id),
    can_manage_maintenance: toBoolean(record.can_manage_maintenance),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Users row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: User): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<User>({
  sheetName: "Users",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listUsers(): Promise<User[]> {
  return repository.list();
}

export async function getUser(id: string): Promise<User | null> {
  return repository.getById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const all = await repository.list();
  const normalized = email.trim().toLowerCase();
  return all.find((user) => user.email.trim().toLowerCase() === normalized) ?? null;
}

export async function createUser(input: UserInput, passwordHash: string): Promise<User> {
  const now = new Date().toISOString();
  const entity: User = {
    id: uuidv4(),
    ...input,
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updateUser(
  id: string,
  patch: Partial<UserInput>,
  passwordHash?: string,
): Promise<User> {
  const updates: Partial<User> = { ...patch, updated_at: new Date().toISOString() };
  if (passwordHash) {
    updates.password_hash = passwordHash;
  }
  return repository.update(id, updates);
}
