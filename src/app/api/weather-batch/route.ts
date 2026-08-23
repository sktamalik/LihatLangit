/**
 * GET /api/weather-batch?adm4=11.71.01.0019,13.71.01.0001,...
 *
 * Fetches weather forecasts for multiple adm4 codes in parallel.
 * Used by the national weather map to show conditions across Indonesia.
 *
 * Returns a map of adm4 → { region, temperatureC, weatherDescription, ... }.
 * Failed lookups are omitted from the result (never returns partial errors).
 *
 * Speed design (map must load within Vercel's 10s function limit):
 *  - Shorter timeouts + fewer retries than the single-weather route
 *  - Fallback probing runs in parallel batches of 5 (not serial)
 *  - Shared rate-limit flag: one 429/403 aborts the whole batch so we
 *    don't hammer BMKG — partial results are returned instead
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAdm4 } from "@/lib/adm4";
import { fetchForecast } from "@/lib/bmkgClient";
import { getCache, setCache } from "@/lib/cache";
import { normalizeBmkgForecast } from "@/lib/weatherNormalize";
import { getRegionByAdm4, toBmkgAdm4, findBmkgFallback, findNearestWithData, getAdm3Prefix } from "@/lib/regionSearch";
import type { WeatherForecast } from "@/types/weather";

const MAX_CODES = 40;
const CONCURRENCY = 5;
const PRIMARY_TIMEOUT = 4000;
const PRIMARY_RETRIES = 1; // 2 attempts max per code
const FALLBACK_TIMEOUT = 3000;
const FALLBACK_RETRIES = 0; // don't retry probes — keep total time bounded
const BATCH_SIZE = 5;
// Wall-clock budget per code — keeps worst case inside Vercel's 10s limit
const CODE_BUDGET_MS = 9000;

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

  // ── Fetch with concurrency limit + parallel fallback ──
  const results: Record<string, WeatherForecast> = {};
  let rateLimited = false; // shared — one 429/403 stops all remaining probes

  async function fetchOne(adm4: string): Promise<void> {
    const startedAt = Date.now();
    const budgetLeft = () => CODE_BUDGET_MS - (Date.now() - startedAt);
    const cacheKey = `weather:bmkg:adm4:${adm4}`;

    // 1. Cache check (always — stale/cached data survives rate limits)
    const cached = getCache<WeatherForecast>(cacheKey);
    if (cached.status === "fresh") {
      results[adm4] = cached.payload;
      return;
    }
    // 2. Skip BMKG network calls once rate-limited (flag shared across workers)
    if (rateLimited) {
      if (cached.status === "stale") results[adm4] = cached.payload;
      return;
    }
    // 3. Try BMKG-compatible code first, then original
    const bmkgAdm4 = toBmkgAdm4(adm4);
    let result = await fetchForecast(bmkgAdm4, PRIMARY_TIMEOUT, PRIMARY_RETRIES);
    if (!result.ok && bmkgAdm4 !== adm4) {
      result = await fetchForecast(adm4, PRIMARY_TIMEOUT, PRIMARY_RETRIES);
    }

    // Rate-limited — flag shared, stop everything, keep stale if available
    if (!result.ok && (result.error.status === 429 || result.error.status === 403)) {
      rateLimited = true;
      if (cached.status === "stale") results[adm4] = cached.payload;
      return;
    }

    // 3. If both failed, try fallback — nearest-with-data first, then expanded chain
    if (!result.ok) {
      // 3a. Precomputed nearest region WITH data (known-working codes, closest first)
      if (!rateLimited) {
        const nearestCandidates = await findNearestWithData(getAdm3Prefix(adm4), 3);
        const nearestToTry = nearestCandidates
          .map((c) => c.code)
          .filter((c) => c !== bmkgAdm4 && c !== adm4);
        if (nearestToTry.length > 0) {
          const outcomes = await Promise.all(
            nearestToTry.map(async (candidate) => ({
              candidate,
              res: await fetchForecast(candidate, FALLBACK_TIMEOUT, FALLBACK_RETRIES),
            }))
          );
          const hit = outcomes.find(({ res }) => res.ok);
          if (hit) {
            result = hit.res;
          } else if (outcomes.some(({ res }) => !res.ok && (res.error.status === 429 || res.error.status === 403))) {
            rateLimited = true;
          }
        }
      }

      // 3b. Expanded fallback chain in parallel batches (rate-limit aborts it)
      if (!result.ok && !rateLimited) {
        const fallbackCandidates = await findBmkgFallback(adm4, 15);
        const toTry = fallbackCandidates.filter((c) => c !== bmkgAdm4 && c !== adm4);
        outer: for (let i = 0; i < toTry.length; i += BATCH_SIZE) {
          if (rateLimited || budgetLeft() <= 0) break;
          const batch = toTry.slice(i, i + BATCH_SIZE);
          const outcomes = await Promise.all(
            batch.map(async (candidate) => ({
              candidate,
              res: await fetchForecast(candidate, Math.min(FALLBACK_TIMEOUT, Math.max(1000, budgetLeft())), FALLBACK_RETRIES),
            }))
          );
          for (const { res } of outcomes) {
            if (res.ok) { result = res; break outer; }
          }
          if (outcomes.some(({ res }) => !res.ok && (res.error.status === 429 || res.error.status === 403))) {
            rateLimited = true;
            break;
          }
        }
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

    // Header keeps the SEARCHED region even when data came from a fallback source
    if (region) {
      normalized.region = {
        ...normalized.region, // keep BMKG coords (map zooms to data location)
        adm4: region.adm4,
        province: region.province,
        city: region.city,
        district: region.district,
        village: region.village,
        timezone: region.timezone,
      };
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
      await fetchOne(code); // rate-limit handled inside — cached cities still resolve
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

  // CDN cache: complete results are shared by ALL visitors for 10 min
  // (BMKG updates every 3h, so this is safely fresh) — warm loads become
  // instant edge hits instead of new BMKG-probing function invocations.
  // Partial results (rate-limited mid-batch) get a short 30s TTL so a
  // retry fills in the missing cities soon.
  const complete = Object.keys(summary).length >= codes.length;
  const cacheControl = complete
    ? "public, s-maxage=600, stale-while-revalidate=1800"
    : "public, s-maxage=30, stale-while-revalidate=120";

  return NextResponse.json(summary, {
    headers: { "Cache-Control": cacheControl },
  });
}
