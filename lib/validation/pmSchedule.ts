import { z } from "zod";
import { MAINTENANCE_PRIORITIES, PM_FREQUENCY_UNITS } from "../constants";

const nullableUuid = () =>
  z.preprocess((value) => (value === "" ? null : value), z.string().uuid().nullable());

const nullableString = () =>
  z.preprocess((value) => (value === "" || value === undefined ? null : value), z.string().nullable());

export const pmScheduleSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  item_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  frequency_interval: z.number().int().positive(),
  frequency_unit: z.enum(PM_FREQUENCY_UNITS),
  start_date: z.string(),
  priority: z.enum(MAINTENANCE_PRIORITIES),
  default_technician_employee_id: z.string().uuid().nullable(),
  last_run_date: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const pmScheduleInputSchema = z.object({
  property_id: z.string().uuid(),
  item_id: z.string().uuid(),
  title: z.string().trim().min(1, "Schedule title is required"),
  description: z.string().trim().default(""),
  frequency_interval: z.coerce.number().int().min(1, "Frequency must be at least 1").default(1),
  frequency_unit: z.enum(PM_FREQUENCY_UNITS).default("month"),
  start_date: z.string().min(1, "Start date is required"),
  priority: z.enum(MAINTENANCE_PRIORITIES).default("medium"),
  default_technician_employee_id: nullableUuid().default(null),
  last_run_date: nullableString().default(null),
});

export type PMScheduleInput = z.infer<typeof pmScheduleInputSchema>;
