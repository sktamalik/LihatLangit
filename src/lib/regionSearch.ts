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

const DATA_CANDIDATES = [
  path.join(process.cwd(), "public", "data", "regions-adm4.json"),
];

const NEAREST_CANDIDATES = [
  path.join(process.cwd(), "public", "data", "bmkg-nearest.json"),
];

const COVERAGE_CANDIDATES = [
  path.join(process.cwd(), "public", "data", "bmkg-coverage.json"),
];

// Lazy-loaded coverage map: adm3 → known-working BMKG code (from scan)
let coverageCache: Record<string, string> | null = null;

async function getCoverageMap(): Promise<Record<string, string>> {
  if (coverageCache !== null) return coverageCache;
  for (const p of COVERAGE_CANDIDATES) {
    if (fs.existsSync(p)) {
      try {
        const raw = await fs.promises.readFile(p, "utf-8");
        coverageCache = JSON.parse(raw);
        return coverageCache!;
      } catch {
        // corrupt file — treat as empty
      }
    }
  }
  coverageCache = {};
  return coverageCache;
}

// Lazy-loaded nearest map: adm3 → [[workingCode, tier], ...] closest first
// (precomputed offline by scripts/build-nearest-fallback.js)
let nearestCache: Record<string, Array<[string, number]>> | null = null;

  async function getNearestMap(): Promise<Record<string, Array<[string, number]>>> {
    if (nearestCache !== null) return nearestCache;
    for (const p of NEAREST_CANDIDATES) {
      if (fs.existsSync(p)) {
        try {
          const raw = await fs.promises.readFile(p, "utf-8");
          nearestCache = JSON.parse(raw);
          return nearestCache!;
        } catch {
          // corrupt file — treat as empty
        }
      }
    }
    nearestCache = {};
    return nearestCache;
  }

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
    indexPromise = loadIndex().catch((error) => {
      // Reset so a transient read failure can be retried next call
      indexPromise = null;
      throw error;
    });
  }
  indexCache = await indexPromise;
  return indexCache;
}

async function loadIndex(): Promise<IndexEntry[]> {
  const dataPath = resolveDataPath();
  const raw = await fs.promises.readFile(dataPath, "utf-8");
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

/**
 * Score a region match: multi-word support, exact match > prefix > substring.
 * For each word in the query, add score from the best-matching field.
 * Longer matches get averaged so a 2-word exact match beats a single-word partial.
 */
function score(entry: IndexEntry, query: string): number {
  const raw = query.trim();
  if (!raw) return 0;

  const words = raw.split(/\s+/).filter(Boolean);
  const fields = [
    entry.villageNorm,
    entry.districtNorm,
    entry.cityNorm,
    entry.provinceNorm,
  ];

  // Single-word query: sum across all fields (preserves original ranking)
  if (words.length === 1) {
    const q = normalize(words[0]);
    if (!q) return 0;
    let total = 0;
    for (const field of fields) {
      if (field === q) total += 100;
      else if (field.startsWith(q)) total += 50;
      else if (field.includes(q)) total += 20;
    }
    return total;
  }

  // Multi-word query: for each word, take the best-matching field,
  // then average per query word (penalizes partial matches, rewards full)
  let total = 0;
  let matchedWords = 0;

  for (const word of words) {
    const q = normalize(word);
    if (!q || q.length < 1) continue;

    let best = 0;
    for (const field of fields) {
      if (field === q) best = Math.max(best, 100);
      else if (field.startsWith(q)) best = Math.max(best, 50);
      else if (field.includes(q)) best = Math.max(best, 20);
    }
    if (best > 0) matchedWords++;
    total += best;
  }

  if (matchedWords > 0) {
    total = Math.round(total / words.length);
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

/**
 * Extract the adm3 prefix (XX.XX.XX) from a full adm4 code (XX.XX.XX.XXXX).
 * Returns the original string if it doesn't have 4 dot-separated parts.
 */
export function getAdm3Prefix(adm4: string): string {
  const parts = adm4.split(".");
  if (parts.length !== 4) return adm4;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

/**
 * Best known-working BMKG codes for an adm3 (kecamatan), nearest first.
 *
 * Precomputed offline by scripts/build-nearest-fallback.js from
 * bmkg-coverage.json — tier 0 = same district, 1 = same city, 2 = same
 * province, 3 = nearest province (centroid distance). Every adm3 in the
 * dataset has at least one candidate, so a search can ALWAYS find data
 * from some nearby region instead of showing "Data Tidak Tersedia".
 */
export async function findNearestWithData(
  adm3: string,
  limit: number = 3
): Promise<Array<{ code: string; tier: number }>> {
  const map = await getNearestMap();
  const list = map[adm3] ?? [];
  return list.slice(0, limit).map(([code, tier]) => ({ code, tier }));
}

/**
 * Get nearest Region objects that have BMKG data for fallback suggestions in UI.
 */
export async function findNearestRegionsWithData(
  adm4: string,
  limit: number = 3
): Promise<Region[]> {
  const adm3 = getAdm3Prefix(adm4);
  const candidates = await findNearestWithData(adm3, limit * 2);
  const results: Region[] = [];
  const seenAdm4 = new Set<string>();

  for (const { code } of candidates) {
    if (code === adm4 || seenAdm4.has(code)) continue;
    const reg = await getRegionByAdm4(code);
    if (reg) {
      seenAdm4.add(reg.adm4);
      results.push(reg);
      if (results.length >= limit) break;
    }
  }

  return results;
}

// ── Guaranteed fallback chain (called when Level N / nearest-with-data misses) ──

const ADM4_RE = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/;

function isValidVillage(code: string): boolean {
  return ADM4_RE.test(code);
}

/** Generate BMKG-compatible variants (0XXX↔1XXX plus original), deduped. */
function generateBmkgVariants(adm4: string): string[] {
  const parts = adm4.split(".");
  if (parts.length !== 4) return [adm4];
  const villageNum = parseInt(parts[3], 10);
  if (isNaN(villageNum)) return [adm4];

  const variants: string[] = [];
  if (villageNum < 1000) {
    variants.push(`${parts[0]}.${parts[1]}.${parts[2]}.${(villageNum + 1000).toString().padStart(4, "0")}`);
  } else if (villageNum >= 1000) {
    variants.push(`${parts[0]}.${parts[1]}.${parts[2]}.${(villageNum - 1000).toString().padStart(4, "0")}`);
  }
  variants.push(adm4);

  return [...new Set(variants)];
}

// Provincial capital kelurahan codes (BMKG 1XXX), derived once from the dataset
// (kota, district 01). Reliably served by BMKG — the ultimate safety net so a
// search never renders "Data Tidak Tersedia" while any nearby region has data.
let capitalsCache: string[] | null = null;

async function getGuaranteedCapitals(): Promise<string[]> {
  if (capitalsCache !== null) return capitalsCache;
  const index = await getIndex();
  const byProv = new Map<string, string>();
  for (const { region } of index) {
    const adm2 = region.adm4.slice(0, 5);
    if (!adm2.endsWith(".71")) continue; // only kota (city)
    if (region.adm4.slice(6, 8) !== "01") continue; // prefer first district
    const prov = region.adm4.slice(0, 2);
    if (!byProv.has(prov)) byProv.set(prov, toBmkgAdm4(region.adm4));
  }
  capitalsCache = [...byProv.values()].filter(isValidVillage);
  return capitalsCache;
}

// Province centroids (approx lat/lon) — real geographic distance for ordering
// other-province fallbacks so a zero-coverage province falls back to the
// NEAREST province that has data.
const PROV_CENTROIDS: Record<string, [number, number]> = {
  "11": [4.7, 96.5], "12": [2.2, 99.0], "13": [-0.9, 100.4], "14": [0.5, 101.5],
  "15": [-1.6, 103.0], "16": [-3.0, 104.0], "17": [-3.6, 102.3], "18": [-5.1, 105.1],
  "19": [-2.7, 106.3], "21": [0.9, 104.8], "31": [-6.2, 106.8], "32": [-6.9, 107.5],
  "33": [-7.3, 110.0], "34": [-7.8, 110.4], "35": [-7.6, 112.5], "36": [-6.1, 106.0],
  "51": [-8.4, 115.2], "52": [-8.6, 118.0], "53": [-9.7, 121.0], "61": [-0.5, 111.5],
  "62": [-2.0, 113.5], "63": [-3.0, 115.5], "64": [0.8, 116.5], "65": [3.0, 116.5],
  "71": [1.0, 124.9], "72": [-1.0, 121.0], "73": [-4.0, 120.0], "74": [-3.9, 122.0],
  "75": [0.6, 122.9], "76": [-2.7, 119.2], "81": [-3.3, 129.5], "82": [0.3, 127.5],
  "91": [-4.0, 138.5], "92": [-1.5, 132.5], "94": [-7.0, 140.0],
};

function provDistanceKm(a: string, b: string): number {
  const ca = PROV_CENTROIDS[a];
  const cb = PROV_CENTROIDS[b];
  if (!ca || !cb) return Math.abs(Number(a) - Number(b)) * 100;
  const R = 6371;
  const dLat = ((cb[0] - ca[0]) * Math.PI) / 180;
  const dLon = ((cb[1] - ca[1]) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((ca[0] * Math.PI) / 180) * Math.cos((cb[0] * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Other province codes (excluding the searched one), nearest-first by centroid. */
function sortedOtherProvinces(adm1: string): string[] {
  const all = Object.keys(PROV_CENTROIDS);
  return all
    .filter((p) => p !== adm1)
    .sort((a, b) => provDistanceKm(adm1, a) - provDistanceKm(adm1, b));
}

/**
 * Broad, ordered BMKG fallback candidates for an adm4. Used when the exact
 * code AND the precomputed nearest-with-data map both fail. Every candidate is
 * a real, BMKG-format code (coverage-scanned, blind pattern, or dataset-derived
 * provincial capital) — no invented codes. Ordered by reliability then
 * proximity, with a guaranteed set of provincial capitals at the tail so a
 * search has a "never no-data" safety net.
 */
export async function findBmkgFallback(
  adm4: string,
  maxCandidates: number = 60
): Promise<string[]> {
  const parts = adm4.split(".");
  if (parts.length !== 4) return [adm4];
  const adm1 = parts[0];
  const adm2 = `${parts[0]}.${parts[1]}`;
  const adm3 = getAdm3Prefix(adm4);

  const [coverage, capitals] = await Promise.all([
    getCoverageMap(),
    getGuaranteedCapitals(),
  ]);

  const seen = new Set<string>();
  const out: string[] = [];
  const add = (code: string): boolean => {
    const c = code?.trim();
    if (!c || !isValidVillage(c)) return false;
    if (seen.has(c) || out.length >= maxCandidates) return false;
    seen.add(c);
    out.push(c);
    return true;
  };

  // Reserve slots at the tail for the guaranteed capitals.
  const reserved = Math.min(capitals.length, maxCandidates);
  const budget = Math.max(0, maxCandidates - reserved);

  // 1) exact code variants (0XXX↔1XXX + original)
  for (const v of generateBmkgVariants(adm4)) add(v);

  // 2) coverage-guided — same adm3, then same adm2 (city), then same adm1 (province)
  const coverageEntries = Object.entries(coverage);
  if (coverage[adm3]) add(coverage[adm3]);
  for (const [a3, code] of coverageEntries) {
    if (out.length >= budget) break;
    if (a3 === adm3) continue;
    if (a3.startsWith(`${adm2}.`)) add(code);
  }
  for (const [a3, code] of coverageEntries) {
    if (out.length >= budget) break;
    if (a3.startsWith(`${adm1}.`)) add(code);
  }

  // 3) blind patterns on the searched scope (some villages only exist as 2XXX)
  if (out.length < budget) {
    for (let n = 1001; n <= 1015; n++) { if (!add(`${adm3}.${n}`)) break; }
    for (let n = 2001; n <= 2010; n++) { if (!add(`${adm3}.${n}`)) break; }
  }
  if (out.length < budget) add(`${adm2}.01.1001`); // city's first district
  if (out.length < budget) add(`${adm1}.71.01.1001`); // provincial capital pattern
  for (const ps of sortedOtherProvinces(adm1)) {
    if (out.length >= budget) break;
    add(`${ps}.01.01.1001`);
    if (out.length < budget) add(`${ps}.71.01.1001`);
  }

  // 4) guaranteed provincial capitals (dataset-derived) — ABSOLUTE safety net
  for (const c of capitals) add(c);

  // 5) fill remaining capacity with other-province coverage codes, nearest-first
  const otherProvCoverage = coverageEntries
    .filter(([a3]) => !a3.startsWith(`${adm1}.`))
    .sort(([a3a], [a3b]) =>
      provDistanceKm(adm1, a3a.slice(0, 2)) - provDistanceKm(adm1, a3b.slice(0, 2))
    );
  for (const [, code] of otherProvCoverage) {
    if (out.length >= maxCandidates) break;
    add(code);
  }

  return out;
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
      signal: AbortSignal.timeout(3_000),
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
