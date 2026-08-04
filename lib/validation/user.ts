import { z } from "zod";
import { USER_LEVELS, USER_STATUSES } from "../constants";

const nullableUuid = () =>
  z.preprocess((value) => (value === "" ? null : value), z.string().uuid().nullable());

const booleanFromCheckbox = () =>
  z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean());

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  level: z.enum(USER_LEVELS),
  status: z.enum(USER_STATUSES),
  password_hash: z.string(),
  assigned_property_id: z.string().uuid().nullable(),
  can_manage_maintenance: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const userInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().min(1, "Email is required"),
    level: z.enum(USER_LEVELS).default("user"),
    status: z.enum(USER_STATUSES).default("active"),
    assigned_property_id: nullableUuid().default(null),
    can_manage_maintenance: booleanFromCheckbox().default(false),
  })
  .refine((data) => data.level !== "property_admin" || data.assigned_property_id !== null, {
    message: "Assigned Property is required for Property admin",
    path: ["assigned_property_id"],
  });

// Validates the raw (plaintext) password from the form, before it gets hashed. Not part of
// userInputSchema/UserInput since the entity only ever stores password_hash, never the plaintext.
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export type UserInput = z.infer<typeof userInputSchema>;
