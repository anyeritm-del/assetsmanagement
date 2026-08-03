"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { movementDecisionSchema, movementRequestInputSchema } from "../validation/movementRequest";
import {
  createMovementRequestWithItems,
  decideMovementRequest,
  getMovementRequest,
} from "../repositories/movementRequests";
import { listMovementRequestItems } from "../repositories/movementRequestItems";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function createMovementRequestAction(formData: FormData): Promise<ActionResult> {
  const parsed = movementRequestInputSchema.safeParse({
    property_id: formData.get("property_id"),
    destination_building_id: formData.get("destination_building_id"),
    destination_room_id: formData.get("destination_room_id") || null,
    note: formData.get("note"),
    approver_user_id: formData.get("approver_user_id"),
    item_ids: formData.getAll("item_id").map(String),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not signed in" };
  }

  await createMovementRequestWithItems(
    parsed.data,
    session.user.name ?? session.user.email ?? "Unknown",
    session.user.email ?? "",
  );
  revalidatePath("/movement-requests");
  revalidatePath("/approvals");
  return { success: true };
}

export async function decideMovementRequestAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = movementDecisionSchema.safeParse({
    decision: formData.get("decision"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const request = await getMovementRequest(id);
  if (!request) {
    return { success: false, error: "Movement request not found" };
  }
  if (request.status !== "pending") {
    return { success: false, error: "This request has already been decided" };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not signed in" };
  }

  const lines = await listMovementRequestItems(id);
  await decideMovementRequest(
    id,
    parsed.data.decision,
    session.user.name ?? session.user.email ?? "Unknown",
    lines.map((line) => line.item_id),
    request.destination_building_id,
    request.destination_room_id,
  );

  revalidatePath("/movement-requests");
  revalidatePath(`/movement-requests/${id}`);
  revalidatePath("/approvals");
  revalidatePath("/items");
  return { success: true };
}
