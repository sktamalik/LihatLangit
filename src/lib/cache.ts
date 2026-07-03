/**
 * Simple in-memory cache with TTL and stale retention.
 *
 * For MVP. Replace with Redis/Upstash for production.
 */

interface CacheEntry<T> {
  payload: T;
  fetchedAt: string; // ISO timestamp
  expiresAt: number; // epoch ms
  staleUntil: number; // epoch ms
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 3600_000; // 1 hour
const DEFAULT_STALE_MS = 86_400_000; // 24 hours

function now(): number {
  return Date.now();
}

export function setCache<T>(
  key: string,
  payload: T,
  ttlMs: number = DEFAULT_TTL_MS,
  staleMs: number = DEFAULT_STALE_MS
): void {
  const fetchedAt = new Date().toISOString();
  store.set(key, {
    payload,
    fetchedAt,
    expiresAt: now() + ttlMs,
    staleUntil: now() + ttlMs + staleMs,
  });
}

export type CacheResult<T> =
  | { status: "fresh"; payload: T; fetchedAt: string }
  | { status: "stale"; payload: T; fetchedAt: string }
  | { status: "miss" };

export function getCache<T>(key: string): CacheResult<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    return { status: "miss" };
  }

  const currentTime = now();

  if (currentTime < entry.expiresAt) {
    return {
      status: "fresh",
      payload: entry.payload,
      fetchedAt: entry.fetchedAt,
    };
  }

  if (currentTime < entry.staleUntil) {
    return {
      status: "stale",
      payload: entry.payload,
      fetchedAt: entry.fetchedAt,
    };
  }

  // Expired beyond stale retention
  store.delete(key);
  return { status: "miss" };
}

export function clearCache(): void {
  store.clear();
}

/** Get cache size for diagnostics */
export function cacheSize(): number {
  return store.size;
}
