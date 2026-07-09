/**
 * GET /api/weather-batch?adm4=11.71.01.0019,13.71.01.0001,...
 *
 * Fetches weather forecasts for multiple adm4 codes in parallel.
 * Used by the national weather map to show conditions across Indonesia.
 *
 * Returns a map of adm4 → { region, temperatureC, weatherDescription, humidityPct, windSpeedKmh, iconUrl }.
 * Failed lookups are omitted from the result (never returns partial errors).
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAdm4 } from "@/lib/adm4";
import { fetchForecast } from "@/lib/bmkgClient";
import { getCache } from "@/lib/cache";
import { normalizeBmkgForecast } from "@/lib/weatherNormalize";
import { getRegionByAdm4, toBmkgAdm4 } from "@/lib/regionSearch";
import type { BmkgClientResult } from "@/lib/bmkgClient";
import type { WeatherForecast } from "@/types/weather";

const MAX_CODES = 40; // covers our 38 cities + buffer

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codesParam = searchParams.get("adm4");
  if (!codesParam) {
    return NextResponse.json({ error: "Parameter adm4 wajib diisi (comma-separated)." }, { status: 400 });
  }

  const codes = codesParam.split(",").map((c) => c.trim()).filter(Boolean);
  if (codes.length === 0) {
    return NextResponse.json({ error: "Minimal satu kode adm4." }, { status: 400 });
  }
  if (codes.length > MAX_CODES) {
    return NextResponse.json({ error: `Maksimal ${MAX_CODES} kode adm4.` }, { status: 400 });
  }

  // Validate all codes first
  for (const code of codes) {
    if (!isValidAdm4(code)) {
      return NextResponse.json({ error: `Kode adm4 tidak valid: ${code}` }, { status: 400 });
    }
  }

  // ── Fetch all in parallel ──
  const results: Record<string, WeatherForecast> = {};
  const fetchPromises = codes.map(async (adm4) => {
    // Check cache first
    const cacheKey = `weather:bmkg:adm4:${adm4}`;
    const cached = getCache<WeatherForecast>(cacheKey);
    if (cached.status === "fresh") {
      results[adm4] = cached.payload;
      return;
    }

    // Fetch from BMKG
    const bmkgAdm4 = toBmkgAdm4(adm4);
    const bmkgResult = await fetchForecast(bmkgAdm4, 8000);
    const result = bmkgResult.ok
      ? bmkgResult
      : bmkgAdm4 !== adm4
        ? await fetchForecast(adm4, 8000)
        : bmkgResult;

    if (!result.ok) return; // skip failed

    const region = await getRegionByAdm4(adm4);
    const normalized = normalizeBmkgForecast(result.data, region);
    if (!normalized || normalized.days.length === 0) return;

    results[adm4] = normalized;
  });

  await Promise.allSettled(fetchPromises);

  // ── Build lightweight response ──
  const summary: Record<string, {
    region: { city: string; district: string; village: string };
    temperatureC: number | null;
    weatherDescription: string;
    humidityPct: number | null;
    windSpeedKmh: number | null;
    iconUrl?: string;
    analysisDateUtc: string | null;
    isStale: boolean;
  }> = {};

  for (const [adm4, forecast] of Object.entries(results)) {
    const pt = forecast.nearestPoint ?? forecast.days[0]?.points[0];
    summary[adm4] = {
      region: {
        city: forecast.region.city,
        district: forecast.region.district,
        village: forecast.region.village,
      },
      temperatureC: pt?.temperatureC ?? null,
      weatherDescription: pt?.weatherDescription ?? "—",
      humidityPct: pt?.humidityPct ?? null,
      windSpeedKmh: pt?.windSpeedKmh ?? null,
      iconUrl: pt?.iconUrl,
      analysisDateUtc: forecast.analysisDateUtc,
      isStale: forecast.isStale,
    };
  }

  return NextResponse.json(summary);
}
