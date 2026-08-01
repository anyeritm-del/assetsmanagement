import { z } from "zod";
import { BUILDING_STATUSES } from "../constants";

export const buildingSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  total_floor: z.number().int().nonnegative(),
  status: z.enum(BUILDING_STATUSES),
  created_at: z.string(),
  updated_at: z.string(),
});

export const buildingInputSchema = z.object({
  property_id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().default(""),
  total_floor: z.coerce.number().int().min(0, "Total floor must be 0 or more"),
  status: z.enum(BUILDING_STATUSES).default("active"),
});

export type BuildingInput = z.infer<typeof buildingInputSchema>;
