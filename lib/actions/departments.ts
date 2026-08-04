"use server";

import { revalidatePath } from "next/cache";
import { departmentInputSchema } from "../validation/department";
import { createDepartment, updateDepartment } from "../repositories/departments";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseDepartmentForm(formData: FormData) {
  return departmentInputSchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
  });
}

export async function createDepartmentAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseDepartmentForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createDepartment(parsed.data);
  revalidatePath("/departments");
  return { success: true };
}

export async function updateDepartmentAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseDepartmentForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateDepartment(id, parsed.data);
  revalidatePath("/departments");
  return { success: true };
}
