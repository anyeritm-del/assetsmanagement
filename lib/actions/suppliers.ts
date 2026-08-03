"use server";

import { revalidatePath } from "next/cache";
import { supplierInputSchema } from "../validation/supplier";
import { createSupplier, updateSupplier } from "../repositories/suppliers";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseSupplierForm(formData: FormData) {
  return supplierInputSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    description: formData.get("description"),
  });
}

export async function createSupplierAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseSupplierForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createSupplier(parsed.data);
  revalidatePath("/suppliers");
  return { success: true };
}

export async function updateSupplierAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseSupplierForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateSupplier(id, parsed.data);
  revalidatePath("/suppliers");
  return { success: true };
}
