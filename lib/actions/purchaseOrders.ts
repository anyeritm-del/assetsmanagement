"use server";

import { revalidatePath } from "next/cache";
import { purchaseOrderInputSchema } from "../validation/purchaseOrder";
import { createPurchaseOrder, updatePurchaseOrder } from "../repositories/purchaseOrders";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parsePurchaseOrderForm(formData: FormData) {
  return purchaseOrderInputSchema.safeParse({
    property_id: formData.get("property_id"),
    supplier_id: formData.get("supplier_id") || null,
    received_date: formData.get("received_date"),
    purchase_number: formData.get("purchase_number"),
    title: formData.get("title"),
    value: formData.get("value"),
    description: formData.get("description"),
    quantity: formData.get("quantity"),
  });
}

function extractPhoto(formData: FormData): File | null {
  const photo = formData.get("photo");
  return photo instanceof File && photo.size > 0 ? photo : null;
}

export async function createPurchaseOrderAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parsePurchaseOrderForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await createPurchaseOrder(parsed.data, extractPhoto(formData));
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create purchase order",
    };
  }
  revalidatePath("/purchase-orders");
  return { success: true };
}

export async function updatePurchaseOrderAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parsePurchaseOrderForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await updatePurchaseOrder(id, parsed.data, extractPhoto(formData));
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update purchase order",
    };
  }
  revalidatePath("/purchase-orders");
  return { success: true };
}
