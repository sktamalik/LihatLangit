/**
 * GET /api/weather-batch?adm4=11.71.01.0019,13.71.01.0001,...
 *
 * Fetches weather forecasts for multiple adm4 codes in parallel.
 * Used by the national weather map to show conditions across Indonesia.
 *
 * Returns a map of adm4 → { region, temperatureC, weatherDescription, ... }.
 * Failed lookups are omitted from the result (never returns partial errors).
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAdm4 } from "@/lib/adm4";
import { fetchForecast } from "@/lib/bmkgClient";
import { getCache, setCache } from "@/lib/cache";
import { normalizeBmkgForecast } from "@/lib/weatherNormalize";
import { getRegionByAdm4, toBmkgAdm4, findBmkgFallback } from "@/lib/regionSearch";
import type { WeatherForecast } from "@/types/weather";

const MAX_CODES = 40;

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

  for (const code of codes) {
    if (!isValidAdm4(code)) {
      return NextResponse.json({ error: `Kode adm4 tidak valid: ${code}` }, { status: 400 });
    }
  }

  // ── Fetch with concurrency limit + fallback ──
  const results: Record<string, WeatherForecast> = {};
  const CONCURRENCY = 5;

  async function fetchOne(adm4: string): Promise<void> {
    const cacheKey = `weather:bmkg:adm4:${adm4}`;

    // 1. Cache check
    const cached = getCache<WeatherForecast>(cacheKey);
    if (cached.status === "fresh") {
      results[adm4] = cached.payload;
      return;
    }
    if (cached.status === "stale") {
      // Keep stale as fallback, but still try to refresh
    }

    // 2. Try BMKG-compatible code first, then original
    const bmkgAdm4 = toBmkgAdm4(adm4);
    let result = await fetchForecast(bmkgAdm4, 8000);
    if (!result.ok && bmkgAdm4 !== adm4) {
      result = await fetchForecast(adm4, 8000);
    }

    // 3. If both failed, try expanded fallback (same as regular weather route)
    if (!result.ok) {
      const fallbackCandidates = await findBmkgFallback(adm4, 15);
      for (const candidate of fallbackCandidates) {
        if (candidate === bmkgAdm4 || candidate === adm4) continue;
        const fb = await fetchForecast(candidate, 5000);
        if (fb.ok) { result = fb; break; }
      }
    }

    if (!result.ok) {
      // 4. Return stale cache if available
      if (cached.status === "stale") {
        results[adm4] = cached.payload;
      }
      return;
    }

    const region = await getRegionByAdm4(adm4);
    const normalized = normalizeBmkgForecast(result.data, region);
    if (!normalized || normalized.days.length === 0) {
      if (cached.status === "stale") {
        results[adm4] = cached.payload;
      }
      return;
    }

    // Save to cache
    setCache(cacheKey, normalized);
    results[adm4] = normalized;
  }

  // Worker pool with concurrency limit
  const queue = [...codes];
  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const code = queue.shift()!;
      await fetchOne(code);
    }
  }
  await Promise.allSettled(Array.from({ length: CONCURRENCY }, () => worker()));

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
