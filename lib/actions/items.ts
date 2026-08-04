"use server";

import { revalidatePath } from "next/cache";
import { itemInputSchema } from "../validation/item";
import { createItem, updateItem } from "../repositories/items";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseItemForm(formData: FormData) {
  return itemInputSchema.safeParse({
    property_id: formData.get("property_id"),
    building_id: formData.get("building_id"),
    room_id: formData.get("room_id") || null,
    department_id: formData.get("department_id") || null,
    equipment_id: formData.get("equipment_id") || null,
    article_id: formData.get("article_id") || null,
    assigned_employee_id: formData.get("assigned_employee_id") || null,
    purchase_order_id: formData.get("purchase_order_id") || null,
    name: formData.get("name"),
    category: formData.get("category"),
    code: formData.get("code"),
    serial_number: formData.get("serial_number"),
    brand: formData.get("brand"),
    item_type: formData.get("item_type"),
    quantity: formData.get("quantity"),
    acquisition_value: formData.get("acquisition_value"),
    book_value: formData.get("book_value"),
    lifetime_years: formData.get("lifetime_years") || null,
    end_of_lifetime_date: formData.get("end_of_lifetime_date") || null,
    warranty_months: formData.get("warranty_months") || null,
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
}

function extractPhoto(formData: FormData): File | null {
  const photo = formData.get("photo");
  return photo instanceof File && photo.size > 0 ? photo : null;
}

export async function createItemAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseItemForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await createItem(parsed.data, extractPhoto(formData));
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to create item" };
  }
  revalidatePath("/items");
  return { success: true };
}

export async function updateItemAction(id: string, formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parseItemForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await updateItem(id, parsed.data, extractPhoto(formData));
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to update item" };
  }
  revalidatePath("/items");
  return { success: true };
}
