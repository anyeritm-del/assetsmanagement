"use server";

import { revalidatePath } from "next/cache";
import { floorInputSchema } from "../validation/floor";
import { createFloor, updateFloor } from "../repositories/floors";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseFloorForm(formData: FormData) {
  return floorInputSchema.safeParse({
    property_id: formData.get("property_id"),
    building_id: formData.get("building_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
  });
}

export async function createFloorAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseFloorForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createFloor(parsed.data);
  revalidatePath(`/location/${parsed.data.building_id}/floors`);
  return { success: true };
}

export async function updateFloorAction(id: string, formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseFloorForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateFloor(id, parsed.data);
  revalidatePath(`/location/${parsed.data.building_id}/floors`);
  return { success: true };
}
