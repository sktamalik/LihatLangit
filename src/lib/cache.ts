interface CacheEntry<T> {
  payload: T;
  fetchedAt: string;
  expiresAt: number;
  staleUntil: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 30 * 60 * 1000;
const DEFAULT_STALE_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 500;

export function setCache<T>(
  key: string,
  payload: T,
  ttlMs: number = DEFAULT_TTL_MS,
  staleMs: number = DEFAULT_STALE_MS
): void {
  const now = Date.now();
  store.set(key, {
    payload,
    fetchedAt: new Date().toISOString(),
    expiresAt: now + ttlMs,
    staleUntil: now + ttlMs + staleMs,
  });
  evictIfOverflow();
}

/** Drop expired entries; if still over cap, evict oldest (FIFO). */
function evictIfOverflow(): void {
  if (store.size <= MAX_ENTRIES) return;

  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.staleUntil) store.delete(key);
  }

  if (store.size > MAX_ENTRIES) {
    const oldestKey = store.keys().next().value;
    if (oldestKey !== undefined) store.delete(oldestKey);
  }
}

export type CacheResult<T> =
  | { status: "fresh"; payload: T; fetchedAt: string }
  | { status: "stale"; payload: T; fetchedAt: string }
  | { status: "miss" };

export function getCache<T>(key: string): CacheResult<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return { status: "miss" };

  const now = Date.now();
  if (now < entry.expiresAt) {
    return {
      status: "fresh",
      payload: entry.payload,
      fetchedAt: entry.fetchedAt,
    };
  }
  if (now < entry.staleUntil) {
    return {
      status: "stale",
      payload: entry.payload,
      fetchedAt: entry.fetchedAt,
    };
  }

  store.delete(key);
  return { status: "miss" };
}

export function clearCache(): void {
  store.clear();
}
