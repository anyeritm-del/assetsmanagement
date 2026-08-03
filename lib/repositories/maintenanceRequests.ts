import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { MaintenanceRequest } from "../types";
import { maintenanceRequestSchema } from "../validation/maintenanceRequest";
import type { MaintenanceRequestInput } from "../validation/maintenanceRequest";
import { uploadPhoto } from "../google/uploadPhoto";

const HEADERS = [
  "id",
  "property_id",
  "department_id",
  "requester_name",
  "requester_email",
  "building_id",
  "floor_id",
  "area_type_id",
  "room_number",
  "category_id",
  "priority",
  "item_id",
  "problem",
  "description",
  "requires_shutdown",
  "requires_external_vendor",
  "status",
  "photo_drive_file_id",
  "photo_view_link",
  "created_at",
  "updated_at",
  // Appended at the end (rather than inserted near department_id/category_id/area_type_id above)
  // so an already-created MaintenanceRequests sheet only needs a column added, not reordered.
  "pm_schedule_id",
  "assigned_to_employee_id",
];

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

function toBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === "TRUE" || value === 1 || value === "1";
}

function fromRow(record: Record<string, unknown>): MaintenanceRequest | null {
  const parsed = maintenanceRequestSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    department_id: toNullableString(record.department_id),
    requester_name: String(record.requester_name ?? ""),
    requester_email: String(record.requester_email ?? ""),
    building_id: String(record.building_id ?? ""),
    floor_id: toNullableString(record.floor_id),
    area_type_id: toNullableString(record.area_type_id),
    room_number: String(record.room_number ?? ""),
    category_id: toNullableString(record.category_id),
    priority: record.priority || "medium",
    item_id: toNullableString(record.item_id),
    problem: String(record.problem ?? ""),
    description: String(record.description ?? ""),
    requires_shutdown: toBoolean(record.requires_shutdown),
    requires_external_vendor: toBoolean(record.requires_external_vendor),
    status: record.status || "open",
    photo_drive_file_id: toNullableString(record.photo_drive_file_id),
    photo_view_link: toNullableString(record.photo_view_link),
    pm_schedule_id: toNullableString(record.pm_schedule_id),
    assigned_to_employee_id: toNullableString(record.assigned_to_employee_id),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed MaintenanceRequests row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: MaintenanceRequest): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<MaintenanceRequest>({
  sheetName: "MaintenanceRequests",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  return repository.list();
}

export async function listMaintenanceRequestsByProperty(
  propertyId: string,
): Promise<MaintenanceRequest[]> {
  const all = await repository.list();
  return all.filter((request) => request.property_id === propertyId);
}

export async function getMaintenanceRequest(id: string): Promise<MaintenanceRequest | null> {
  return repository.getById(id);
}

export async function createMaintenanceRequest(
  input: MaintenanceRequestInput,
  requesterEmail: string,
  photo?: File | null,
): Promise<MaintenanceRequest> {
  const id = uuidv4();
  const now = new Date().toISOString();

  let photoDriveFileId: string | null = null;
  let photoViewLink: string | null = null;
  if (photo && photo.size > 0) {
    const uploaded = await uploadPhoto(id, photo);
    photoDriveFileId = uploaded.driveFileId;
    photoViewLink = uploaded.webViewLink;
  }

  const entity: MaintenanceRequest = {
    id,
    ...input,
    requester_email: requesterEmail,
    status: "open",
    photo_drive_file_id: photoDriveFileId,
    photo_view_link: photoViewLink,
    pm_schedule_id: null,
    assigned_to_employee_id: null,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export interface AutoMaintenanceRequestInput {
  property_id: string;
  pm_schedule_id: string;
  item_id: string;
  building_id: string;
  floor_id: string | null;
  room_number: string;
  priority: MaintenanceRequest["priority"];
  problem: string;
  description: string;
  requester_name: string;
  requester_email: string;
  assigned_to_employee_id: string | null;
}

// Bypasses maintenanceRequestInputSchema (which requires department/category/area-type for the
// human-filed form) since "Run PM Check" only knows the asset -- those fields are left null for
// staff to fill in during triage.
export async function createMaintenanceRequestFromSchedule(
  input: AutoMaintenanceRequestInput,
): Promise<MaintenanceRequest> {
  const now = new Date().toISOString();
  const entity: MaintenanceRequest = {
    id: uuidv4(),
    property_id: input.property_id,
    department_id: null,
    requester_name: input.requester_name,
    requester_email: input.requester_email,
    building_id: input.building_id,
    floor_id: input.floor_id,
    area_type_id: null,
    room_number: input.room_number,
    category_id: null,
    priority: input.priority,
    item_id: input.item_id,
    problem: input.problem,
    description: input.description,
    requires_shutdown: false,
    requires_external_vendor: false,
    status: "open",
    photo_drive_file_id: null,
    photo_view_link: null,
    pm_schedule_id: input.pm_schedule_id,
    assigned_to_employee_id: input.assigned_to_employee_id,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updateMaintenanceRequestStatus(
  id: string,
  status: MaintenanceRequest["status"],
): Promise<MaintenanceRequest> {
  return repository.update(id, { status, updated_at: new Date().toISOString() });
}

export async function updateMaintenanceRequestAssignment(
  id: string,
  assignedToEmployeeId: string | null,
): Promise<MaintenanceRequest> {
  return repository.update(id, {
    assigned_to_employee_id: assignedToEmployeeId,
    updated_at: new Date().toISOString(),
  });
}
