/**
 * GET /api/regions?q=<query>
 *
 * Search regions from the local adm4 dataset.
 * Returns up to 20 results ranked by relevance.
 *
 * Also supports:
 *   GET /api/regions/nearest?lat=<lat>&lon=<lon>
 */

import { NextRequest, NextResponse } from "next/server";
import { searchRegions, findNearestRegion, reverseGeocode } from "@/lib/regionSearch";
import type { Region, ApiError } from "@/types/weather";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  // Nearest region by coordinates
  if (lat !== null && lon !== null) {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);

    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      const error: ApiError = {
        error: {
          code: "REGION_NOT_FOUND",
          message: "Koordinat tidak valid. Latitude harus -90 s/d 90, longitude -180 s/d 180.",
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const nearest = await findNearestRegion(latNum, lonNum);
    if (nearest) return NextResponse.json(nearest);

    // Fallback: reverse geocode via Nominatim + match local dataset
    const geocoded = await reverseGeocode(latNum, lonNum);
    if (geocoded) return NextResponse.json(geocoded);

    // Still no match
    const error: ApiError = {
      error: {
        code: "REGION_NOT_FOUND",
        message: "Tidak ada wilayah yang cocok dengan koordinat Anda.",
      },
    };
    return NextResponse.json(error, { status: 404 });
  }

  // Text search
  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  const results: Region[] = await searchRegions(q);
  return NextResponse.json(results);
}
