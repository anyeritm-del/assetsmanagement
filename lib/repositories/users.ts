import { v4 as uuidv4 } from "uuid";
import { sql } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { users } from "../db/schema";
import type { User } from "../types";
import type { UserInput } from "../validation/user";

const repository = createTableRepository(users, "Users");

export async function listUsers(): Promise<User[]> {
  return repository.list();
}

export async function getUser(id: string): Promise<User | null> {
  return repository.getById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // Emails are stored trimmed (input schemas trim them), so lower() alone matches the
  // users_email index.
  const rows = await repository.list(sql`lower(${users.email}) = ${email.trim().toLowerCase()}`);
  return rows[0] ?? null;
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
