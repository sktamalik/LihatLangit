/**
 * Region search utilities using local adm4 dataset.
 */

import regions from "@/data/regions-adm4.sample.json";
import type { Region } from "@/types/weather";

/** Normalize string for fuzzy comparison */
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
}

/** Score a region match: exact match > prefix match > substring match */
function score(region: Region, query: string): number {
  const q = normalize(query);
  if (!q) return 0;

  const fields = [
    normalize(region.village),
    normalize(region.district),
    normalize(region.city),
    normalize(region.province),
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

  const scored = regions
    .map((r) => ({ region: r as Region, score: score(r as Region, q) }))
    .filter((r) => r.score > 0);

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 20).map((r) => r.region);
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
  const withCoords = regions.filter(
    (r) => r.latitude != null && r.longitude != null
  ) as Region[];

  if (withCoords.length === 0) return null;

  let nearest = withCoords[0];
  let minDist = haversineKm(lat, lon, nearest.latitude!, nearest.longitude!);

  for (let i = 1; i < withCoords.length; i++) {
    const r = withCoords[i];
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
