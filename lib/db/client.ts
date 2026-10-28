import { rootCertificates } from "node:tls";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";
import * as schema from "./schema";
import { CLOUDFLARE_ORIGIN_CA_RSA_ROOT } from "./cloudflareOriginCa";

// node-postgres (pg), not postgres.js: postgres.js pipelines several queries onto one connection,
// and the Sumopod pooler stops answering when ~4+ parameterless queries are pipelined (verified
// 2026-10-28). pg runs one query per connection at a time and queues the rest client-side.

export type Database = NodePgDatabase<typeof schema>;
/** Either the root db or a transaction handle -- both expose the same query API. */
export type Executor = Database | Parameters<Parameters<Database["transaction"]>[0]>[0];

// Reuse one pool per server instance. In dev, Next.js hot reload re-evaluates modules, so the
// pool is parked on globalThis to avoid leaking a new set of connections on every edit.
const globalForDb = globalThis as unknown as { db?: Database; pool?: Pool };

function poolConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("Missing DATABASE_URL environment variable");
  }
  // pg lets ssl* query parameters in the URL override the `ssl` object below, so strip them and
  // configure TLS in one place.
  const url = new URL(raw);
  const sslMode = url.searchParams.get("sslmode");
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("ssl") || key === "uselibpqcompat") url.searchParams.delete(key);
  }

  return {
    connectionString: url.toString(),
    // Each Vercel function instance handles one request at a time, so a small pool is enough and
    // keeps the total connection count under the database's limit as instances scale out.
    max: Number(process.env.DATABASE_POOL_MAX) || 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    // Always verify the server certificate. Public CAs + the Cloudflare Origin CA used by Sumopod.
    // sslmode=disable is only for a local, non-TLS Postgres.
    ssl:
      sslMode === "disable"
        ? false
        : { rejectUnauthorized: true, ca: [...rootCertificates, CLOUDFLARE_ORIGIN_CA_RSA_ROOT] },
  };
}

export function getDb(): Database {
  if (!globalForDb.db) {
    const pool = new Pool(poolConfig());
    globalForDb.pool = pool;
    globalForDb.db = drizzle(pool, { schema });
  }
  return globalForDb.db;
}

/** Closes the pool -- only for one-off scripts, so the Node process can exit. */
export async function closeDb(): Promise<void> {
  await globalForDb.pool?.end();
  globalForDb.db = undefined;
  globalForDb.pool = undefined;
}
