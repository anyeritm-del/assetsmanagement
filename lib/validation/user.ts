import { z } from "zod";
import { USER_LEVELS, USER_STATUSES } from "../constants";

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  level: z.enum(USER_LEVELS),
  status: z.enum(USER_STATUSES),
  password_hash: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const userInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required"),
  level: z.enum(USER_LEVELS).default("user"),
  status: z.enum(USER_STATUSES).default("active"),
});

// Validates the raw (plaintext) password from the form, before it gets hashed. Not part of
// userInputSchema/UserInput since the entity only ever stores password_hash, never the plaintext.
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export type UserInput = z.infer<typeof userInputSchema>;
