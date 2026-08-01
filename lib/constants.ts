export const PROPERTY_STATUSES = ["active", "inactive"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const BUILDING_STATUSES = ["active", "inactive"] as const;
export type BuildingStatus = (typeof BUILDING_STATUSES)[number];

export const ITEM_STATUSES = ["active", "maintenance", "disposed"] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  active: "Active",
  maintenance: "Maintenance",
  disposed: "Disposed",
};

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const SELECTED_PROPERTY_COOKIE = "selected_property_id";
