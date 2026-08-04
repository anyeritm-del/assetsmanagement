"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SELECTED_PROPERTY_COOKIE } from "../constants";
import { propertyInputSchema } from "../validation/property";
import { createProperty, updateProperty } from "../repositories/properties";
import { assertCanMutate } from "../viewOnlyGuard";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parsePropertyForm(formData: FormData) {
  return propertyInputSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    status: formData.get("status") || undefined,
  });
}

export async function createPropertyAction(formData: FormData): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parsePropertyForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createProperty(parsed.data);
  revalidatePath("/properties");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updatePropertyAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const guard = await assertCanMutate();
  if (!guard.success) return guard;

  const parsed = parsePropertyForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateProperty(id, parsed.data);
  revalidatePath("/properties");
  revalidatePath("/", "layout");
  return { success: true };
}

// Not gated -- switching which property you're viewing is not a mutation of app data, and
// View-only users still need to be able to browse different hotels.
export async function setSelectedProperty(propertyId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SELECTED_PROPERTY_COOKIE, propertyId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
