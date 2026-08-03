import { z } from "zod";
import { APPROVAL_STAGE_STATUSES } from "../constants";

const nullableUuid = () =>
  z.preprocess((value) => (value === "" ? null : value), z.string().uuid().nullable());

export const movementRequestSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  destination_building_id: z.string().uuid(),
  destination_room_id: z.string().uuid().nullable(),
  note: z.string(),
  approver_user_id: z.string().uuid(),
  requester_name: z.string(),
  requester_email: z.string(),
  status: z.enum(APPROVAL_STAGE_STATUSES),
  decided_by: z.string().nullable(),
  decided_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const movementRequestInputSchema = z.object({
  property_id: z.string().uuid(),
  destination_building_id: z.string().uuid(),
  destination_room_id: nullableUuid().default(null),
  note: z.string().trim().default(""),
  approver_user_id: z.string().uuid(),
  item_ids: z.array(z.string().uuid()).min(1, "Select at least one item"),
});

export type MovementRequestInput = z.infer<typeof movementRequestInputSchema>;

export const movementRequestItemSchema = z.object({
  id: z.string().uuid(),
  movement_request_id: z.string().uuid(),
  item_id: z.string().uuid(),
  created_at: z.string(),
});

export const movementDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
});

export type MovementDecisionInput = z.infer<typeof movementDecisionSchema>;
