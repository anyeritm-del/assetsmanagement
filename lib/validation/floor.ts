import { z } from "zod";
import { FLOOR_STATUSES } from "../constants";

export const floorSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  building_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  status: z.enum(FLOOR_STATUSES),
  created_at: z.string(),
  updated_at: z.string(),
});

export const floorInputSchema = z.object({
  property_id: z.string().uuid(),
  building_id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().default(""),
  status: z.enum(FLOOR_STATUSES).default("active"),
});

export type FloorInput = z.infer<typeof floorInputSchema>;
