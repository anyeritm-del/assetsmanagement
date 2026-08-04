"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { canManageMaintenance } from "../maintenanceAuth";
import { assertCanMutate } from "../viewOnlyGuard";
import {
  maintenanceRequestAssignmentInputSchema,
  maintenanceRequestInputSchema,
  maintenanceRequestStatusInputSchema,
} from "../validation/maintenanceRequest";
import {
  createMaintenanceRequest,
  updateMaintenanceRequestAssignment,
  updateMaintenanceRequestStatus,
} from "../repositories/maintenanceRequests";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function extractPhoto(formData: FormData): File | null {
  const photo = formData.get("photo");
  return photo instanceof File && photo.size > 0 ? photo : null;
}

export async function createMaintenanceRequestAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = maintenanceRequestInputSchema.safeParse({
    property_id: formData.get("property_id"),
    department_id: formData.get("department_id"),
    requester_name: formData.get("requester_name"),
    building_id: formData.get("building_id"),
    floor_id: formData.get("floor_id") || null,
    area_type_id: formData.get("area_type_id"),
    room_number: formData.get("room_number"),
    category_id: formData.get("category_id"),
    priority: formData.get("priority"),
    item_id: formData.get("item_id") || null,
    problem: formData.get("problem"),
    description: formData.get("description"),
    requires_shutdown: formData.get("requires_shutdown"),
    requires_external_vendor: formData.get("requires_external_vendor"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not signed in" };
  }

  try {
    await createMaintenanceRequest(parsed.data, session.user.email ?? "", extractPhoto(formData));
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create maintenance request",
    };
  }
  revalidatePath("/maintenance-requests");
  return { success: true };
}

export async function updateMaintenanceRequestStatusAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  if (!(await canManageMaintenance())) {
    return { success: false, error: "You don't have permission to update maintenance requests" };
  }

  const parsed = maintenanceRequestStatusInputSchema.safeParse({
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await updateMaintenanceRequestStatus(id, parsed.data.status);
  revalidatePath("/maintenance-requests");
  revalidatePath(`/maintenance-requests/${id}`);
  revalidatePath("/my-jobs");
  return { success: true };
}

export async function updateMaintenanceRequestAssignmentAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  if (!(await canManageMaintenance())) {
    return { success: false, error: "You don't have permission to assign maintenance requests" };
  }

  const parsed = maintenanceRequestAssignmentInputSchema.safeParse({
    assigned_to_employee_id: formData.get("assigned_to_employee_id"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await updateMaintenanceRequestAssignment(id, parsed.data.assigned_to_employee_id);
  revalidatePath("/maintenance-requests");
  revalidatePath(`/maintenance-requests/${id}`);
  revalidatePath("/my-jobs");
  return { success: true };
}
