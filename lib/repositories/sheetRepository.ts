import { getSheetsClient, getSpreadsheetId } from "../google/sheetsClient";
import { cached, invalidate } from "../cache";

export interface SheetRepositoryOptions<T> {
  sheetName: string;
  headers: string[];
  fromRow: (record: Record<string, unknown>) => T | null;
  toRow: (entity: T) => Record<string, unknown>;
}

export interface SheetRepository<T> {
  list(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
}

function rowToRecord(headers: string[], row: unknown[]): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  headers.forEach((header, index) => {
    record[header] = row[index];
  });
  return record;
}

function recordToRow(headers: string[], record: Record<string, unknown>): unknown[] {
  return headers.map((header) => {
    const value = record[header];
    if (value === null || value === undefined) return "";
    return value;
  });
}

function columnLetter(count: number): string {
  let n = count;
  let letters = "";
  while (n > 0) {
    const remainder = (n - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}

export function createSheetRepository<T extends { id: string }>(
  options: SheetRepositoryOptions<T>,
): SheetRepository<T> {
  const { sheetName, headers, fromRow, toRow } = options;
  const lastColumn = columnLetter(headers.length);
  const range = `${sheetName}!A2:${lastColumn}`;
  const cacheKey = `sheet:${sheetName}`;

  async function fetchRows(): Promise<{ rows: T[]; rowIndexById: Map<string, number> }> {
    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range,
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const values = response.data.values ?? [];
    const rows: T[] = [];
    const rowIndexById = new Map<string, number>();

    values.forEach((row, i) => {
      const record = rowToRecord(headers, row);
      if (!record.id) return; // skip blank rows
      const entity = fromRow(record);
      if (!entity) return;
      rows.push(entity);
      rowIndexById.set(entity.id, i + 2); // +2: header row + 1-indexing
    });

    return { rows, rowIndexById };
  }

  async function list(): Promise<T[]> {
    const { rows } = await cached(cacheKey, fetchRows);
    return rows;
  }

  async function getById(id: string): Promise<T | null> {
    const rows = await list();
    return rows.find((row) => row.id === id) ?? null;
  }

  async function create(entity: T): Promise<T> {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId(),
      range: `${sheetName}!A1`,
      // RAW (not USER_ENTERED) so Sheets never auto-converts date/number-looking strings --
      // e.g. a "YYYY-MM-DD" date input value would otherwise get silently converted to a Sheets
      // internal date serial number, which can't be reconstructed back into that same string.
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [recordToRow(headers, toRow(entity))] },
    });
    invalidate(cacheKey);
    return entity;
  }

  async function update(id: string, patch: Partial<T>): Promise<T> {
    // Bypass the cache here: we need the current row index and latest values,
    // and a stale index would silently overwrite the wrong row.
    const { rows, rowIndexById } = await fetchRows();
    const existing = rows.find((row) => row.id === id);
    const rowIndex = rowIndexById.get(id);
    if (!existing || !rowIndex) {
      throw new Error(`${sheetName} row with id "${id}" not found`);
    }
    const updated: T = { ...existing, ...patch };
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `${sheetName}!A${rowIndex}:${lastColumn}${rowIndex}`,
      // RAW (not USER_ENTERED) so Sheets never auto-converts date/number-looking strings --
      // e.g. a "YYYY-MM-DD" date input value would otherwise get silently converted to a Sheets
      // internal date serial number, which can't be reconstructed back into that same string.
      valueInputOption: "RAW",
      requestBody: { values: [recordToRow(headers, toRow(updated))] },
    });
    invalidate(cacheKey);
    return updated;
  }

  return { list, getById, create, update };
}
