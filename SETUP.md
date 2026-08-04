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

## 4. Create the Spreadsheet (the "database")

1. Create a new Google Sheet (can live in the same Drive folder as photos, or anywhere you like).
2. Create twenty-three tabs with these exact header rows in row 1:

   **Properties**
   ```
   id | name | code | status | created_at | updated_at
   ```

   **Buildings**
   ```
   id | property_id | name | description | total_floor | status | created_at | updated_at
   ```

   **Floors** (floors nested under a Building -- separate from the Building's own "Total Floor" count)
   ```
   id | property_id | building_id | name | description | status | created_at | updated_at
   ```

   **Rooms** (rooms nested under a Floor -- the most granular location, and what Items reference)
   ```
   id | property_id | building_id | floor_id | name | description | status | created_at | updated_at
   ```

   **Departments** (shared across all properties)
   ```
   id | code | name | created_at | updated_at
   ```

   **Equipment** (shared across all properties)
   ```
   id | code | name | description | created_at | updated_at
   ```

   **ArticleGroups** (shared across all properties)
   ```
   id | name | created_at | updated_at
   ```

   **Articles** (`article_group_id` references a row in **ArticleGroups**)
   ```
   id | article_group_id | name | code | unit | content | created_at | updated_at
   ```

   **Employees** (shared across all properties)
   ```
   id | name | email | created_at | updated_at
   ```

   **Users** (shared across all properties. Directory only for most levels -- creating a User here
   does not grant sign-in access, which is still controlled purely by `ALLOWED_EMAIL_DOMAIN`/
   `ALLOWED_EMAILS`. `password_hash` is a bcrypt hash, never the plaintext password, and isn't used
   by anything yet. Two things ARE enforced, both checked by matching the signed-in session's
   email against this sheet: (1) `assigned_property_id` (references **Properties**) is required
   when `level` is `property_admin` -- that user's property switcher is locked to only that hotel
   (`lib/selectedProperty.ts`); every other level keeps access to all properties. (2)
   `can_manage_maintenance` gates resolving Maintenance Requests (status/assignment) and running
   PM Check (`lib/maintenanceAuth.ts`) -- `administrator`/`owner` can always do this regardless of
   the flag; everyone else needs it checked. Creating Maintenance Requests/PM Schedules stays open
   to everyone.)
   ```
   id | name | email | level | status | password_hash | created_at | updated_at | assigned_property_id | can_manage_maintenance
   ```

   **Items** (`room_id`/`department_id`/`equipment_id`/`article_id`/`assigned_employee_id`/
   `purchase_order_id` reference rows in **Rooms**/**Departments**/**Equipment**/**Articles**/
   **Employees**/**PurchaseOrders**. The last 6 columns are appended at the end rather than
   inserted near their related columns, so an already-created sheet only needs columns added.)
   ```
   id | property_id | building_id | room_id | department_id | equipment_id | article_id | assigned_employee_id | name | category | code | serial_number | quantity | acquisition_value | book_value | status | notes | photo_drive_file_id | photo_view_link | created_at | updated_at | purchase_order_id | brand | item_type | lifetime_years | end_of_lifetime_date | warranty_months
   ```

   **Suppliers** (shared across all properties -- not scoped to a `property_id`)
   ```
   id | name | email | phone | address | created_at | updated_at | description
   ```

   **PurchaseOrders** (`supplier_id` references a row in **Suppliers**; scoped per property)
   ```
   id | property_id | supplier_id | received_date | purchase_number | title | value | description | quantity | photo_drive_file_id | photo_view_link | created_at | updated_at
   ```

   **OutgoingRecords** (asset loans from `source_property_id` to `destination_property_id`, one
   row per loan *request* -- the items being lent live in a separate **OutgoingRecordItems** tab
   below, since one request can lend several items at once. Sequential approval workflow: Financial
   Controller (fc) -> Human Resources (hr) -> General Manager (gm). Each stage's `_status` is
   `pending`, `approved`, or `rejected` -- a rejection at any stage is terminal. This is workflow
   *tracking* only: any signed-in user can record a decision for whichever stage is currently
   active, there's no per-role sign-in restriction, consistent with the rest of the app.)
   ```
   id | source_property_id | destination_property_id | reason | expected_return_date | requested_by_name | requested_by_email | fc_status | fc_decided_by | fc_decided_at | fc_notes | hr_status | hr_decided_by | hr_decided_at | hr_notes | gm_status | gm_decided_by | gm_decided_at | gm_notes | created_at | updated_at
   ```

   **OutgoingRecordItems** (`outgoing_record_id` references a row in **OutgoingRecords**; `item_id`
   references a row in **Items** -- one row per item line on a loan request)
   ```
   id | outgoing_record_id | item_id | quantity | created_at
   ```

   **MaintenanceCategories** (shared across all properties, e.g. Electrical, Plumbing, HVAC/AC, IT
   & Network)
   ```
   id | name | created_at | updated_at
   ```

   **MaintenanceAreaTypes** (shared across all properties, e.g. Guest Room, Lobby, Kitchen,
   Corridor, Back of House -- a type of area, distinct from the specific Room/Floor it's in)
   ```
   id | name | created_at | updated_at
   ```

   **MaintenanceRequests** (`department_id` references **Departments**; `building_id`/`floor_id`
   reference **Buildings**/**Floors**; `area_type_id` references **MaintenanceAreaTypes**;
   `category_id` references **MaintenanceCategories**; `item_id` optionally references **Items**.
   `status` is simple tracking only -- open -> in_progress -> completed/cancelled -- any signed-in
   user can update it, there's no approval chain for this module. `department_id`/`area_type_id`/
   `category_id` may be blank: "Run PM Check" (see **PMSchedules** below) auto-generates a ticket
   here knowing only the asset, so those three are left for staff to fill in during triage.
   `pm_schedule_id` references **PMSchedules** and is only set on tickets created that way -- blank
   for ones filed manually through the New Maintenance Request form. `assigned_to_employee_id`
   references **Employees** -- the technician currently responsible for the ticket, settable by
   anyone signed in from the ticket's detail page; drives the **My Jobs** page, which matches the
   signed-in user's email against an Employees row to find "their" assigned tickets.)
   ```
   id | property_id | department_id | requester_name | requester_email | building_id | floor_id | area_type_id | room_number | category_id | priority | item_id | problem | description | requires_shutdown | requires_external_vendor | status | photo_drive_file_id | photo_view_link | created_at | updated_at | pm_schedule_id | assigned_to_employee_id
   ```

   **PMSchedules** (Preventive Maintenance -- `item_id` references **Items**;
   `default_technician_employee_id` optionally references **Employees**. Next Due date isn't
   stored -- it's computed on read as `last_run_date` (or `start_date`, if it's never run yet) +
   `frequency_interval` `frequency_unit`s, so it can't drift from the row it's based on. "Run PM
   Check" on the Preventive Maintenance page auto-creates a **MaintenanceRequests** ticket for any
   schedule that's due_soon/overdue and doesn't already have one open.)
   ```
   id | property_id | item_id | title | description | frequency_interval | frequency_unit | start_date | priority | default_technician_employee_id | last_run_date | created_at | updated_at
   ```

   **DisposalRequests** (single-step approval, workflow tracking only like the other approval
   flows -- `approver_user_id` references **Users** and just records who the request was routed
   to; any signed-in user can actually record the Approve/Reject decision. Approving auto-sets
   every linked Item's status to `disposed`.)
   ```
   id | property_id | reason | note | photo_drive_file_id | photo_view_link | approver_user_id | requester_name | requester_email | status | decided_by | decided_at | created_at | updated_at
   ```

   **DisposalRequestItems** (`disposal_request_id` references **DisposalRequests**; `item_id`
   references **Items** -- one row per item on a disposal request, since a single request can
   dispose of several items at once)
   ```
   id | disposal_request_id | item_id | created_at
   ```

   **MovementRequests** (relocate item(s) to a different Building/Floor/Room *within the same
   hotel* -- distinct from **OutgoingRecords**, which is for lending an asset to a *different*
   hotel with a multi-stage FC/HR/GM approval chain. `destination_building_id` references
   **Buildings**; `destination_room_id` optionally references **Rooms**; `approver_user_id`
   references **Users** and is workflow tracking only, same as DisposalRequests. Approving auto-
   updates every linked Item's `building_id`/`room_id` to the destination.)
   ```
   id | property_id | destination_building_id | destination_room_id | note | approver_user_id | requester_name | requester_email | status | decided_by | decided_at | created_at | updated_at
   ```

   **MovementRequestItems** (`movement_request_id` references **MovementRequests**; `item_id`
   references **Items** -- one row per item on a movement request)
   ```
   id | movement_request_id | item_id | created_at
   ```
3. Add at least one row to **Properties** by hand so the app has something to show, e.g.:
   ```
   <any-uuid> | ASTON Serang Hotel & Convention Center | aston-serang | active | 2026-01-01T00:00:00.000Z | 2026-01-01T00:00:00.000Z
   ```
   (Generate a UUID from any UUID generator, or run `node -e "console.log(crypto.randomUUID())"`.)
4. Click **Share**, add the service account's email (from step 2) with **Editor** access.
5. Copy the spreadsheet ID from its URL — `https://docs.google.com/spreadsheets/d/<ID>/edit` →
   `GOOGLE_SHEETS_SPREADSHEET_ID`.

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
3. `npm run dev`, then visit http://localhost:3000 and sign in with an account on the
   `ALLOWED_EMAIL_DOMAIN` you configured (currently `astonhotelsinternational.com`).

## 7. Deploy to Vercel

1. Push this repo to GitHub (or connect the local folder) and import it into Vercel.
2. In **Project Settings > Environment Variables**, add every variable from `.env.example` with
   real values (use the production `AUTH_URL`, e.g. `https://your-app.vercel.app`).
3. Add the Vercel URL's OAuth callback to the OAuth client's authorized redirect URIs (step 3).
4. Deploy, then repeat the sign-in and create/edit checks from step 6 against the live URL.
