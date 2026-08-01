# Setup Guide

This app has no real database — it reads/writes a Google Sheet via a service account, and stores
item photos in a Google Drive folder. Follow these steps once before running the app.

## 1. Google Cloud project + APIs

1. Go to https://console.cloud.google.com/ and create a new project (or pick an existing one).
2. Go to **APIs & Services > Library**, enable:
   - **Google Sheets API**
   - **Google Drive API**

## 2. Service account (for Sheets + Drive access)

1. Go to **APIs & Services > Credentials > Create Credentials > Service Account**.
2. Give it a name (e.g. `asset-management-sheets`). No project role is needed — access is granted
   by sharing the Sheet/Drive folder directly with its email (step 4).
3. Open the created service account > **Keys > Add Key > Create new key > JSON**. This downloads a
   JSON file — keep it private.
4. From that JSON file, copy:
   - `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key` → `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` (keep the `\n` sequences as-is)

## 3. OAuth client (for user sign-in)

This is a separate credential from the service account — it's what lets people sign in with their
own Google account.

1. **APIs & Services > Credentials > Create Credentials > OAuth client ID**.
2. Application type: **Web application**.
3. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://<your-vercel-domain>/api/auth/callback/google` (add once you know your Vercel URL)
4. Copy the Client ID / Client Secret → `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`.

## 4. Create the Spreadsheet (the "database")

1. Create a new Google Sheet (can live in the same Drive folder as photos, or anywhere you like).
2. Create three tabs with these exact header rows in row 1:

   **Properties**
   ```
   id | name | code | status | created_at | updated_at
   ```

   **Buildings**
   ```
   id | property_id | name | description | total_floor | status | created_at | updated_at
   ```

   **Items**
   ```
   id | property_id | building_id | floor_number | name | category | code | quantity | status | notes | photo_drive_file_id | photo_view_link | created_at | updated_at
   ```
3. Add at least one row to **Properties** by hand so the app has something to show, e.g.:
   ```
   <any-uuid> | ASTON Serang Hotel & Convention Center | aston-serang | active | 2026-01-01T00:00:00.000Z | 2026-01-01T00:00:00.000Z
   ```
   (Generate a UUID from any UUID generator, or run `node -e "console.log(crypto.randomUUID())"`.)
4. Click **Share**, add the service account's email (from step 2) with **Editor** access.
5. Copy the spreadsheet ID from its URL — `https://docs.google.com/spreadsheets/d/<ID>/edit` →
   `GOOGLE_SHEETS_SPREADSHEET_ID`.

## 5. Create and share the Drive photo folder

Create a regular folder in **My Drive** (not a Shared Drive -- in testing, adding the service
account as a Shared Drive member showed up in the UI but never actually granted API access; a
plain folder shared directly with "Share" worked immediately). Share it with the service account's
email as **Editor**, then copy its ID from the folder's URL
(`https://drive.google.com/drive/folders/<ID>`) into `GOOGLE_DRIVE_FOLDER_ID`.

Note: after sharing, Drive can take a few minutes to propagate the permission to the API even
though the UI shows it immediately -- if you get a "File not found" error right after sharing,
wait a few minutes and retry before assuming something's misconfigured.

## 6. Local development

1. Copy `.env.example` to `.env.local` and fill in every value from the steps above.
2. `npm install`
3. `npm run dev`, then visit http://localhost:3000 and sign in with an `@archipelagohotels.com`
   Google account.

## 7. Deploy to Vercel

1. Push this repo to GitHub (or connect the local folder) and import it into Vercel.
2. In **Project Settings > Environment Variables**, add every variable from `.env.example` with
   real values (use the production `AUTH_URL`, e.g. `https://your-app.vercel.app`).
3. Add the Vercel URL's OAuth callback to the OAuth client's authorized redirect URIs (step 3).
4. Deploy, then repeat the sign-in and create/edit checks from step 6 against the live URL.
