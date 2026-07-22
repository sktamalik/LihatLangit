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
  // then average per matched word to reward broad matches
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
 * Get all villages/regions sharing the same adm3 (district) prefix.
 * Useful for district-level BMKG fallback — find nearby alternatives.
 */
export async function getVillagesByAdm3(adm3: string): Promise<Region[]> {
  const index = await getIndex();
  const prefix = `${adm3}.`;
  return index
    .filter((e) => e.region.adm4.startsWith(prefix))
    .map((e) => e.region);
}

/**
 * Generate alternative BMKG-compatible adm4 codes for a given adm4.
 *
 * BMKG uses the older Kemendagri code system. While most village codes
 * follow a 0XXX → 1XXX pattern, some provinces/regions use different
 * numbering. This function tries multiple plausible conversions.
 *
 * Examples:
 *   "73.71.01.0005" → ["73.71.01.1005", "73.71.01.0005"]
 *   "31.71.03.1001" → ["31.71.03.1001", "31.71.03.0001"]
 */
export function generateBmkgVariants(adm4: string): string[] {
  const parts = adm4.split(".");
  if (parts.length !== 4) return [adm4];

  const villageNum = parseInt(parts[3], 10);
  if (isNaN(villageNum)) return [adm4];

  const variants: string[] = [];

  // Primary: the standard 0XXX → 1XXX conversion (kelurahan format)
  if (villageNum < 1000) {
    variants.push(
      `${parts[0]}.${parts[1]}.${parts[2]}.${(villageNum + 1000).toString().padStart(4, "0")}`
    );
  }

  // If already in 1XXX range, also try 0XXX range (desa format)
  if (villageNum >= 1000) {
    variants.push(
      `${parts[0]}.${parts[1]}.${parts[2]}.${(villageNum - 1000).toString().padStart(4, "0")}`
    );
  }

  // Always include the original
  variants.push(adm4);

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const deduped: string[] = [];
  for (let i = 0; i < variants.length; i++) {
    if (!seen.has(variants[i])) {
      seen.add(variants[i]);
      deduped.push(variants[i]);
    }
  }
  return deduped;
}

/**
 * Find BMKG-compatible adm4 codes from expanding scope.
 *
 * Strategy by level (each capped to ensure diversity across levels):
 *   0 (exact):     Direct variants of the requested adm4 code (cap 3)
 *   1 (district):  Other villages in the same adm3 (kecamatan) — cap 5
 *   2 (city):      Other districts in the same adm2 (kab/kota) — cap 5
 *   3 (province):  Other cities in the same adm1 (provinsi) — cap 5
 *   4 (nearest):   Nearest villages from other provinces by coord — cap 5
 *   5 (any):       First village from each other province — cap 10
 *
 * 1XXX-format codes (kelurahan) are prioritized since BMKG
 * is more likely to have data for them.
 */
export async function findBmkgFallback(
  adm4: string,
  maxCandidates: number = 35
): Promise<string[]> {
  const parts = adm4.split(".");
  if (parts.length !== 4) return [adm4];

  const adm1 = parts[0];
  const adm2 = `${parts[0]}.${parts[1]}`;
  const adm3 = getAdm3Prefix(adm4);
  const seen = new Set<string>();
  const candidates: string[] = [];

  function addCandidate(code: string): boolean {
    if (seen.has(code) || candidates.length >= maxCandidates) return false;
    seen.add(code);
    candidates.push(code);
    return true;
  }

  function addVariants(adm4Code: string, cap: number = 999): void {
    const variants = generateBmkgVariants(adm4Code);
    // 1XXX codes first (more likely to have BMKG data)
    const kelurahan = variants.filter((v) => {
      const last = parseInt(v.split(".")[3], 10);
      return last >= 1000;
    });
    const others = variants.filter((v) => !kelurahan.includes(v));
    let added = 0;
    for (const v of [...kelurahan, ...others]) {
      if (added >= cap) break;
      if (addCandidate(v)) added++;
    }
  }

  const index = await getIndex();

  // Level 0: Direct variants of the requested adm4 (cap 3)
  addVariants(adm4, 3);

  // Level 1: Other villages in the same district (adm3, cap 5)
  const sameDistrict = await getVillagesByAdm3(adm3);
  let level1Added = 0;
  for (const village of sameDistrict) {
    if (level1Added >= 5) break;
    if (village.adm4 === adm4) continue;
    const before = candidates.length;
    addVariants(village.adm4, 1); // 1 variant per village
    if (candidates.length > before) level1Added++;
  }

  if (candidates.length >= maxCandidates) return candidates;

  // Level 2: Other districts in the same city (adm2, cap 5)
  const cityPrefix = `${adm2}.`;
  const otherDistricts = new Set<string>();
  for (const entry of index) {
    if (entry.region.adm4.startsWith(cityPrefix)) {
      const entryAdm3 = entry.region.adm4.slice(0, 8);
      if (!entryAdm3.startsWith(adm3)) {
        otherDistricts.add(entryAdm3);
      }
    }
  }
  const otherDistrictsArr: string[] = [];
  otherDistricts.forEach((d) => otherDistrictsArr.push(d));
  let level2Added = 0;
  for (let di = 0; di < otherDistrictsArr.length && level2Added < 5; di++) {
    const firstVillage = index.find((e) =>
      e.region.adm4.startsWith(otherDistrictsArr[di])
    );
    if (firstVillage) {
      const before = candidates.length;
      addVariants(firstVillage.region.adm4, 1);
      if (candidates.length > before) level2Added++;
    }
  }

  if (candidates.length >= maxCandidates) return candidates;

  // Level 3: Other cities in the same province (adm1, cap 5)
  const provPrefix = `${adm1}.`;
  const otherCities = new Set<string>();
  for (const entry of index) {
    if (entry.region.adm4.startsWith(provPrefix)) {
      const entryAdm2 = entry.region.adm4.slice(0, 5);
      if (!entryAdm2.startsWith(adm2)) {
        otherCities.add(entryAdm2);
      }
    }
  }
  const otherCitiesArr: string[] = [];
  otherCities.forEach((c) => otherCitiesArr.push(c));
  let level3Added = 0;
  for (let ci = 0; ci < otherCitiesArr.length && level3Added < 5; ci++) {
    const firstVillage = index.find((e) =>
      e.region.adm4.startsWith(otherCitiesArr[ci])
    );
    if (firstVillage) {
      const before = candidates.length;
      addVariants(firstVillage.region.adm4, 1);
      if (candidates.length > before) level3Added++;
    }
  }

  if (candidates.length >= maxCandidates) return candidates;

  // Level 4: Nearest villages from other provinces by coordinates (cap 5)
  const coordsEntry = index.find(
    (e) =>
      e.region.adm4 === adm4 &&
      e.region.latitude != null &&
      e.region.longitude != null
  );
  if (coordsEntry) {
    const { latitude, longitude } = coordsEntry.region;
    const nearest: Array<{ entry: IndexEntry; dist: number }> = [];
    for (const entry of index) {
      if (entry.region.adm4.startsWith(provPrefix)) continue;
      if (entry.region.latitude == null || entry.region.longitude == null) continue;
      const d = haversineKm(
        latitude!,
        longitude!,
        entry.region.latitude!,
        entry.region.longitude!
      );
      nearest.push({ entry, dist: d });
    }
    nearest.sort((a, b) => a.dist - b.dist);
    let level4Added = 0;
    for (let ni = 0; ni < nearest.length && level4Added < 5; ni++) {
      const before = candidates.length;
      addVariants(nearest[ni].entry.region.adm4, 1);
      if (candidates.length > before) level4Added++;
    }
  }

  // Level 5: First village from each other province (cap 10)
  // Try the XX.01.01.1001 pattern first (known to have BMKG data for many provinces)
  const otherProvs = new Set<string>();
  let level5Added = 0;
  for (const entry of index) {
    if (level5Added >= 10) break;
    const entryProv = entry.region.adm4.slice(0, 2);
    if (entryProv === adm1) continue;
    if (otherProvs.has(entryProv)) continue;
    otherProvs.add(entryProv);
    const before = candidates.length;

    // Try known-working pattern: XX.01.01.1001 (first district, first kelurahan)
    addCandidate(`${entryProv}.01.01.1001`);

    // Also try the first actual entry from this province
    if (candidates.length < maxCandidates) {
      addVariants(entry.region.adm4, 1);
    }
    if (candidates.length > before) level5Added++;
  }

  return candidates;
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
