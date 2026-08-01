import { z } from "zod";
import { ITEM_STATUSES } from "../constants";

export const itemSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  building_id: z.string().uuid(),
  floor_number: z.number().int().nullable(),
  name: z.string(),
  category: z.string(),
  code: z.string(),
  quantity: z.number().int().nonnegative(),
  status: z.enum(ITEM_STATUSES),
  notes: z.string(),
  photo_drive_file_id: z.string().nullable(),
  photo_view_link: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const itemInputSchema = z.object({
  property_id: z.string().uuid(),
  building_id: z.string().uuid(),
  floor_number: z.coerce.number().int().nullable().default(null),
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().trim().default(""),
  code: z.string().trim().default(""),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or more").default(1),
  status: z.enum(ITEM_STATUSES).default("active"),
  notes: z.string().trim().default(""),
});

export type ItemInput = z.infer<typeof itemInputSchema>;
