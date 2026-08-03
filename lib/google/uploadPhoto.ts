import { Readable } from "node:stream";
import { getDriveFolderId, getUploadDriveClient } from "./driveClient";
import { ALLOWED_PHOTO_MIME_TYPES, MAX_PHOTO_SIZE_BYTES } from "../constants";

export interface UploadedPhoto {
  driveFileId: string;
  webViewLink: string;
}

/**
 * Uploads a photo to the shared Drive folder, prefixing the filename with `recordId` so it's
 * traceable back to whichever entity (item, purchase order, ...) it belongs to.
 */
export async function uploadPhoto(recordId: string, file: File): Promise<UploadedPhoto> {
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_MIME_TYPES)[number])) {
    throw new Error(`Unsupported photo type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error("Photo exceeds the 5MB size limit");
  }

  const folderId = getDriveFolderId();
  const buffer = Buffer.from(await file.arrayBuffer());
  const drive = getUploadDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: `${recordId}-${file.name}`,
      parents: [folderId],
    },
    media: {
      mimeType: file.type,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  if (!response.data.id) {
    throw new Error("Drive upload did not return a file id");
  }

  return {
    driveFileId: response.data.id,
    webViewLink: response.data.webViewLink ?? "",
  };
}
