import { customType, numeric } from "drizzle-orm/pg-core";
import { sql, type SQL } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * timestamptz exposed to the app as an ISO 8601 string ("2026-10-28T03:15:00.000Z"), which is
 * the format every entity's created_at/updated_at/*_decided_at already used in Google Sheets.
 * drizzle's node-postgres driver hands us the raw text Postgres sends, e.g.
 * "2026-10-28 03:15:00+00" (the offset follows the session TimeZone, so any offset is handled).
 */
export const isoTimestamp = customType<{ data: string; driverData: string }>({
  dataType() {
    return "timestamp (3) with time zone";
  },
  fromDriver(value) {
    return parseTimestamp(value).toISOString();
  },
  toDriver(value) {
    return parseTimestamp(value).toISOString();
  },
});

function parseTimestamp(value: string): Date {
  // Postgres text output: "YYYY-MM-DD HH:MM:SS[.fff]+HH[:MM]". Normalize to ISO so Date parsing
  // doesn't depend on engine-specific leniency.
  const normalized = value.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp value: "${value}"`);
  }
  return date;
}

/** Money/quantity-like decimals, returned as a JS number (IDR values stay well within 2^53). */
export function money(name: string) {
  return numeric(name, { precision: 18, scale: 2, mode: "number" });
}

/** CHECK (column IN (...)) built from one of the `as const` arrays in lib/constants.ts. */
export function oneOf(column: AnyPgColumn, values: readonly string[]): SQL {
  const list = values.map((value) => `'${value.replace(/'/g, "''")}'`).join(", ");
  return sql`${column} in (${sql.raw(list)})`;
}
