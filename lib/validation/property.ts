import { z } from "zod";
import { PROPERTY_STATUSES } from "../constants";

export const propertySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  status: z.enum(PROPERTY_STATUSES),
  created_at: z.string(),
  updated_at: z.string(),
});

export const propertyInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .regex(/^[a-z0-9-]+$/, "Code must be lowercase letters, numbers, and hyphens only"),
  status: z.enum(PROPERTY_STATUSES).default("active"),
});

export type PropertyInput = z.infer<typeof propertyInputSchema>;
