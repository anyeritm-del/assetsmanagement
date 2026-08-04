"use server";

import { revalidatePath } from "next/cache";
import { maintenanceAreaTypeInputSchema } from "../validation/maintenanceAreaType";
import {
  createMaintenanceAreaType,
  updateMaintenanceAreaType,
} from "../repositories/maintenanceAreaTypes";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseMaintenanceAreaTypeForm(formData: FormData) {
  return maintenanceAreaTypeInputSchema.safeParse({
    name: formData.get("name"),
  });
}

export async function createMaintenanceAreaTypeAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseMaintenanceAreaTypeForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createMaintenanceAreaType(parsed.data);
  revalidatePath("/maintenance-area-types");
  return { success: true };
}

export async function updateMaintenanceAreaTypeAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseMaintenanceAreaTypeForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateMaintenanceAreaType(id, parsed.data);
  revalidatePath("/maintenance-area-types");
  return { success: true };
}
