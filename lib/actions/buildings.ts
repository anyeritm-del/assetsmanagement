"use server";

import { revalidatePath } from "next/cache";
import { buildingInputSchema } from "../validation/building";
import { createBuilding, updateBuilding } from "../repositories/buildings";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseBuildingForm(formData: FormData) {
  return buildingInputSchema.safeParse({
    property_id: formData.get("property_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    total_floor: formData.get("total_floor"),
    status: formData.get("status"),
  });
}

export async function createBuildingAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseBuildingForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createBuilding(parsed.data);
  revalidatePath("/location");
  return { success: true };
}

export async function updateBuildingAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseBuildingForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateBuilding(id, parsed.data);
  revalidatePath("/location");
  return { success: true };
}
