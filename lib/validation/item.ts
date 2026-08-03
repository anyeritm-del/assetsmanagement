import { z } from "zod";
import { ITEM_STATUSES, ITEM_TYPES } from "../constants";

const nullableUuid = () =>
  z.preprocess((value) => (value === "" ? null : value), z.string().uuid().nullable());

const nullableNumber = () =>
  z.preprocess((value) => (value === "" || value === undefined ? null : Number(value)), z.number().int().nullable());

const nullableString = () =>
  z.preprocess((value) => (value === "" || value === undefined ? null : value), z.string().nullable());

export const itemSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  building_id: z.string().uuid(),
  room_id: z.string().uuid().nullable(),
  department_id: z.string().uuid().nullable(),
  equipment_id: z.string().uuid().nullable(),
  article_id: z.string().uuid().nullable(),
  assigned_employee_id: z.string().uuid().nullable(),
  purchase_order_id: z.string().uuid().nullable(),
  name: z.string(),
  category: z.string(),
  code: z.string(),
  serial_number: z.string(),
  brand: z.string(),
  item_type: z.enum(ITEM_TYPES),
  quantity: z.number().int().nonnegative(),
  acquisition_value: z.number().nonnegative(),
  book_value: z.number().nonnegative(),
  lifetime_years: z.number().int().nullable(),
  end_of_lifetime_date: z.string().nullable(),
  warranty_months: z.number().int().nullable(),
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
  room_id: nullableUuid().default(null),
  department_id: nullableUuid().default(null),
  equipment_id: nullableUuid().default(null),
  article_id: nullableUuid().default(null),
  assigned_employee_id: nullableUuid().default(null),
  purchase_order_id: nullableUuid().default(null),
  name: z.string().trim().min(1, "Name is required"),
  category: z.string().trim().default(""),
  code: z.string().trim().default(""),
  serial_number: z.string().trim().default(""),
  brand: z.string().trim().default(""),
  item_type: z.enum(ITEM_TYPES).default("fixed_asset"),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or more").default(1),
  acquisition_value: z.coerce.number().min(0, "Value must be 0 or more").default(0),
  book_value: z.coerce.number().min(0, "Value must be 0 or more").default(0),
  lifetime_years: nullableNumber().default(null),
  end_of_lifetime_date: nullableString().default(null),
  warranty_months: nullableNumber().default(null),
  status: z.enum(ITEM_STATUSES).default("active"),
  notes: z.string().trim().default(""),
});

export type ItemInput = z.infer<typeof itemInputSchema>;
