"use server";

import { revalidatePath } from "next/cache";
import { itemInputSchema } from "../validation/item";
import { createItem, updateItem } from "../repositories/items";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseItemForm(formData: FormData) {
  return itemInputSchema.safeParse({
    property_id: formData.get("property_id"),
    building_id: formData.get("building_id"),
    floor_number: formData.get("floor_number") || null,
    name: formData.get("name"),
    category: formData.get("category"),
    code: formData.get("code"),
    quantity: formData.get("quantity"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });
}

function extractPhoto(formData: FormData): File | null {
  const photo = formData.get("photo");
  return photo instanceof File && photo.size > 0 ? photo : null;
}

export async function createItemAction(formData: FormData): Promise<ActionResult> {
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
