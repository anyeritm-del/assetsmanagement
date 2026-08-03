import { z } from "zod";

export const maintenanceAreaTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const maintenanceAreaTypeInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type MaintenanceAreaTypeInput = z.infer<typeof maintenanceAreaTypeInputSchema>;
