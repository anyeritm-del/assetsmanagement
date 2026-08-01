import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

let authClient: InstanceType<typeof google.auth.JWT> | null = null;

export function getGoogleAuth() {
  if (authClient) return authClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !privateKey) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY environment variables",
    );
  }

  authClient = new google.auth.JWT({
    email,
    // Vercel/`.env` files store the key with literal "\n" sequences; unescape them.
    key: privateKey.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });

  return authClient;
}
