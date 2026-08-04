"use server";

import { revalidatePath } from "next/cache";
import { equipmentInputSchema } from "../validation/equipment";
import { createEquipment, updateEquipment } from "../repositories/equipment";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseEquipmentForm(formData: FormData) {
  return equipmentInputSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description"),
  });
}

export async function createEquipmentAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseEquipmentForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createEquipment(parsed.data);
  revalidatePath("/equipment");
  return { success: true };
}

export async function updateEquipmentAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseEquipmentForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateEquipment(id, parsed.data);
  revalidatePath("/equipment");
  return { success: true };
}
