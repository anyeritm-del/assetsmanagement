/**
 * In-memory TTL cache for Sheets reads, scoped to a single server instance.
 * On Vercel serverless this resets per cold start -- an accepted MVP trade-off
 * given the low traffic/row-count this app is built for (see plan doc).
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 20_000;

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const entry = store.get(key);
  if (entry && entry.expiresAt > Date.now()) {
    return entry.data as T;
  }
  const data = await fetcher();
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

export function invalidate(key: string): void {
  store.delete(key);
}
