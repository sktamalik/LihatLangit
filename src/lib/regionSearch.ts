/**
 * Region search utilities using local adm4 dataset.
 * Optimized for large dataset (80K+ entries) with pre-computed indices.
 */

import regions from "@/data/regions-adm4.json";
import type { Region } from "@/types/weather";

const MAX_RESULTS = 20;

// ── Pre-computed search indices at module load ──

interface IndexEntry {
  region: Region;
  /** Lowercased, normalized searchable text */
  villageNorm: string;
  districtNorm: string;
  cityNorm: string;
  provinceNorm: string;
}

const index: IndexEntry[] = regions.map((r) => {
  const region = r as Region;
  return {
    region,
    villageNorm: normalize(region.village),
    districtNorm: normalize(region.district),
    cityNorm: normalize(region.city),
    provinceNorm: normalize(region.province),
  };
});

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
export function searchRegions(query: string): Region[] {
  const q = query.trim();
  if (!q) return [];

  // Quick reject: query too short
  if (q.length < 2) return [];

  // Score all entries and collect non-zero scores
  const scored: Array<{ region: Region; score: number }> = [];

  for (const entry of index) {
    const s = score(entry, q);
    if (s > 0) {
      scored.push({ region: entry.region, score: s });
    }
  }

  // Sort by score descending, then by village name ascending for stability
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.region.village.localeCompare(b.region.village);
  });

  return scored.slice(0, MAX_RESULTS).map((r) => r.region);
}

/** Haversine distance in kilometers */
function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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
export function findNearestRegion(
  lat: number,
  lon: number
): Region | null {
  const withCoords = index.filter(
    (e) => e.region.latitude != null && e.region.longitude != null
  );

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
export function getRegionByAdm4(adm4: string): Region | undefined {
  return (regions as Region[]).find((r) => r.adm4 === adm4);
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
