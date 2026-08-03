import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Item } from "../types";
import { itemSchema } from "../validation/item";
import type { ItemInput } from "../validation/item";
import { uploadPhoto } from "../google/uploadPhoto";

const HEADERS = [
  "id",
  "property_id",
  "building_id",
  "room_id",
  "department_id",
  "equipment_id",
  "article_id",
  "assigned_employee_id",
  "name",
  "category",
  "code",
  "serial_number",
  "quantity",
  "acquisition_value",
  "book_value",
  "status",
  "notes",
  "photo_drive_file_id",
  "photo_view_link",
  "created_at",
  "updated_at",
  // Appended at the end (rather than inserted near their conceptually related columns above)
  // so an already-created Items sheet only needs new columns added, not re-ordered.
  "purchase_order_id",
  "brand",
  "item_type",
  "lifetime_years",
  "end_of_lifetime_date",
  "warranty_months",
];

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

function toNullableNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function fromRow(record: Record<string, unknown>): Item | null {
  const parsed = itemSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    building_id: String(record.building_id ?? ""),
    room_id: toNullableString(record.room_id),
    department_id: toNullableString(record.department_id),
    equipment_id: toNullableString(record.equipment_id),
    article_id: toNullableString(record.article_id),
    assigned_employee_id: toNullableString(record.assigned_employee_id),
    purchase_order_id: toNullableString(record.purchase_order_id),
    name: String(record.name ?? ""),
    category: String(record.category ?? ""),
    code: String(record.code ?? ""),
    serial_number: String(record.serial_number ?? ""),
    brand: String(record.brand ?? ""),
    item_type: record.item_type || "fixed_asset",
    quantity: Number(record.quantity ?? 0),
    acquisition_value: Number(record.acquisition_value ?? 0),
    book_value: Number(record.book_value ?? 0),
    lifetime_years: toNullableNumber(record.lifetime_years),
    end_of_lifetime_date: toNullableString(record.end_of_lifetime_date),
    warranty_months: toNullableNumber(record.warranty_months),
    status: record.status || "active",
    notes: String(record.notes ?? ""),
    photo_drive_file_id: toNullableString(record.photo_drive_file_id),
    photo_view_link: toNullableString(record.photo_view_link),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed Items row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: Item): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<Item>({
  sheetName: "Items",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listItems(): Promise<Item[]> {
  return repository.list();
}

export async function listItemsByProperty(propertyId: string): Promise<Item[]> {
  const all = await repository.list();
  return all.filter((item) => item.property_id === propertyId);
}

export async function getItem(id: string): Promise<Item | null> {
  return repository.getById(id);
}

export async function createItem(input: ItemInput, photo?: File | null): Promise<Item> {
  const id = uuidv4();
  const now = new Date().toISOString();

  let photoDriveFileId: string | null = null;
  let photoViewLink: string | null = null;
  if (photo && photo.size > 0) {
    const uploaded = await uploadPhoto(id, photo);
    photoDriveFileId = uploaded.driveFileId;
    photoViewLink = uploaded.webViewLink;
  }

  const entity: Item = {
    id,
    ...input,
    photo_drive_file_id: photoDriveFileId,
    photo_view_link: photoViewLink,
    created_at: now,
    updated_at: now,
  };
  return repository.create(entity);
}

export async function updateItem(
  id: string,
  patch: Partial<ItemInput>,
  photo?: File | null,
): Promise<Item> {
  const updates: Partial<Item> = { ...patch, updated_at: new Date().toISOString() };

  if (photo && photo.size > 0) {
    const uploaded = await uploadPhoto(id, photo);
    updates.photo_drive_file_id = uploaded.driveFileId;
    updates.photo_view_link = uploaded.webViewLink;
  }

  return repository.update(id, updates);
}
