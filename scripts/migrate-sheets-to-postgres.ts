/* One-time copy of every Google Sheets tab into the PostgreSQL tables from lib/db/schema.ts.
 *
 *   npm run db:migrate-sheets                 # dry run: read + validate + report, writes nothing
 *   npm run db:migrate-sheets -- --apply      # write everything in ONE transaction
 *   npm run db:migrate-sheets -- --apply --replace
 *                                             # same, but first empties the app's tables (inside
 *                                             # the same transaction) -- for re-importing fresher
 *                                             # sheet data over an earlier trial import
 *
 * Extra flags (only when the dry-run report says you need them):
 *   --skip-invalid   drop rows that fail validation. The old Sheets app already hid these rows
 *                    ("Skipping malformed ... row" warnings), so users never saw them.
 *   --null-orphans   set an optional reference (e.g. items.room_id) to NULL when it points at a
 *                    row that no longer exists. Orphaned *required* references always abort.
 *
 * Safety: the spreadsheet is only read, never modified. Without --replace, --apply refuses to run
 * unless every target table is empty. Either everything is written or nothing is -- so undoing a
 * migration is just emptying the tables again.
 */
import { getTableColumns, sql } from "drizzle-orm";
import { getTableConfig, type PgTable } from "drizzle-orm/pg-core";
import type { ZodType } from "zod";
import { getSheetsClient, getSpreadsheetId } from "../lib/google/sheetsClient";
import { closeDb, getDb } from "../lib/db/client";
import * as schema from "../lib/db/schema";
import { propertySchema } from "../lib/validation/property";
import { buildingSchema } from "../lib/validation/building";
import { floorSchema } from "../lib/validation/floor";
import { roomSchema } from "../lib/validation/room";
import { departmentSchema } from "../lib/validation/department";
import { equipmentSchema } from "../lib/validation/equipment";
import { articleGroupSchema } from "../lib/validation/articleGroup";
import { articleSchema } from "../lib/validation/article";
import { employeeSchema } from "../lib/validation/employee";
import { userSchema } from "../lib/validation/user";
import { supplierSchema } from "../lib/validation/supplier";
import { maintenanceCategorySchema } from "../lib/validation/maintenanceCategory";
import { maintenanceAreaTypeSchema } from "../lib/validation/maintenanceAreaType";
import { purchaseOrderSchema } from "../lib/validation/purchaseOrder";
import { itemSchema } from "../lib/validation/item";
import { pmScheduleSchema } from "../lib/validation/pmSchedule";
import { maintenanceRequestSchema } from "../lib/validation/maintenanceRequest";
import { outgoingRecordItemSchema, outgoingRecordSchema } from "../lib/validation/outgoingRecord";
import {
  disposalRequestItemSchema,
  disposalRequestSchema,
} from "../lib/validation/disposalRequest";
import {
  movementRequestItemSchema,
  movementRequestSchema,
} from "../lib/validation/movementRequest";

interface Mapping {
  sheet: string;
  table: PgTable;
  validator: ZodType;
}

// Parents before children, so foreign keys are satisfied in insert order.
const MAPPINGS: Mapping[] = [
  { sheet: "Properties", table: schema.properties, validator: propertySchema },
  { sheet: "Departments", table: schema.departments, validator: departmentSchema },
  { sheet: "Equipment", table: schema.equipment, validator: equipmentSchema },
  { sheet: "ArticleGroups", table: schema.articleGroups, validator: articleGroupSchema },
  { sheet: "Employees", table: schema.employees, validator: employeeSchema },
  { sheet: "Suppliers", table: schema.suppliers, validator: supplierSchema },
  { sheet: "MaintenanceCategories", table: schema.maintenanceCategories, validator: maintenanceCategorySchema },
  { sheet: "MaintenanceAreaTypes", table: schema.maintenanceAreaTypes, validator: maintenanceAreaTypeSchema },
  { sheet: "Buildings", table: schema.buildings, validator: buildingSchema },
  { sheet: "Floors", table: schema.floors, validator: floorSchema },
  { sheet: "Rooms", table: schema.rooms, validator: roomSchema },
  { sheet: "Users", table: schema.users, validator: userSchema },
  { sheet: "Articles", table: schema.articles, validator: articleSchema },
  { sheet: "PurchaseOrders", table: schema.purchaseOrders, validator: purchaseOrderSchema },
  { sheet: "Items", table: schema.items, validator: itemSchema },
  { sheet: "PMSchedules", table: schema.pmSchedules, validator: pmScheduleSchema },
  { sheet: "MaintenanceRequests", table: schema.maintenanceRequests, validator: maintenanceRequestSchema },
  { sheet: "OutgoingRecords", table: schema.outgoingRecords, validator: outgoingRecordSchema },
  { sheet: "OutgoingRecordItems", table: schema.outgoingRecordItems, validator: outgoingRecordItemSchema },
  { sheet: "DisposalRequests", table: schema.disposalRequests, validator: disposalRequestSchema },
  { sheet: "DisposalRequestItems", table: schema.disposalRequestItems, validator: disposalRequestItemSchema },
  { sheet: "MovementRequests", table: schema.movementRequests, validator: movementRequestSchema },
  { sheet: "MovementRequestItems", table: schema.movementRequestItems, validator: movementRequestItemSchema },
];

// Column order per tab, copied verbatim from the HEADERS arrays of the old Sheets repositories
// (git history: lib/repositories/*.ts before the PostgreSQL migration). The old app read cells
// by POSITION using these arrays and never looked at row 1, so the sheets' own header rows are
// only labels -- several have typos or are missing newer columns -- and must not be trusted.
const SHEET_COLUMNS: Record<string, string[]> = {
  Properties: ["id", "name", "code", "status", "created_at", "updated_at"],
  Departments: ["id", "code", "name", "created_at", "updated_at"],
  Equipment: ["id", "code", "name", "description", "created_at", "updated_at"],
  ArticleGroups: ["id", "name", "created_at", "updated_at"],
  Employees: ["id", "name", "email", "created_at", "updated_at"],
  Suppliers: ["id", "name", "email", "phone", "address", "created_at", "updated_at", "description"],
  MaintenanceCategories: ["id", "name", "created_at", "updated_at"],
  MaintenanceAreaTypes: ["id", "name", "created_at", "updated_at"],
  Buildings: ["id", "property_id", "name", "description", "total_floor", "status", "created_at", "updated_at"],
  Floors: ["id", "property_id", "building_id", "name", "description", "status", "created_at", "updated_at"],
  Rooms: ["id", "property_id", "building_id", "floor_id", "name", "description", "status", "created_at", "updated_at"],
  Users: ["id", "name", "email", "level", "status", "password_hash", "created_at", "updated_at", "assigned_property_id", "can_manage_maintenance"],
  Articles: ["id", "article_group_id", "name", "code", "unit", "content", "created_at", "updated_at"],
  PurchaseOrders: ["id", "property_id", "supplier_id", "received_date", "purchase_number", "title", "value", "description", "quantity", "photo_drive_file_id", "photo_view_link", "created_at", "updated_at"],
  Items: ["id", "property_id", "building_id", "room_id", "department_id", "equipment_id", "article_id", "assigned_employee_id", "name", "category", "code", "serial_number", "quantity", "acquisition_value", "book_value", "status", "notes", "photo_drive_file_id", "photo_view_link", "created_at", "updated_at", "purchase_order_id", "brand", "item_type", "lifetime_years", "end_of_lifetime_date", "warranty_months"],
  PMSchedules: ["id", "property_id", "item_id", "title", "description", "frequency_interval", "frequency_unit", "start_date", "priority", "default_technician_employee_id", "last_run_date", "created_at", "updated_at"],
  MaintenanceRequests: ["id", "property_id", "department_id", "requester_name", "requester_email", "building_id", "floor_id", "area_type_id", "room_number", "category_id", "priority", "item_id", "problem", "description", "requires_shutdown", "requires_external_vendor", "status", "photo_drive_file_id", "photo_view_link", "created_at", "updated_at", "pm_schedule_id", "assigned_to_employee_id"],
  OutgoingRecords: ["id", "source_property_id", "destination_property_id", "reason", "expected_return_date", "requested_by_name", "requested_by_email", "fc_status", "fc_decided_by", "fc_decided_at", "fc_notes", "hr_status", "hr_decided_by", "hr_decided_at", "hr_notes", "gm_status", "gm_decided_by", "gm_decided_at", "gm_notes", "created_at", "updated_at"],
  OutgoingRecordItems: ["id", "outgoing_record_id", "item_id", "quantity", "created_at"],
  DisposalRequests: ["id", "property_id", "reason", "note", "photo_drive_file_id", "photo_view_link", "approver_user_id", "requester_name", "requester_email", "status", "decided_by", "decided_at", "created_at", "updated_at"],
  DisposalRequestItems: ["id", "disposal_request_id", "item_id", "created_at"],
  MovementRequests: ["id", "property_id", "destination_building_id", "destination_room_id", "note", "approver_user_id", "requester_name", "requester_email", "status", "decided_by", "decided_at", "created_at", "updated_at"],
  MovementRequestItems: ["id", "movement_request_id", "item_id", "created_at"],
};

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const SKIP_INVALID = args.has("--skip-invalid");
const NULL_ORPHANS = args.has("--null-orphans");
const REPLACE = args.has("--replace");
const INSERT_BATCH_SIZE = 500;
const SHEETS_DATE_EPOCH_UTC_MS = Date.UTC(1899, 11, 30);

type Row = Record<string, unknown>;

interface TableResult {
  mapping: Mapping;
  tableName: string;
  rows: Row[];
  /** Spreadsheet row number (1-based, as shown in Sheets) for each entry in `rows`. */
  sheetRowNumbers: number[];
}

const problems: string[] = [];
const notes: string[] = [];

function isBlank(value: unknown): boolean {
  return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

function sheetSerialToDate(serial: number): Date {
  return new Date(SHEETS_DATE_EPOCH_UTC_MS + serial * 86_400_000);
}

/** Converts one raw cell to the JS value the column (and lib/types.ts) expects. Throws on bad data. */
function convertCell(sqlType: string, notNull: boolean, defaultValue: unknown, raw: unknown): unknown {
  if (isBlank(raw)) {
    if (!notNull) return null;
    // Mirrors the old fromRow fallbacks, e.g. `status: record.status || "active"`.
    if (defaultValue !== undefined && typeof defaultValue !== "object") return defaultValue;
    if (sqlType === "text") return "";
    if (sqlType === "boolean") return false;
    throw new Error("is required but blank");
  }

  if (sqlType === "uuid") return String(raw).trim().toLowerCase();
  if (sqlType === "text") return String(raw).trim();
  if (sqlType === "boolean") {
    return raw === true || raw === "true" || raw === "TRUE" || raw === 1 || raw === "1";
  }
  if (sqlType === "integer" || sqlType.startsWith("numeric")) {
    const num = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, ""));
    if (!Number.isFinite(num)) throw new Error(`"${raw}" is not a number`);
    if (sqlType === "integer" && !Number.isInteger(num)) throw new Error(`"${raw}" is not a whole number`);
    return num;
  }
  if (sqlType === "date") {
    if (typeof raw === "number") return sheetSerialToDate(raw).toISOString().slice(0, 10);
    const text = String(raw).trim();
    const match = text.match(/^(\d{4}-\d{2}-\d{2})(T.*)?$/);
    if (!match || Number.isNaN(Date.parse(match[1]))) throw new Error(`"${raw}" is not a YYYY-MM-DD date`);
    return match[1];
  }
  if (sqlType.startsWith("timestamp")) {
    const date = typeof raw === "number" ? sheetSerialToDate(raw) : new Date(String(raw).trim());
    if (Number.isNaN(date.getTime())) throw new Error(`"${raw}" is not a valid timestamp`);
    return date.toISOString();
  }
  throw new Error(`unsupported column type ${sqlType}`);
}

async function readSheet(mapping: Mapping): Promise<TableResult> {
  const tableName = getTableConfig(mapping.table).name;
  const response = await getSheetsClient().spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: mapping.sheet,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const [headerRow = [], ...dataRows] = response.data.values ?? [];
  const headers = SHEET_COLUMNS[mapping.sheet];
  const columns = Object.values(getTableColumns(mapping.table));

  const tableColumns = columns.map((c) => c.name).sort().join(",");
  if ([...headers].sort().join(",") !== tableColumns) {
    throw new Error(`${mapping.sheet}: SHEET_COLUMNS does not match the ${tableName} table columns`);
  }
  const labels = headers.map((_, i) => String(headerRow[i] ?? "").trim());
  if (labels.join(",") !== headers.join(",")) {
    notes.push(`${mapping.sheet}: row-1 labels differ from the real column order (harmless, labels are ignored)`);
  }

  const rows: Row[] = [];
  const sheetRowNumbers: number[] = [];
  dataRows.forEach((cells, index) => {
    const sheetRow = index + 2;
    const raw: Row = {};
    headers.forEach((header, i) => (raw[header] = cells[i]));
    if (isBlank(raw.id)) return; // blank rows were skipped by the old app too

    const row: Row = {};
    const errors: string[] = [];
    for (const column of columns) {
      try {
        row[column.name] = convertCell(column.getSQLType(), column.notNull, column.default, raw[column.name]);
      } catch (error) {
        if (column.name === "created_at" || column.name === "updated_at") {
          // Fall back to the sibling timestamp, then to now, rather than dropping a real record.
          row[column.name] = null;
        } else {
          errors.push(`${column.name} ${(error as Error).message}`);
        }
      }
    }
    row.created_at ??= row.updated_at ?? new Date().toISOString();
    row.updated_at ??= row.created_at;

    const parsed = mapping.validator.safeParse(row);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) errors.push(`${issue.path.join(".")}: ${issue.message}`);
    }
    if (errors.length) {
      const message = `${mapping.sheet} row ${sheetRow} (id ${String(raw.id)}): ${[...new Set(errors)].join("; ")}`;
      if (SKIP_INVALID) notes.push(`SKIPPED ${message}`);
      else problems.push(message);
      return;
    }
    rows.push(row);
    sheetRowNumbers.push(sheetRow);
  });

  return { mapping, tableName, rows, sheetRowNumbers };
}

function checkDuplicateIds(result: TableResult): void {
  const seen = new Map<unknown, number>();
  result.rows.forEach((row, i) => {
    const previous = seen.get(row.id);
    if (previous !== undefined) {
      problems.push(`${result.mapping.sheet}: id ${String(row.id)} appears on rows ${previous} and ${result.sheetRowNumbers[i]}`);
    } else {
      seen.set(row.id, result.sheetRowNumbers[i]);
    }
  });
}

function checkUserEmails(result: TableResult): void {
  const seen = new Map<string, number>();
  result.rows.forEach((row, i) => {
    const email = String(row.email).toLowerCase();
    const previous = seen.get(email);
    if (previous !== undefined) {
      problems.push(`Users: email ${email} appears on rows ${previous} and ${result.sheetRowNumbers[i]} (must be unique)`);
    } else {
      seen.set(email, result.sheetRowNumbers[i]);
    }
  });
}

function checkForeignKeys(result: TableResult, idsByTable: Map<string, Set<unknown>>): void {
  for (const fk of getTableConfig(result.mapping.table).foreignKeys) {
    const reference = fk.reference();
    const column = reference.columns[0];
    const parentName = getTableConfig(reference.foreignTable).name;
    const parentIds = idsByTable.get(parentName) ?? new Set();
    result.rows.forEach((row, i) => {
      const value = row[column.name];
      if (value === null || parentIds.has(value)) return;
      const where = `${result.mapping.sheet} row ${result.sheetRowNumbers[i]} (id ${String(row.id)}): ${column.name} ${String(value)} not found in ${parentName}`;
      if (!column.notNull && NULL_ORPHANS) {
        row[column.name] = null;
        notes.push(`NULLED ${where}`);
      } else {
        problems.push(where);
      }
    });
  }
}

async function main() {
  console.log(APPLY ? "Mode: APPLY (writes to Postgres)" : "Mode: dry run (nothing is written)");

  const results: TableResult[] = [];
  for (const mapping of MAPPINGS) {
    results.push(await readSheet(mapping)); // sequential: stays under the Sheets read quota
  }

  const idsByTable = new Map(results.map((r) => [r.tableName, new Set(r.rows.map((row) => row.id))]));
  for (const result of results) {
    checkDuplicateIds(result);
    if (result.tableName === "users") checkUserEmails(result);
    checkForeignKeys(result, idsByTable);
  }

  const db = getDb();
  const nonEmpty: string[] = [];
  for (const result of results) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(result.mapping.table);
    if (count > 0) nonEmpty.push(`${result.tableName} (${count} rows)`);
  }
  if (nonEmpty.length) {
    if (REPLACE) notes.push(`--replace: will empty ${nonEmpty.join(", ")} before inserting`);
    else problems.push(`Target tables are not empty (use --replace to overwrite): ${nonEmpty.join(", ")}`);
  }

  console.log("\nRows ready per table:");
  for (const r of results) console.log(`  ${r.mapping.sheet.padEnd(22)} → ${r.tableName.padEnd(24)} ${r.rows.length}`);
  if (notes.length) {
    console.log(`\nNotes (${notes.length}):`);
    notes.forEach((n) => console.log(`  - ${n}`));
  }
  if (problems.length) {
    console.log(`\nProblems (${problems.length}) -- fix them in the sheet, or see the flags at the top of this script:`);
    problems.forEach((p) => console.log(`  ✗ ${p}`));
    process.exitCode = 1;
    return;
  }
  if (!APPLY) {
    console.log("\nNo problems found. Re-run with --apply to write the data.");
    return;
  }

  await db.transaction(async (tx) => {
    if (REPLACE) {
      const tableList = results.map((r) => `"${r.tableName}"`).join(", ");
      await tx.execute(sql.raw(`TRUNCATE ${tableList}`));
    }
    for (const result of results) {
      for (let i = 0; i < result.rows.length; i += INSERT_BATCH_SIZE) {
        await tx.insert(result.mapping.table).values(result.rows.slice(i, i + INSERT_BATCH_SIZE));
      }
    }
    // Verify inside the transaction, so a mismatch rolls everything back.
    for (const result of results) {
      const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(result.mapping.table);
      if (count !== result.rows.length) {
        throw new Error(`${result.tableName}: expected ${result.rows.length} rows, found ${count}`);
      }
    }
  });
  console.log("\n✓ Migration committed. Row counts verified for every table.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => closeDb());
