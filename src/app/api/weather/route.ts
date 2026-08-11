/**
 * GET /api/weather?adm4=<adm4_code>
 *
 * Fetches weather forecast for a given adm4 region.
 * Uses server-side cache and BMKG API with fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAdm4 } from "@/lib/adm4";
import {
  getRegionByAdm4,
  toBmkgAdm4,
  findBmkgFallback,
  findNearestWithData,
  getAdm3Prefix,
} from "@/lib/regionSearch";
import { fetchForecast } from "@/lib/bmkgClient";
import type { BmkgClientResult } from "@/lib/bmkgClient";
import { normalizeBmkgForecast } from "@/lib/weatherNormalize";
import { getCache, setCache } from "@/lib/cache";
import type {
  ApiError,
  Region,
  WeatherForecast,
} from "@/types/weather";

/**
 * Normalize a BMKG result into a WeatherForecast response, caching it.
 * When fallbackCode is given, the header keeps the SEARCHED region while
 * fallbackFrom/fallbackAdm4 point to the actual data source.
 * Returns null when the payload has no usable forecast days.
 */
function buildSuccessResponse(
  result: BmkgClientResult,
  cacheKey: string,
  region: Region | undefined,
  fallbackCode?: string
): NextResponse | null {
  if (!result.ok) return null;
  const normalized = normalizeBmkgForecast(result.data, region);

  if (!normalized || normalized.days.length === 0) return null;

  if (fallbackCode) {
    // Actual data source — BMKG lokasi of the working fallback code
    const sourceVillage = normalized.region.village;

    // Header must show the SEARCHED region, not the fallback source.
    // The fallbackFrom notice tells the user where the data really comes from.
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

    setCache(cacheKey, normalized);
    return NextResponse.json({
      ...normalized,
      fromCache: false,
      isStale: false,
      fallbackFrom: sourceVillage,
      fallbackAdm4: fallbackCode,
    } satisfies WeatherForecast);
  }

  setCache(cacheKey, normalized);
  return NextResponse.json({
    ...normalized,
    fromCache: false,
    isStale: false,
  } satisfies WeatherForecast);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adm4 = searchParams.get("adm4");

  // ── Validate adm4 ──
  if (!adm4) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_ADM4",
          message: "Parameter adm4 wajib diisi.",
        },
      } satisfies ApiError,
      { status: 400 }
    );
  }

  if (!isValidAdm4(adm4)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_ADM4",
          message:
            "Kode adm4 tidak valid. Format: XX.XX.XX.XXXX (contoh: 31.71.03.1001).",
        },
      } satisfies ApiError,
      { status: 400 }
    );
  }

  // ── Check region in local dataset (soft check — BMKG may still have data) ──
  const region = await getRegionByAdm4(adm4);
  const bmkgAdm4 = toBmkgAdm4(adm4);

  // ── Cache check ──
  const cacheKey = `weather:bmkg:adm4:${adm4}`;
  const cached = getCache<WeatherForecast>(cacheKey);

  if (cached.status === "fresh") {
    return NextResponse.json({
      ...cached.payload,
      fromCache: true,
      isStale: false,
    } satisfies WeatherForecast);
  }

  // ── Fetch from BMKG ──
  // Try BMKG-compatible code first (converted to 1XXX format), then original
  const bmkgResult = await fetchForecast(bmkgAdm4);
  const result = bmkgResult.ok
    ? bmkgResult
    : bmkgAdm4 !== adm4
      ? await fetchForecast(adm4)
      : bmkgResult;

  // Short-circuit on rate-limit: don't hammer BMKG with fallback probes, wait 1s then return error
  if (!result.ok && (result.error.status === 429 || result.error.status === 403)) {
    console.log(`[Weather] BMKG rate-limited (${result.error.status}), backing off before retry...`);
    await new Promise((r) => setTimeout(r, 1000));
    const retryResult = await fetchForecast(bmkgAdm4);
    if (retryResult.ok) {
      // Cache and return
      const normalized = normalizeBmkgForecast(retryResult.data, region);
      if (normalized && normalized.days.length > 0) {
        setCache(cacheKey, normalized);
        return NextResponse.json({
          ...normalized, fromCache: false, isStale: false,
        } satisfies WeatherForecast);
      }
    }
    // Still rate-limited — return immediately, don't trigger 35-request fallback
    return NextResponse.json(
      { error: { code: "BMKG_UNAVAILABLE" as const, message: "Layanan BMKG sedang sibuk. Silakan coba lagi." } } satisfies ApiError,
      { status: 502 }
    );
  }

  if (result.ok) {
    const resp = buildSuccessResponse(result, cacheKey, region);
    if (resp) return resp;
    // 200 with empty data[] — fall through to fallback chain
  }

  // ── BMKG failed — try precomputed nearest region that HAS BMKG data ──
  // Every adm3 maps offline to known-working codes (closest first), so this
  // succeeds with 1-3 requests instead of the 35-probe chain below — sparing
  // BMKG's aggressive rate limit. Exact matches were already tried above.
  console.log(`[Weather] Exact adm4 ${adm4} failed, probing nearest-with-data codes...`);
  const nearestCandidates = await findNearestWithData(getAdm3Prefix(adm4), 3);
  const nearestToTry = nearestCandidates
    .map((c) => c.code)
    .filter((c) => c !== bmkgAdm4 && c !== adm4);
  let rateLimited = false;

  if (nearestToTry.length > 0) {
    const FALLBACK_TIMEOUT = 3000;
    const nearestResults = await Promise.all(
      nearestToTry.map(async (candidate) => ({
        candidate,
        res: await fetchForecast(candidate, FALLBACK_TIMEOUT),
      }))
    );

    if (
      nearestResults.some(
        ({ res }) => !res.ok && (res.error.status === 429 || res.error.status === 403)
      )
    ) {
      console.log(`[Weather] BMKG rate-limited during nearest probe, aborting`);
      rateLimited = true;
    } else {
      const hit = nearestResults.find(({ res }) => res.ok);
      if (hit) {
        const resp = buildSuccessResponse(hit.res, cacheKey, region, hit.candidate);
        if (resp) {
          console.log(`[Weather] Nearest-with-data SUCCESS: adm4=${hit.candidate}`);
          return resp;
        }
      }
    }
  }

  // ── BMKG failed — try expanded fallback (only if not rate-limited) ──
  console.log(`[Weather] Exact adm4 ${adm4} failed, trying expanded fallback...`);
  const fallbackCandidates = !rateLimited ? await findBmkgFallback(adm4, 35) : [];
  let fallbackResult: BmkgClientResult | null = null;
  let fallbackCode: string | null = null;
  const FALLBACK_TIMEOUT = 3000;
  const BATCH_SIZE = 5;

  // Probe in parallel batches — 5 concurrent requests per batch, stop on first success.
  // Worst case: 7 batches × 3s = ~21s instead of 35 × 4s = ~140s serial.
  const toTry = fallbackCandidates.filter(c => c !== bmkgAdm4 && c !== adm4);
  outer: for (let i = 0; i < toTry.length; i += BATCH_SIZE) {
    const batch = toTry.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (candidate) => {
        const res = await fetchForecast(candidate, FALLBACK_TIMEOUT);
        return { candidate, res };
      })
    );
    for (const { candidate, res } of results) {
      if (res.ok) {
        fallbackResult = res;
        fallbackCode = candidate;
        console.log(`[Weather] Fallback SUCCESS: adm4=${candidate}`);
        break outer;
      }
    }
    // Rate-limited during fallback — stop probing, don't hammer BMKG
    if (results.some(({ res }) => !res.ok && (res.error.status === 429 || res.error.status === 403))) {
      console.log(`[Weather] BMKG rate-limited during fallback, aborting probe chain`);
      break;
    }
  }

  if (fallbackResult?.ok && fallbackCode) {
    const resp = buildSuccessResponse(fallbackResult, cacheKey, region, fallbackCode);
    if (resp) return resp;
  }

  // ── BMKG failed — try stale cache ──
  if (cached.status === "stale") {
    console.log(
      `[Weather] BMKG failed for ${adm4}, returning stale cache`
    );
    return NextResponse.json({
      ...cached.payload,
      fromCache: true,
      isStale: true,
    } satisfies WeatherForecast);
  }

  // ── No cache and BMKG failed ──
  const errorMap: Record<string, ApiError["error"]["code"]> = {
    TIMEOUT: "BMKG_TIMEOUT",
    HTTP_ERROR: "BMKG_UNAVAILABLE",
    PARSE_ERROR: "BMKG_INVALID_RESPONSE",
    INVALID_ADM4: "INVALID_ADM4",
  };

  const errorCode = errorMap[!result.ok ? result.error.code : "HTTP_ERROR"] ?? "BMKG_UNAVAILABLE";

  const messageMap: Record<string, string> = {
    BMKG_TIMEOUT:
      "Data BMKG tidak dapat diambil (timeout). Coba beberapa saat lagi.",
    BMKG_UNAVAILABLE:
      "Data BMKG belum dapat diambil. Coba beberapa saat lagi.",
    BMKG_INVALID_RESPONSE:
      "Data BMKG tidak dapat diproses. Coba beberapa saat lagi.",
  };

  return NextResponse.json(
    {
      error: {
        code: errorCode,
        message: messageMap[errorCode] ?? "Terjadi kesalahan. Coba lagi.",
      },
    } satisfies ApiError,
    { status: 502 }
  );
}
