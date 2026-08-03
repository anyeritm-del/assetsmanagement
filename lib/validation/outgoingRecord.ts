import { z } from "zod";
import { APPROVAL_STAGE_STATUSES } from "../constants";

export const outgoingRecordSchema = z.object({
  id: z.string().uuid(),
  source_property_id: z.string().uuid(),
  destination_property_id: z.string().uuid(),
  reason: z.string(),
  expected_return_date: z.string().nullable(),
  requested_by_name: z.string(),
  requested_by_email: z.string(),
  fc_status: z.enum(APPROVAL_STAGE_STATUSES),
  fc_decided_by: z.string().nullable(),
  fc_decided_at: z.string().nullable(),
  fc_notes: z.string(),
  hr_status: z.enum(APPROVAL_STAGE_STATUSES),
  hr_decided_by: z.string().nullable(),
  hr_decided_at: z.string().nullable(),
  hr_notes: z.string(),
  gm_status: z.enum(APPROVAL_STAGE_STATUSES),
  gm_decided_by: z.string().nullable(),
  gm_decided_at: z.string().nullable(),
  gm_notes: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const outgoingRecordLineInputSchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
});

export type OutgoingRecordLineInput = z.infer<typeof outgoingRecordLineInputSchema>;

export const outgoingRecordInputSchema = z
  .object({
    source_property_id: z.string().uuid(),
    destination_property_id: z.string().uuid(),
    items: z.array(outgoingRecordLineInputSchema).min(1, "Add at least one item"),
    reason: z.string().trim().min(1, "Reason is required"),
    expected_return_date: z
      .preprocess((value) => (value === "" ? null : value), z.string().nullable())
      .default(null),
  })
  .refine((data) => data.source_property_id !== data.destination_property_id, {
    message: "Destination hotel must be different from the lending property",
    path: ["destination_property_id"],
  });

export type OutgoingRecordInput = z.infer<typeof outgoingRecordInputSchema>;

export const outgoingRecordItemSchema = z.object({
  id: z.string().uuid(),
  outgoing_record_id: z.string().uuid(),
  item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  created_at: z.string(),
});

export const stageDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  notes: z.string().trim().default(""),
});

export type StageDecisionInput = z.infer<typeof stageDecisionSchema>;
