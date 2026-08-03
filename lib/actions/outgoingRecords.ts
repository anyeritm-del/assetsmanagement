"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { outgoingRecordInputSchema, stageDecisionSchema } from "../validation/outgoingRecord";
import {
  createOutgoingRecordWithItems,
  getOutgoingRecord,
  updateOutgoingRecord,
} from "../repositories/outgoingRecords";
import { getActiveStage } from "../outgoingRecordStatus";
import type { OutgoingRecord } from "../types";

export interface ActionResult {
  success: boolean;
  error?: string;
}

// Item rows are submitted as repeated `item_id`/`quantity` fields (one pair per row, in DOM
// order) rather than indexed/JSON-encoded fields, since the item list is a dynamic client-side
// row count and FormData.getAll already preserves per-field submission order.
function parseItemLines(formData: FormData) {
  const itemIds = formData.getAll("item_id").map(String);
  const quantities = formData.getAll("quantity").map(String);
  return itemIds
    .map((item_id, index) => ({ item_id, quantity: quantities[index] }))
    .filter((line) => line.item_id);
}

export async function createOutgoingRecordAction(formData: FormData): Promise<ActionResult> {
  const parsed = outgoingRecordInputSchema.safeParse({
    source_property_id: formData.get("source_property_id"),
    destination_property_id: formData.get("destination_property_id"),
    items: parseItemLines(formData),
    reason: formData.get("reason"),
    expected_return_date: formData.get("expected_return_date") || null,
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not signed in" };
  }

  await createOutgoingRecordWithItems(
    parsed.data,
    session.user.name ?? session.user.email ?? "Unknown",
    session.user.email ?? "",
  );
  revalidatePath("/outgoing-records");
  revalidatePath("/approvals");
  return { success: true };
}

export async function decideOutgoingStageAction(
  id: string,
  stage: "fc" | "hr" | "gm",
  formData: FormData,
): Promise<ActionResult> {
  const parsed = stageDecisionSchema.safeParse({
    decision: formData.get("decision"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const record = await getOutgoingRecord(id);
  if (!record) {
    return { success: false, error: "Outgoing record not found" };
  }

  // Server-side guard against out-of-order approval, independent of who's allowed to click --
  // the sequence itself (FC -> HR -> GM) must still be enforced.
  if (getActiveStage(record) !== stage) {
    return { success: false, error: "This stage isn't awaiting a decision right now" };
  }

  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Not signed in" };
  }
  const decidedBy = session.user.name ?? session.user.email ?? "Unknown";
  const decidedAt = new Date().toISOString();

  const patch: Partial<OutgoingRecord> =
    stage === "fc"
      ? {
          fc_status: parsed.data.decision,
          fc_decided_by: decidedBy,
          fc_decided_at: decidedAt,
          fc_notes: parsed.data.notes,
        }
      : stage === "hr"
        ? {
            hr_status: parsed.data.decision,
            hr_decided_by: decidedBy,
            hr_decided_at: decidedAt,
            hr_notes: parsed.data.notes,
          }
        : {
            gm_status: parsed.data.decision,
            gm_decided_by: decidedBy,
            gm_decided_at: decidedAt,
            gm_notes: parsed.data.notes,
          };

  await updateOutgoingRecord(id, patch);

  revalidatePath("/outgoing-records");
  revalidatePath(`/outgoing-records/${id}`);
  revalidatePath("/approvals");
  return { success: true };
}
