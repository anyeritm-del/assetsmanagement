import { google, sheets_v4 } from "googleapis";
import { getGoogleAuth } from "./auth";

let client: sheets_v4.Sheets | null = null;

export function getSheetsClient(): sheets_v4.Sheets {
  if (!client) {
    client = google.sheets({ version: "v4", auth: getGoogleAuth() });
  }
  return client;
}

export function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!id) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID environment variable");
  }
  return id;
}
