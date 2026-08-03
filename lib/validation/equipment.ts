import { z } from "zod";

export const equipmentSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const equipmentInputSchema = z.object({
  code: z.string().trim().default(""),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().default(""),
});

export type EquipmentInput = z.infer<typeof equipmentInputSchema>;
