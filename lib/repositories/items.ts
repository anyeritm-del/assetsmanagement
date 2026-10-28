import { v4 as uuidv4 } from "uuid";
import { eq, inArray } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { items } from "../db/schema";
import { getDb, type Executor } from "../db/client";
import type { Item } from "../types";
import type { ItemInput } from "../validation/item";
import { uploadPhoto } from "../google/uploadPhoto";

const repository = createTableRepository(items, "Items");

export async function listItems(): Promise<Item[]> {
  return repository.list();
}

export async function listItemsByProperty(propertyId: string): Promise<Item[]> {
  return repository.list(eq(items.property_id, propertyId));
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

// Applies the same field changes to several items in one UPDATE -- used when an approved
// disposal/movement request moves or disposes all of its items together.
export async function updateItems(
  ids: string[],
  patch: Partial<ItemInput>,
  executor: Executor = getDb(),
): Promise<void> {
  if (ids.length === 0) return;
  await executor
    .update(items)
    .set({ ...patch, updated_at: new Date().toISOString() })
    .where(inArray(items.id, ids));
}
