import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { maintenanceRequests } from "../db/schema";
import type { MaintenanceRequest } from "../types";
import type { MaintenanceRequestInput } from "../validation/maintenanceRequest";
import { uploadPhoto } from "../google/uploadPhoto";

const repository = createTableRepository(maintenanceRequests, "MaintenanceRequests");

export async function listAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  return repository.list();
}

export async function listMaintenanceRequestsByProperty(
  propertyId: string,
): Promise<MaintenanceRequest[]> {
  return repository.list(eq(maintenanceRequests.property_id, propertyId));
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

// createMaintenanceRequest always stamps created_at/updated_at as "now" -- this lets seed scripts
// backdate a request afterward so demo history doesn't look like everything happened today.
export async function backdateMaintenanceRequest(
  id: string,
  patch: Partial<Pick<MaintenanceRequest, "status" | "created_at" | "updated_at">>,
): Promise<MaintenanceRequest> {
  return repository.update(id, patch);
}
