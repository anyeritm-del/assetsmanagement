import { asc, eq, type InferInsertModel, type InferSelectModel, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import { getDb, type Executor } from "../db/client";

type TableWithId = PgTable & { id: PgColumn; created_at: PgColumn };

export interface TableRepository<TTable extends TableWithId> {
  /** All rows matching `where` (all rows if omitted), oldest first -- the order Sheets returned. */
  list(where?: SQL, executor?: Executor): Promise<InferSelectModel<TTable>[]>;
  getById(id: string, executor?: Executor): Promise<InferSelectModel<TTable> | null>;
  create(entity: InferInsertModel<TTable>, executor?: Executor): Promise<InferSelectModel<TTable>>;
  update(
    id: string,
    patch: Partial<InferInsertModel<TTable>>,
    executor?: Executor,
  ): Promise<InferSelectModel<TTable>>;
}

/**
 * Thin per-table CRUD used by every lib/repositories/* module (replaces the old Google Sheets
 * repository). Pass a transaction handle as `executor` to make several writes atomic.
 *
 * drizzle's query builder can't infer row types through a generic table parameter, hence the
 * casts below; the exported functions in each repository module are still fully typed against
 * lib/types.ts, so a schema/type mismatch fails to compile there.
 */
export function createTableRepository<TTable extends TableWithId>(
  table: TTable,
  label: string,
): TableRepository<TTable> {
  type Row = InferSelectModel<TTable>;
  const anyTable = table as PgTable & TableWithId;

  async function list(where?: SQL, executor: Executor = getDb()): Promise<Row[]> {
    const rows = await executor
      .select()
      .from(anyTable)
      .where(where)
      .orderBy(asc(table.created_at), asc(table.id));
    return rows as Row[];
  }

  async function getById(id: string, executor: Executor = getDb()): Promise<Row | null> {
    const rows = await executor.select().from(anyTable).where(eq(table.id, id)).limit(1);
    return (rows[0] as Row | undefined) ?? null;
  }

  async function create(
    entity: InferInsertModel<TTable>,
    executor: Executor = getDb(),
  ): Promise<Row> {
    const rows = await executor.insert(anyTable).values(entity).returning();
    return (rows as Row[])[0];
  }

  async function update(
    id: string,
    patch: Partial<InferInsertModel<TTable>>,
    executor: Executor = getDb(),
  ): Promise<Row> {
    // Never let a patch rewrite the primary key, even if a caller spreads a whole entity in.
    const changes = { ...(patch as Record<string, unknown>) };
    delete changes.id;
    const rows = (await executor
      .update(anyTable)
      .set(changes)
      .where(eq(table.id, id))
      .returning()) as Row[];
    if (rows.length === 0) {
      throw new Error(`${label} row with id "${id}" not found`);
    }
    return rows[0];
  }

  return { list, getById, create, update };
}
