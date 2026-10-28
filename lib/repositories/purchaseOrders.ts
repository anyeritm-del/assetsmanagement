import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { purchaseOrders } from "../db/schema";
import type { PurchaseOrder } from "../types";
import type { PurchaseOrderInput } from "../validation/purchaseOrder";
import { uploadPhoto } from "../google/uploadPhoto";

const repository = createTableRepository(purchaseOrders, "PurchaseOrders");

export async function listPurchaseOrders(): Promise<PurchaseOrder[]> {
  return repository.list();
}

export async function listPurchaseOrdersByProperty(propertyId: string): Promise<PurchaseOrder[]> {
  return repository.list(eq(purchaseOrders.property_id, propertyId));
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
