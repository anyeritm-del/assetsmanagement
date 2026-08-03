"use server";

import { revalidatePath } from "next/cache";
import { roomInputSchema } from "../validation/room";
import { createRoom, updateRoom } from "../repositories/rooms";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function parseRoomForm(formData: FormData) {
  return roomInputSchema.safeParse({
    property_id: formData.get("property_id"),
    building_id: formData.get("building_id"),
    floor_id: formData.get("floor_id"),
    name: formData.get("name"),
    description: formData.get("description"),
    status: formData.get("status"),
  });
}

export async function createRoomAction(formData: FormData): Promise<ActionResult> {
  const parsed = parseRoomForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await createRoom(parsed.data);
  revalidatePath(`/location/${parsed.data.building_id}/floors/${parsed.data.floor_id}/rooms`);
  return { success: true };
}

export async function updateRoomAction(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseRoomForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  await updateRoom(id, parsed.data);
  revalidatePath(`/location/${parsed.data.building_id}/floors/${parsed.data.floor_id}/rooms`);
  return { success: true };
}
