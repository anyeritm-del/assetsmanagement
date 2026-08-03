import { v4 as uuidv4 } from "uuid";
import { createSheetRepository } from "./sheetRepository";
import type { DisposalRequest } from "../types";
import { disposalRequestSchema } from "../validation/disposalRequest";
import type { DisposalRequestInput } from "../validation/disposalRequest";
import { createDisposalRequestItem } from "./disposalRequestItems";
import { updateItem } from "./items";
import { uploadPhoto } from "../google/uploadPhoto";

const HEADERS = [
  "id",
  "property_id",
  "reason",
  "note",
  "photo_drive_file_id",
  "photo_view_link",
  "approver_user_id",
  "requester_name",
  "requester_email",
  "status",
  "decided_by",
  "decided_at",
  "created_at",
  "updated_at",
];

function toNullableString(value: unknown): string | null {
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
}

function fromRow(record: Record<string, unknown>): DisposalRequest | null {
  const parsed = disposalRequestSchema.safeParse({
    id: String(record.id ?? ""),
    property_id: String(record.property_id ?? ""),
    reason: record.reason || "broken",
    note: String(record.note ?? ""),
    photo_drive_file_id: toNullableString(record.photo_drive_file_id),
    photo_view_link: toNullableString(record.photo_view_link),
    approver_user_id: String(record.approver_user_id ?? ""),
    requester_name: String(record.requester_name ?? ""),
    requester_email: String(record.requester_email ?? ""),
    status: record.status || "pending",
    decided_by: toNullableString(record.decided_by),
    decided_at: toNullableString(record.decided_at),
    created_at: String(record.created_at ?? ""),
    updated_at: String(record.updated_at ?? ""),
  });
  if (!parsed.success) {
    console.warn("Skipping malformed DisposalRequests row:", parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

function toRow(entity: DisposalRequest): Record<string, unknown> {
  return { ...entity };
}

const repository = createSheetRepository<DisposalRequest>({
  sheetName: "DisposalRequests",
  headers: HEADERS,
  fromRow,
  toRow,
});

export async function listAllDisposalRequests(): Promise<DisposalRequest[]> {
  return repository.list();
}

export async function listDisposalRequestsByProperty(
  propertyId: string,
): Promise<DisposalRequest[]> {
  const all = await repository.list();
  return all.filter((request) => request.property_id === propertyId);
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
  const created = await repository.create(entity);
  await Promise.all(item_ids.map((itemId) => createDisposalRequestItem(created.id, itemId)));
  return created;
}

export async function decideDisposalRequest(
  id: string,
  decision: "approved" | "rejected",
  decidedBy: string,
  itemIds: string[],
): Promise<DisposalRequest> {
  const now = new Date().toISOString();
  const updated = await repository.update(id, {
    status: decision,
    decided_by: decidedBy,
    decided_at: now,
    updated_at: now,
  });

  if (decision === "approved") {
    await Promise.all(itemIds.map((itemId) => updateItem(itemId, { status: "disposed" })));
  }

  return updated;
}
