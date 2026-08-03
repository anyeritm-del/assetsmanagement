import { z } from "zod";
import { MAINTENANCE_PRIORITIES, MAINTENANCE_REQUEST_STATUSES } from "../constants";

const nullableUuid = () =>
  z.preprocess((value) => (value === "" ? null : value), z.string().uuid().nullable());

const booleanFromCheckbox = () =>
  z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean());

export const maintenanceRequestSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  department_id: z.string().uuid().nullable(),
  requester_name: z.string(),
  requester_email: z.string(),
  building_id: z.string().uuid(),
  floor_id: z.string().uuid().nullable(),
  area_type_id: z.string().uuid().nullable(),
  room_number: z.string(),
  category_id: z.string().uuid().nullable(),
  priority: z.enum(MAINTENANCE_PRIORITIES),
  item_id: z.string().uuid().nullable(),
  problem: z.string(),
  description: z.string(),
  requires_shutdown: z.boolean(),
  requires_external_vendor: z.boolean(),
  status: z.enum(MAINTENANCE_REQUEST_STATUSES),
  photo_drive_file_id: z.string().nullable(),
  photo_view_link: z.string().nullable(),
  pm_schedule_id: z.string().uuid().nullable(),
  assigned_to_employee_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const maintenanceRequestInputSchema = z.object({
  property_id: z.string().uuid(),
  department_id: z.string().uuid(),
  requester_name: z.string().trim().min(1, "Requester is required"),
  building_id: z.string().uuid(),
  floor_id: nullableUuid().default(null),
  area_type_id: z.string().uuid(),
  room_number: z.string().trim().default(""),
  category_id: z.string().uuid(),
  priority: z.enum(MAINTENANCE_PRIORITIES).default("medium"),
  item_id: nullableUuid().default(null),
  problem: z.string().trim().min(1, "Problem / issue is required"),
  description: z.string().trim().default(""),
  requires_shutdown: booleanFromCheckbox().default(false),
  requires_external_vendor: booleanFromCheckbox().default(false),
});

export type MaintenanceRequestInput = z.infer<typeof maintenanceRequestInputSchema>;

export const maintenanceRequestStatusInputSchema = z.object({
  status: z.enum(MAINTENANCE_REQUEST_STATUSES),
});

export type MaintenanceRequestStatusInput = z.infer<typeof maintenanceRequestStatusInputSchema>;

export const maintenanceRequestAssignmentInputSchema = z.object({
  assigned_to_employee_id: nullableUuid().default(null),
});

export type MaintenanceRequestAssignmentInput = z.infer<
  typeof maintenanceRequestAssignmentInputSchema
>;
