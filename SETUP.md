# Setup Guide

This app stores its data in PostgreSQL and item photos in a Google Drive folder (accessed via a
service account). Follow these steps once before running the app.

## 1. Google Cloud project + APIs

1. Go to https://console.cloud.google.com/ and create a new project (or pick an existing one).
2. Go to **APIs & Services > Library**, enable:
   - **Google Sheets API** (only needed for the one-time import in step 4b)
   - **Google Drive API**

## 2. Service account (for Drive access, and Sheets for the one-time import)

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
   - `https://developers.google.com/oauthplayground` (temporary, for step 3b below — remove
     afterward if you'd rather not leave it configured)
4. Copy the Client ID / Client Secret → `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET`.

### 3b. Drive upload refresh token (required — no Workspace admin access needed)

Service accounts have **zero Drive storage quota** of their own. Uploading a new file (item/PO
photos) fails with `Service Accounts do not have storage quota` unless the upload runs as a real
Google user's own account instead. This uses a one-time manual OAuth consent flow — unlike domain
wide delegation, it does **not** require Workspace super admin access, since it's just an app
requesting access to one person's own Drive, the same as any "Sign in with Google" consent.

1. Go to https://developers.google.com/oauthplayground.
2. Click the gear icon (top right) → check **Use your own OAuth credentials** → paste
   `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` from step 3.
3. In the left panel, find **Drive API v3** and select scope `https://www.googleapis.com/auth/drive`
   (or paste it into the "Input your own scopes" box).
4. Click **Authorize APIs**, sign in as the Google account that should own the uploaded photos
   (e.g. whoever owns the Drive folder in step 5), and grant consent.
5. Click **Exchange authorization code for tokens**. Copy the **Refresh token** value shown →
   `GOOGLE_DRIVE_REFRESH_TOKEN`.

This token doesn't expire from use, but Google can invalidate it if the granting user changes
their password or revokes access at myaccount.google.com/permissions — regenerate via the same
steps if uploads start failing with an auth error.

## 4. PostgreSQL database

The database is PostgreSQL (hosted on Sumopod). The schema lives in `lib/db/schema.ts` (Drizzle
ORM); the SQL migrations generated from it live in `drizzle/` and are committed to git.

1. In Sumopod, use a dedicated database for this app (currently `asset_management`; the server
   also hosts other apps' databases, so don't use the default `postgres` one). Put its connection
   string in `DATABASE_URL`, e.g.
   `postgresql://user:password@dedicated-pooler.sumobase.my.id:7433/asset_management`.
   It must be reachable from both your machine and Vercel.

   TLS is always on and the server certificate is always verified. Sumopod's pooler uses a
   Cloudflare *Origin* certificate, so the app trusts the Cloudflare Origin CA root embedded in
   `lib/db/cloudflareOriginCa.ts` (valid until 2029-08-15). Any `sslmode` in the URL is ignored,
   except `sslmode=disable` for a local Postgres without TLS. If connections start failing with
   a certificate error, Sumopod changed their certificate -- check `openssl s_client -starttls
   postgres -connect <host>:<port> -showcerts` and update that file.
2. Create the tables: `npm run db:migrate`.

Schema changes later:
1. Edit `lib/db/schema.ts` (and the matching interface in `lib/types.ts`).
2. `npm run db:generate -- --name <short_description>` writes a new SQL file to `drizzle/`.
   Review it, commit it.
3. `npm run db:migrate` applies it. Run this against production **before** deploying code that
   depends on it.

`npm run db:studio` opens a browser UI for looking at the data.

### 4b. One-time import from the old Google Sheet

Before PostgreSQL, the data lived in a Google Sheet (one tab per table, header row in row
1). `scripts/migrate-sheets-to-postgres.ts` copies it into PostgreSQL. It only *reads* the sheet,
needs `GOOGLE_SHEETS_SPREADSHEET_ID` + the service account (step 2), and refuses to write into
non-empty tables.

1. Announce a short freeze: nobody creates or edits anything until the new version is live.
2. `npm run db:migrate-sheets` — dry run. It prints the row count per table and every problem
   (invalid values, duplicate ids/emails, references to rows that no longer exist). Fix problems
   in the sheet and re-run until it says "No problems found". If needed, see the
   `--skip-invalid` / `--null-orphans` flags described at the top of the script.
3. `npm run db:migrate-sheets -- --apply` — inserts everything in one transaction and verifies
   the row counts; on any error nothing is written.
4. Deploy the PostgreSQL version of the app.

Rollback: the sheet is untouched, so redeploying the previous (Sheets) version restores the old
behaviour. Anything entered in the new version after cutover would need to be re-entered.

## 5. Create the Drive photo folder

Create a regular folder in **My Drive**. Share it as **Editor** with:
- the service account's email (from step 2) — used for reading/streaming photos back to the app
- the Google account you authorized in step 3b — used for uploading (if it's the folder owner,
  it already has access)

Copy the folder's ID from its URL (`https://drive.google.com/drive/folders/<ID>`) into
`GOOGLE_DRIVE_FOLDER_ID`.

Note: permission changes can take a few minutes to propagate to the API even though the UI shows
them immediately -- if you get a "File not found" error right after sharing, wait a few minutes
and retry before assuming something's misconfigured.

## 6. Local development

1. Copy `.env.example` to `.env.local` and fill in every value from the steps above.
2. `npm install`
3. `npm run db:migrate` (creates/updates the tables in `DATABASE_URL`)
4. `npm run dev`, then visit http://localhost:3000 and sign in with an account on the
   `ALLOWED_EMAIL_DOMAIN` you configured (currently `astonhotelsinternational.com`).

## 7. Deploy to Vercel

1. Push this repo to GitHub (or connect the local folder) and import it into Vercel.
2. In **Project Settings > Environment Variables**, add every variable from `.env.example` with
   real values (use the production `AUTH_URL`, e.g. `https://your-app.vercel.app`).
3. Add the Vercel URL's OAuth callback to the OAuth client's authorized redirect URIs (step 3).
4. Deploy, then repeat the sign-in and create/edit checks from step 6 against the live URL.
