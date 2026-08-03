import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { PurchaseOrder } from "../types";
import { purchaseOrderSchema } from "../validation/purchaseOrder";
import type { PurchaseOrderInput } from "../validation/purchaseOrder";
import { uploadPhoto } from "../google/uploadPhoto";

const HEADERS = [
  "id",
  "property_id",
  "supplier_id",
  "received_date",
  "purchase_number",
  "title",
  "value",
  "description",
  "quantity",
  "photo_drive_file_id",
  "photo_view_link",
  "created_at",
  "updated_at",
];

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

// Sheets' epoch for its internal date serial numbers (day 0 = Dec 30, 1899).
const SHEETS_DATE_EPOCH_UTC_MS = Date.UTC(1899, 11, 30);

/**
 * Typing a date directly into the Sheets UI (rather than through this app) always gets
 * auto-converted to Sheets' internal date serial number, regardless of how the app itself writes
 * values -- reading it back as a plain string then misrenders (e.g. "1 Jan 46236" instead of
 * "2 Aug 2026"). Handle both shapes: a real date-input string from our own writes, or a raw
 * serial number from a manual edit.
 */
function toDateString(value: unknown): string {
  if (typeof value === "number") {
    return new Date(SHEETS_DATE_EPOCH_UTC_MS + value * 86_400_000).toISOString().slice(0, 10);
  }
  return String(value ?? "");
}

function fromRow(record: Record<string, unknown>): PurchaseOrder | null {
  const parsed = purchaseOrderSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    supplier_id: toNullableString(record.supplier_id),
    received_date: toDateString(record.received_date),
    purchase_number: String(record.purchase_number ?? ""),
    title: String(record.title ?? ""),
    value: Number(record.value ?? 0),
    description: String(record.description ?? ""),
    quantity: Number(record.quantity ?? 0),
    photo_drive_file_id: toNullableString(record.photo_drive_file_id),
    photo_view_link: toNullableString(record.photo_view_link),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Purchase Orders row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: PurchaseOrder): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<PurchaseOrder>({
  sheetName: "PurchaseOrders",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  return repository.list();
}

export async function listPurchaseOrdersByProperty(propertyId: string): Promise<PurchaseOrder[]> {
  const all = await repository.list();
  return all.filter((po) => po.property_id === propertyId);
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
  return repository.getById(id);
}

export async function createPurchaseOrder(
  input: PurchaseOrderInput,
  photo?: File | null,
): Promise<PurchaseOrder> {
  const id = uuidv4();
  const now = new Date().toISOString();

  let photoDriveFileId: string | null = null;
  let photoViewLink: string | null = null;
  if (photo && photo.size > 0) {
    const uploaded = await uploadPhoto(id, photo);
    photoDriveFileId = uploaded.driveFileId;
    photoViewLink = uploaded.webViewLink;
  }

  const entity: PurchaseOrder = {
    id,
    ...input,
    photo_drive_file_id: photoDriveFileId,
    photo_view_link: photoViewLink,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updatePurchaseOrder(
  id: string,
  patch: Partial<PurchaseOrderInput>,
  photo?: File | null,
): Promise<PurchaseOrder> {
  const updates: Partial<PurchaseOrder> = { ...patch, updated_at: new Date().toISOString() };

  if (photo && photo.size > 0) {
    const uploaded = await uploadPhoto(id, photo);
    updates.photo_drive_file_id = uploaded.driveFileId;
    updates.photo_view_link = uploaded.webViewLink;
  }

  return repository.update(id, updates);
}
