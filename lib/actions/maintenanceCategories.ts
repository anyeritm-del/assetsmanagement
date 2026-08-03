"use server";

import { revalidatePath } from "next/cache";
import { maintenanceCategoryInputSchema } from "../validation/maintenanceCategory";
import {
  createMaintenanceCategory,
  updateMaintenanceCategory,
} from "../repositories/maintenanceCategories";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseMaintenanceCategoryForm(formData: FormData) {
  return maintenanceCategoryInputSchema.safeParse({
    name: formData.get("name"),
  });
}

export async function createMaintenanceCategoryAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseMaintenanceCategoryForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createMaintenanceCategory(parsed.data);
  revalidatePath("/maintenance-categories");
  return { success: true };
}

export async function updateMaintenanceCategoryAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseMaintenanceCategoryForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateMaintenanceCategory(id, parsed.data);
  revalidatePath("/maintenance-categories");
  return { success: true };
}
