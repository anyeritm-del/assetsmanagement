"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { disposalDecisionSchema, disposalRequestInputSchema } from "../validation/disposalRequest";
import {
  createDisposalRequestWithItems,
  decideDisposalRequest,
  getDisposalRequest,
} from "../repositories/disposalRequests";
import { listDisposalRequestItems } from "../repositories/disposalRequestItems";

export interface ActionResult {
  success: boolean;
  error?: string;
}

function extractPhoto(formData: FormData): File | null {
  const photo = formData.get("photo");
  return photo instanceof File && photo.size > 0 ? photo : null;
}

export async function createDisposalRequestAction(formData: FormData): Promise<ActionResult> {
  const parsed = disposalRequestInputSchema.safeParse({
    property_id: formData.get("property_id"),
    reason: formData.get("reason"),
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

  try {
    await createDisposalRequestWithItems(
      parsed.data,
      session.user.name ?? session.user.email ?? "Unknown",
      session.user.email ?? "",
      extractPhoto(formData),
    );
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create disposal request",
    };
  }
  revalidatePath("/disposal-requests");
  revalidatePath("/approvals");
  return { success: true };
}

export async function decideDisposalRequestAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = disposalDecisionSchema.safeParse({
    decision: formData.get("decision"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const request = await getDisposalRequest(id);
  if (!request) {
    return { success: false, error: "Disposal request not found" };
  }
  if (request.status !== "pending") {
    return { success: false, error: "This request has already been decided" };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not signed in" };
  }

  const lines = await listDisposalRequestItems(id);
  await decideDisposalRequest(
    id,
    parsed.data.decision,
    session.user.name ?? session.user.email ?? "Unknown",
    lines.map((line) => line.item_id),
  );

  revalidatePath("/disposal-requests");
  revalidatePath(`/disposal-requests/${id}`);
  revalidatePath("/approvals");
  revalidatePath("/items");
  return { success: true };
}
