"use server";

import { revalidatePath } from "next/cache";
import { employeeInputSchema } from "../validation/employee";
import { createEmployee, updateEmployee } from "../repositories/employees";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseEmployeeForm(formData: FormData) {
  return employeeInputSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  });
}

export async function createEmployeeAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseEmployeeForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createEmployee(parsed.data);
  revalidatePath("/employees");
  return { success: true };
}

export async function updateEmployeeAction(id: string, formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseEmployeeForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateEmployee(id, parsed.data);
  revalidatePath("/employees");
  return { success: true };
}
