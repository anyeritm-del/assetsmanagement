"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { canManageMaintenance } from "../maintenanceAuth";
import { pmScheduleInputSchema } from "../validation/pmSchedule";
import { createPMSchedule, listPMSchedulesByProperty, updatePMSchedule } from "../repositories/pmSchedules";
import {
  createMaintenanceRequestFromSchedule,
  listMaintenanceRequestsByProperty,
} from "../repositories/maintenanceRequests";
import { getItem } from "../repositories/items";
import { getRoom } from "../repositories/rooms";
import { getPMScheduleDueStatus } from "../pmScheduleStatus";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parsePMScheduleForm(formData: FormData) {
  return pmScheduleInputSchema.safeParse({
    property_id: formData.get("property_id"),
    item_id: formData.get("item_id"),
    title: formData.get("title"),
    description: formData.get("description"),
    frequency_interval: formData.get("frequency_interval"),
    frequency_unit: formData.get("frequency_unit"),
    start_date: formData.get("start_date"),
    priority: formData.get("priority"),
    default_technician_employee_id: formData.get("default_technician_employee_id") || null,
    last_run_date: formData.get("last_run_date") || null,
  });
}

export async function createPMScheduleAction(formData: FormData): Promise<ActionResult> {
  const parsed = parsePMScheduleForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createPMSchedule(parsed.data);
  revalidatePath("/preventive-maintenance");
  return { success: true };
}

export async function updatePMScheduleAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parsePMScheduleForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updatePMSchedule(id, parsed.data);
  revalidatePath("/preventive-maintenance");
  return { success: true };
}

export interface RunPMCheckResult extends ActionResult {
  createdCount?: number;
  skippedCount?: number;
}

export async function runPMCheckAction(propertyId: string): Promise<RunPMCheckResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not signed in" };
  }
  if (!(await canManageMaintenance())) {
    return { success: false, error: "You don't have permission to run PM Check" };
  }

  const [schedules, existingRequests] = await Promise.all([
    listPMSchedulesByProperty(propertyId),
    listMaintenanceRequestsByProperty(propertyId),
  ]);

  const dueSchedules = schedules.filter(
    (schedule) => getPMScheduleDueStatus(schedule) !== "upcoming",
  );

  let createdCount = 0;
  let skippedCount = 0;

  // Sequential, not Promise.all: keeps this simple and avoids piling up many concurrent Drive/Sheets
  // writes for a single click -- PM check runs are infrequent and schedule counts are small.
  for (const schedule of dueSchedules) {
    const hasOpenTicket = existingRequests.some(
      (request) =>
        request.pm_schedule_id === schedule.id &&
        (request.status === "open" || request.status === "in_progress"),
    );
    if (hasOpenTicket) {
      skippedCount += 1;
      continue;
    }

    const item = await getItem(schedule.item_id);
    if (!item) {
      skippedCount += 1;
      continue;
    }
    const room = item.room_id ? await getRoom(item.room_id) : null;

    await createMaintenanceRequestFromSchedule({
      property_id: propertyId,
      pm_schedule_id: schedule.id,
      item_id: item.id,
      building_id: item.building_id,
      floor_id: room?.floor_id ?? null,
      room_number: room?.name ?? "",
      priority: schedule.priority,
      problem: schedule.title,
      description: schedule.description,
      requester_name: session.user.name ?? session.user.email ?? "Preventive Maintenance",
      requester_email: session.user.email ?? "",
      assigned_to_employee_id: schedule.default_technician_employee_id,
    });
    createdCount += 1;
  }

  revalidatePath("/preventive-maintenance");
  revalidatePath("/maintenance-requests");
  return { success: true, createdCount, skippedCount };
}
