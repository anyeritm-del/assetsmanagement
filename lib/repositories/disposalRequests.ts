import { v4 as uuidv4 } from "uuid";
import { eq } from "drizzle-orm";
import { createTableRepository } from "./tableRepository";
import { disposalRequests } from "../db/schema";
import { getDb } from "../db/client";
import type { DisposalRequest } from "../types";
import type { DisposalRequestInput } from "../validation/disposalRequest";
import { createDisposalRequestItem } from "./disposalRequestItems";
import { updateItems } from "./items";
import { uploadPhoto } from "../google/uploadPhoto";

const repository = createTableRepository(disposalRequests, "DisposalRequests");

export async function listAllDisposalRequests(): Promise<DisposalRequest[]> {
  return repository.list();
}

export async function listDisposalRequestsByProperty(
  propertyId: string,
): Promise<DisposalRequest[]> {
  return repository.list(eq(disposalRequests.property_id, propertyId));
}

export async function getDisposalRequest(id: string): Promise<DisposalRequest | null> {
  return repository.getById(id);
}

export async function createDisposalRequestWithItems(
  input: DisposalRequestInput,
  requesterName: string,
  requesterEmail: string,
  photo?: File | null,
): Promise<DisposalRequest> {
  const { item_ids, ...requestInput } = input;
  const id = uuidv4();
  const now = new Date().toISOString();

  let photoDriveFileId: string | null = null;
  let photoViewLink: string | null = null;
  if (photo && photo.size > 0) {
    const uploaded = await uploadPhoto(id, photo);
    photoDriveFileId = uploaded.driveFileId;
    photoViewLink = uploaded.webViewLink;
  }

  const entity: DisposalRequest = {
    id,
    ...requestInput,
    requester_name: requesterName,
    requester_email: requesterEmail,
    status: "pending",
    decided_by: null,
    decided_at: null,
    photo_drive_file_id: photoDriveFileId,
    photo_view_link: photoViewLink,
    created_at: now,
    updated_at: now,
  };
  // One transaction so a failure never leaves a request without its item lines.
  return getDb().transaction(async (tx) => {
    const created = await repository.create(entity, tx);
    for (const itemId of item_ids) {
      await createDisposalRequestItem(created.id, itemId, tx);
    }
    return created;
  });
}

export async function decideDisposalRequest(
  id: string,
  decision: "approved" | "rejected",
  decidedBy: string,
  itemIds: string[],
): Promise<DisposalRequest> {
  const now = new Date().toISOString();
  // One transaction so an approval never lands without its items being marked disposed.
  return getDb().transaction(async (tx) => {
    const updated = await repository.update(
      id,
      { status: decision, decided_by: decidedBy, decided_at: now, updated_at: now },
      tx,
    );
    if (decision === "approved") {
      await updateItems(itemIds, { status: "disposed" }, tx);
    }
    return updated;
  });
}
