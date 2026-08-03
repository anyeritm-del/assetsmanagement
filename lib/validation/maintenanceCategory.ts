import { z } from "zod";

export const maintenanceCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const maintenanceCategoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type MaintenanceCategoryInput = z.infer<typeof maintenanceCategoryInputSchema>;
