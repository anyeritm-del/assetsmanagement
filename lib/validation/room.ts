import { z } from "zod";
import { ROOM_STATUSES } from "../constants";

export const roomSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  building_id: z.string().uuid(),
  floor_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  status: z.enum(ROOM_STATUSES),
  created_at: z.string(),
  updated_at: z.string(),
});

export const roomInputSchema = z.object({
  property_id: z.string().uuid(),
  building_id: z.string().uuid(),
  floor_id: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().default(""),
  status: z.enum(ROOM_STATUSES).default("active"),
});

export type RoomInput = z.infer<typeof roomInputSchema>;
