import { google, drive_v3 } from "googleapis";
import { getGoogleAuth } from "./auth";

let client: drive_v3.Drive | null = null;

export function getDriveClient(): drive_v3.Drive {
  if (!client) {
    client = google.drive({ version: "v3", auth: getGoogleAuth() });
  }
  return client;
}

export function getDriveFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) {
    throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID environment variable");
  }
  return id;
}
