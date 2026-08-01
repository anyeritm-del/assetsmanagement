import { Readable } from "node:stream";
import { getDriveClient, getDriveFolderId } from "./driveClient";
import { ALLOWED_PHOTO_MIME_TYPES, MAX_PHOTO_SIZE_BYTES } from "../constants";

export interface UploadedPhoto {
  driveFileId: string;
  webViewLink: string;
}

export async function uploadItemPhoto(itemId: string, file: File): Promise<UploadedPhoto> {
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_MIME_TYPES)[number])) {
    throw new Error(`Unsupported photo type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error("Photo exceeds the 5MB size limit");
  }

  const folderId = getDriveFolderId();
  const buffer = Buffer.from(await file.arrayBuffer());
  const drive = getDriveClient();

  const response = await drive.files.create({
    requestBody: {
      name: `${itemId}-${file.name}`,
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
