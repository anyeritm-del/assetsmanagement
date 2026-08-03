export const PROPERTY_STATUSES = ["active", "inactive"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const BUILDING_STATUSES = ["active", "inactive"] as const;
export type BuildingStatus = (typeof BUILDING_STATUSES)[number];

export const FLOOR_STATUSES = ["active", "inactive"] as const;
export type FloorStatus = (typeof FLOOR_STATUSES)[number];

export const ROOM_STATUSES = ["active", "inactive"] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const ITEM_STATUSES = ["active", "maintenance", "disposed"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  active: "Active",
  maintenance: "Maintenance",
  disposed: "Disposed",
};

export const ITEM_TYPES = ["fixed_asset", "consumable"] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  fixed_asset: "Fixed Asset",
  consumable: "Consumable",
};

export const USER_STATUSES = ["active", "inactive"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_LEVELS = [
  "administrator",
  "property_admin",
  "user_admin",
  "user",
  "view_only",
  "owner",
] as const;
export type UserLevel = (typeof USER_LEVELS)[number];

export const USER_LEVEL_LABELS: Record<UserLevel, string> = {
  administrator: "Administrator",
  property_admin: "Property admin",
  user_admin: "User admin",
  user: "User",
  view_only: "View only",
  owner: "Owner",
};

export const APPROVAL_STAGE_STATUSES = ["pending", "approved", "rejected"] as const;
export type ApprovalStageStatus = (typeof APPROVAL_STAGE_STATUSES)[number];

export const OUTGOING_RECORD_OVERALL_STATUSES = [
  "pending_fc",
  "pending_hr",
  "pending_gm",
  "approved",
  "rejected",
] as const;
export type OutgoingRecordOverallStatus = (typeof OUTGOING_RECORD_OVERALL_STATUSES)[number];

export const OUTGOING_RECORD_OVERALL_STATUS_LABELS: Record<OutgoingRecordOverallStatus, string> = {
  pending_fc: "Pending Financial Controller",
  pending_hr: "Pending Human Resources",
  pending_gm: "Pending General Manager",
  approved: "Approved",
  rejected: "Rejected",
};

export const MAINTENANCE_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number];

export const MAINTENANCE_PRIORITY_LABELS: Record<MaintenancePriority, string> = {
  low: "Low – Minor, can wait",
  medium: "Medium – Noticeable but not critical",
  high: "High – Needs prompt attention",
  critical: "Critical – Urgent, safety or major disruption",
};

export const MAINTENANCE_PRIORITY_COLORS: Record<MaintenancePriority, string> = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-orange-400",
  critical: "bg-rose-500",
};

export const MAINTENANCE_REQUEST_STATUSES = [
  "open",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type MaintenanceRequestStatus = (typeof MAINTENANCE_REQUEST_STATUSES)[number];

export const MAINTENANCE_REQUEST_STATUS_LABELS: Record<MaintenanceRequestStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PM_FREQUENCY_UNITS = ["day", "week", "month", "year"] as const;
export type PMFrequencyUnit = (typeof PM_FREQUENCY_UNITS)[number];

export const PM_FREQUENCY_UNIT_LABELS: Record<PMFrequencyUnit, string> = {
  day: "Day(s)",
  week: "Week(s)",
  month: "Month(s)",
  year: "Year(s)",
};

export const PM_SCHEDULE_DUE_STATUSES = ["overdue", "due_soon", "upcoming"] as const;
export type PMScheduleDueStatus = (typeof PM_SCHEDULE_DUE_STATUSES)[number];

export const PM_SCHEDULE_DUE_STATUS_LABELS: Record<PMScheduleDueStatus, string> = {
  overdue: "Overdue",
  due_soon: "Due Soon",
  upcoming: "Upcoming",
};

export const DISPOSAL_REASONS = ["broken", "lost", "donated", "sold"] as const;
export type DisposalReason = (typeof DISPOSAL_REASONS)[number];

export const DISPOSAL_REASON_LABELS: Record<DisposalReason, string> = {
  broken: "Broken",
  lost: "Lost",
  donated: "Donated",
  sold: "Sold",
};

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const SELECTED_PROPERTY_COOKIE = "selected_property_id";
