import type { OutgoingRecordOverallStatus } from "./constants";
import type { OutgoingRecord } from "./types";

/**
 * The overall status is derived from the 3 sequential stage decisions rather than stored
 * directly, so there's no risk of it drifting out of sync with the individual stage fields.
 */
export function getOutgoingRecordOverallStatus(record: OutgoingRecord): OutgoingRecordOverallStatus {
  if (record.fc_status === "rejected" || record.hr_status === "rejected" || record.gm_status === "rejected") {
    return "rejected";
  }
  if (record.gm_status === "approved") return "approved";
  if (record.hr_status === "approved") return "pending_gm";
  if (record.fc_status === "approved") return "pending_hr";
  return "pending_fc";
}

/** Which stage (if any) is currently awaiting a decision. Null once approved or rejected. */
export function getActiveStage(record: OutgoingRecord): "fc" | "hr" | "gm" | null {
  const overall = getOutgoingRecordOverallStatus(record);
  if (overall === "pending_fc") return "fc";
  if (overall === "pending_hr") return "hr";
  if (overall === "pending_gm") return "gm";
  return null;
}
