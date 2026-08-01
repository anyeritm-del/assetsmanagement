import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { Item } from "../types";
import { itemSchema } from "../validation/item";
import type { ItemInput } from "../validation/item";
import { uploadItemPhoto } from "../google/uploadPhoto";

const HEADERS = [
  "id",
  "property_id",
  "building_id",
  "floor_number",
  "name",
  "category",
  "code",
  "quantity",
  "status",
  "notes",
  "photo_drive_file_id",
  "photo_view_link",
  "created_at",
  "updated_at",
];

function toNullableNumber(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

function fromRow(record: Record<string, unknown>): Item | null {
  const parsed = itemSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    building_id: String(record.building_id ?? ""),
    floor_number: toNullableNumber(record.floor_number),
    name: String(record.name ?? ""),
    category: String(record.category ?? ""),
    code: String(record.code ?? ""),
    quantity: Number(record.quantity ?? 0),
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
    const uploaded = await uploadItemPhoto(id, photo);
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
    const uploaded = await uploadItemPhoto(id, photo);
    updates.photo_drive_file_id = uploaded.driveFileId;
    updates.photo_view_link = uploaded.webViewLink;
  }

  return repository.update(id, updates);
}
