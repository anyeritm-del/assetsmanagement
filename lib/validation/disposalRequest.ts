import { z } from "zod";
import { APPROVAL_STAGE_STATUSES, DISPOSAL_REASONS } from "../constants";

export const disposalRequestSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  reason: z.enum(DISPOSAL_REASONS),
  note: z.string(),
  photo_drive_file_id: z.string().nullable(),
  photo_view_link: z.string().nullable(),
  approver_user_id: z.string().uuid(),
  requester_name: z.string(),
  requester_email: z.string(),
  status: z.enum(APPROVAL_STAGE_STATUSES),
  decided_by: z.string().nullable(),
  decided_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const disposalRequestInputSchema = z.object({
  property_id: z.string().uuid(),
  reason: z.enum(DISPOSAL_REASONS),
  note: z.string().trim().default(""),
  approver_user_id: z.string().uuid(),
  item_ids: z.array(z.string().uuid()).min(1, "Select at least one item"),
});

export type DisposalRequestInput = z.infer<typeof disposalRequestInputSchema>;

export const disposalRequestItemSchema = z.object({
  id: z.string().uuid(),
  disposal_request_id: z.string().uuid(),
  item_id: z.string().uuid(),
  created_at: z.string(),
});

export const disposalDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
});

export type DisposalDecisionInput = z.infer<typeof disposalDecisionSchema>;
