import { google, drive_v3 } from "googleapis";
import { getGoogleAuth } from "./auth";

let client: drive_v3.Drive | null = null;

/** Service-account Drive client, used for reads (streaming photos back to the browser). */
export function getDriveClient(): drive_v3.Drive {
  if (!client) {
    client = google.drive({ version: "v3", auth: getGoogleAuth() });
  }
  return client;
}

let uploadClient: drive_v3.Drive | null = null;
let uploadAuth: InstanceType<typeof google.auth.OAuth2> | null = null;

/**
 * OAuth-authenticated Drive client (acting as a real Workspace user via a refresh token), used
 * only for uploads. Service accounts have zero Drive storage quota of their own, so creating a
 * new file with the service account's own credentials fails with "Service Accounts do not have
 * storage quota" -- see SETUP.md for how GOOGLE_DRIVE_REFRESH_TOKEN is generated. Files created
 * this way still land in GOOGLE_DRIVE_FOLDER_ID, which the service account can already read
 * since sharing on a Drive folder cascades to files created inside it.
 */
export function getUploadDriveClient(): drive_v3.Drive {
  if (!uploadClient) {
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error(
        "Missing GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, or GOOGLE_DRIVE_REFRESH_TOKEN environment variables",
      );
    }

    uploadAuth = new google.auth.OAuth2(clientId, clientSecret);
    uploadAuth.setCredentials({ refresh_token: refreshToken });
    uploadClient = google.drive({ version: "v3", auth: uploadAuth });
  }
  return uploadClient;
}

export function getDriveFolderId(): string {
  const id = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!id) {
    throw new Error("Missing GOOGLE_DRIVE_FOLDER_ID environment variable");
  }
  return id;
}
