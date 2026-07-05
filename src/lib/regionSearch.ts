/**
 * Region search utilities using local adm4 dataset.
 * Optimized for large dataset (80K+ entries) with lazy-loaded index.
 *
 * Data is loaded asynchronously from public/data/regions-adm4.json
 * on first use — NOT bundled with the serverless function.
 */

import fs from "fs";
import path from "path";
import type { Region } from "@/types/weather";

const MAX_RESULTS = 20;

// Multiple possible paths for different deployment environments (Vercel, local dev, etc.)
const DATA_CANDIDATES = [
  path.join(process.cwd(), "public", "data", "regions-adm4.json"),
  path.join(process.cwd(), "src", "data", "regions-adm4.json"),
];

function resolveDataPath(): string {
  for (const p of DATA_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return DATA_CANDIDATES[0]; // fallback — will throw with a clear error
}

// ── Lazy-loaded search index (module-level cache) ──

interface IndexEntry {
  region: Region;
  villageNorm: string;
  districtNorm: string;
  cityNorm: string;
  provinceNorm: string;
}

let indexPromise: Promise<IndexEntry[]> | null = null;
let indexCache: IndexEntry[] | null = null;

async function getIndex(): Promise<IndexEntry[]> {
  if (indexCache) return indexCache;
  if (!indexPromise) {
    indexPromise = loadIndex();
  }
  indexCache = await indexPromise;
  return indexCache;
}

async function loadIndex(): Promise<IndexEntry[]> {
  const dataPath = resolveDataPath();
  const raw = fs.readFileSync(dataPath, "utf-8");
  const regions: Region[] = JSON.parse(raw);

  return regions.map((r) => ({
    region: r,
    villageNorm: normalize(r.village),
    districtNorm: normalize(r.district),
    cityNorm: normalize(r.city),
    provinceNorm: normalize(r.province),
  }));
}

/** Normalize string for fuzzy comparison — strip diacritics, lowercase, keep alphanumeric+spaces */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

/** Score a region match: exact match > prefix match > substring match */
function score(entry: IndexEntry, query: string): number {
  const q = normalize(query);
  if (!q) return 0;

  const fields = [
    entry.villageNorm,
    entry.districtNorm,
    entry.cityNorm,
    entry.provinceNorm,
  ];

  let total = 0;
  for (const field of fields) {
    if (field === q) total += 100; // exact match
    else if (field.startsWith(q)) total += 50; // prefix match
    else if (field.includes(q)) total += 20; // substring match
  }
  return total;
}

/**
 * Search regions by query string.
 * Returns up to 20 results ranked by relevance.
 */
export async function searchRegions(query: string): Promise<Region[]> {
  const q = query.trim();
  if (!q) return [];
  if (q.length < 2) return [];

  const index = await getIndex();

  const scored: Array<{ region: Region; score: number }> = [];
  for (const entry of index) {
    const s = score(entry, q);
    if (s > 0) {
      scored.push({ region: entry.region, score: s });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.region.village.localeCompare(b.region.village);
  });

  return scored.slice(0, MAX_RESULTS).map((r) => r.region);
}

/** Haversine distance in kilometers */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find the nearest region to given coordinates.
 * Returns null if no region has coordinates.
 */
export async function findNearestRegion(lat: number, lon: number): Promise<Region | null> {
  const index = await getIndex();
  const withCoords = index.filter((e) => e.region.latitude != null && e.region.longitude != null);

  if (withCoords.length === 0) return null;

  let nearest = withCoords[0].region;
  let minDist = haversineKm(lat, lon, nearest.latitude!, nearest.longitude!);

  for (let i = 1; i < withCoords.length; i++) {
    const r = withCoords[i].region;
    const d = haversineKm(lat, lon, r.latitude!, r.longitude!);
    if (d < minDist) {
      minDist = d;
      nearest = r;
    }
  }

  return nearest;
}

/** Get a region by its adm4 code */
export async function getRegionByAdm4(adm4: string): Promise<Region | undefined> {
  const index = await getIndex();
  return index.find((e) => e.region.adm4 === adm4)?.region;
}

/**
 * Convert an adm4 code to BMKG-compatible format.
 *
 * BMKG uses the older Kemendagri code system where village codes
 * are in the 1XXX range (kelurahan format) rather than the newer
 * sequential 0XXX format. This function converts 0XXX → 1XXX.
 *
 * Example: "31.73.06.0007" → "31.73.06.1007"
 */
export function toBmkgAdm4(adm4: string): string {
  const parts = adm4.split(".");
  if (parts.length !== 4) return adm4;

  const villageNum = parseInt(parts[3], 10);
  if (isNaN(villageNum)) return adm4;

  // If already in 1XXX+ range, return as-is
  if (villageNum >= 1000) return adm4;

  // Convert: 0001 → 1001, 0002 → 1002, etc.
  return `${parts[0]}.${parts[1]}.${parts[2]}.${(villageNum + 1000).toString().padStart(4, "0")}`;
}

// ── Reverse geocoding via Nominatim (OpenStreetMap) ──

interface NominatimResult {
  village?: string;
  city?: string;
  district?: string;
  state?: string;
  county?: string;
  municipality?: string;
}

/**
 * Reverse geocode coordinates via Nominatim, then search our dataset.
 * Used as fallback when local dataset lacks coordinate data.
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<Region | null> {
  const address = await fetchNominatim(lat, lon);
  if (!address) return null;

  const index = await getIndex();
  const candidates = collectCandidates(address, index);
  if (candidates.length === 0) return null;

  // Return highest-scored match
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].region;
}

async function fetchNominatim(
  lat: number,
  lon: number
): Promise<NominatimResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=id&zoom=14`;
    const res = await fetch(url, {
      headers: { "User-Agent": "LihatLangit/1.0 (weather dashboard)" },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const addr = data?.address ?? {};
    return {
      village: addr.village ?? addr.hamlet ?? addr.isolated_dwelling ?? addr.neighbourhood,
      city: addr.city ?? addr.town ?? addr.municipality ?? addr.county,
      district: addr.suburb ?? addr.district ?? addr.county,
      state: addr.state,
      county: addr.county,
      municipality: addr.municipality,
    };
  } catch {
    return null;
  }
}

function collectCandidates(
  address: NominatimResult,
  index: IndexEntry[]
): Array<{ region: Region; score: number }> {
  const candidates: Array<{ region: Region; score: number }> = [];
  const seen = new Set<string>();
  const searchTerms = [
    address.village,
    address.district,
    address.city,
    address.municipality,
    address.county,
  ].filter(Boolean) as string[];

  for (const term of searchTerms) {
    const norm = normalize(term);
    for (const entry of index) {
      const s = score(entry, norm);
      if (s > 0 && !seen.has(entry.region.adm4)) {
        seen.add(entry.region.adm4);
        candidates.push({ region: entry.region, score: s });
      }
    }
  }

  return candidates;
}
