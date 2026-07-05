/**
 * Disk-persisted cache with in-memory speed, TTL, and stale retention.
 *
 * Cache entries survive server restart — written to a temporary directory
 * (os.tmpdir() or /tmp) so it works on Vercel read-only filesystem.
 * Falls back to in-memory-only if disk write fails.
 */

import fs from "fs";
import path from "path";
import os from "os";

interface CacheEntry<T> {
  payload: T;
  fetchedAt: string; // ISO timestamp
  expiresAt: number; // epoch ms
  staleUntil: number; // epoch ms
}

// In-memory store for speed (disk is for persistence)
const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL_MS = 3600_000; // 1 hour
const DEFAULT_STALE_MS = 86_400_000; // 24 hours

// Disk persistence directory — Vercel-compatible via os.tmpdir()
let CACHE_DIR = "";
try {
  CACHE_DIR = path.join(os.tmpdir(), "lihatlangit-cache");
  fs.mkdirSync(CACHE_DIR, { recursive: true });
} catch {
  // Disk persistence unavailable — will use in-memory only
}

function diskPath(key: string): string {
  // Sanitize key for filesystem
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(CACHE_DIR, `${safeKey}.json`);
}

function saveToDisk<T>(key: string, entry: CacheEntry<T>): void {
  if (!CACHE_DIR) return;
  try {
    fs.writeFileSync(diskPath(key), JSON.stringify(entry), "utf-8");
  } catch {
    // Non-fatal — in-memory still works
  }
}

function loadFromDisk<T>(key: string): CacheEntry<T> | null {
  if (!CACHE_DIR) return null;
  try {
    const raw = fs.readFileSync(diskPath(key), "utf-8");
    return JSON.parse(raw) as CacheEntry<T>;
  } catch {
    return null;
  }
}

function deleteFromDisk(key: string): void {
  if (!CACHE_DIR) return;
  try {
    fs.unlinkSync(diskPath(key));
  } catch {
    // ignore
  }
}

function loadAllFromDisk(): void {
  if (!CACHE_DIR) return;
  try {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const key = file.replace(/\.json$/, "");
      // Reconstruct original key — this is lossy for special chars
      // but works for our alphanumeric cache keys
      try {
        const raw = fs.readFileSync(path.join(CACHE_DIR, file), "utf-8");
        const entry = JSON.parse(raw);
        store.set(key, entry);
      } catch {
        // skip corrupted entries
      }
    }
  } catch {
    // ignore
  }
}

// Warm from disk at module load
loadAllFromDisk();

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
  const entry: CacheEntry<T> = {
    payload,
    fetchedAt,
    expiresAt: now() + ttlMs,
    staleUntil: now() + ttlMs + staleMs,
  };
  store.set(key, entry);
  saveToDisk(key, entry);
}

export type CacheResult<T> =
  | { status: "fresh"; payload: T; fetchedAt: string }
  | { status: "stale"; payload: T; fetchedAt: string }
  | { status: "miss" };

export function getCache<T>(key: string): CacheResult<T> {
  let entry = store.get(key) as CacheEntry<T> | undefined;

  // Try disk if not in memory (e.g., after restart)
  if (!entry) {
    const diskEntry = loadFromDisk<T>(key);
    if (diskEntry) {
      store.set(key, diskEntry);
      entry = diskEntry;
    }
  }

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
  deleteFromDisk(key);
  return { status: "miss" };
}

export function clearCache(): void {
  store.clear();
  if (CACHE_DIR) {
    try {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    } catch {
      // ignore
    }
  }
}

/** Get cache size for diagnostics */
export function cacheSize(): number {
  return store.size;
}
