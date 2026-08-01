"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { SELECTED_PROPERTY_COOKIE } from "../constants";

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
