"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { passwordSchema, userInputSchema } from "../validation/user";
import { createUser, updateUser } from "../repositories/users";

const SALT_ROUNDS = 10;

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseUserForm(formData: FormData) {
  return userInputSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    level: formData.get("level"),
    status: formData.get("status"),
    assigned_property_id: formData.get("assigned_property_id") || null,
  });
}

export async function createUserAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseUserForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const passwordResult = passwordSchema.safeParse(formData.get("password"));
  if (!passwordResult.success) {
    return {
      success: false,
      error: passwordResult.error.issues[0]?.message ?? "Invalid password",
    };
  }

  const passwordHash = await bcrypt.hash(passwordResult.data, SALT_ROUNDS);
  await createUser(parsed.data, passwordHash);
  revalidatePath("/users");
  return { success: true };
}

export async function updateUserAction(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseUserForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // Password is optional on edit -- only rehash if the admin actually typed a new one.
  const rawPassword = formData.get("password");
  let passwordHash: string | undefined;
  if (typeof rawPassword === "string" && rawPassword.length > 0) {
    const passwordResult = passwordSchema.safeParse(rawPassword);
    if (!passwordResult.success) {
      return {
        success: false,
        error: passwordResult.error.issues[0]?.message ?? "Invalid password",
      };
    }
    passwordHash = await bcrypt.hash(passwordResult.data, SALT_ROUNDS);
  }

  await updateUser(id, parsed.data, passwordHash);
  revalidatePath("/users");
  return { success: true };
}
