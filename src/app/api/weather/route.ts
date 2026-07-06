/**
 * GET /api/weather?adm4=<adm4_code>
 *
 * Fetches weather forecast for a given adm4 region.
 * Uses server-side cache and BMKG API with fallback.
 */

import { NextRequest, NextResponse } from "next/server";
import { isValidAdm4 } from "@/lib/adm4";
import { getRegionByAdm4, toBmkgAdm4, findBmkgFallback } from "@/lib/regionSearch";
import { fetchForecast } from "@/lib/bmkgClient";
import type { BmkgClientResult } from "@/lib/bmkgClient";
import { normalizeBmkgForecast } from "@/lib/weatherNormalize";
import { getCache, setCache } from "@/lib/cache";
import type {
  ApiError,
  WeatherForecast,
} from "@/types/weather";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = RATE_LIMIT_WINDOW_MS;

  const timestamps = requestLog.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < window);

  if (recent.length >= RATE_LIMIT_MAX) {
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
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

  // ── Rate limit ──
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message:
            "Terlalu banyak permintaan. Silakan coba lagi beberapa saat.",
        },
      } satisfies ApiError,
      { status: 429 }
    );
  }

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

  if (result.ok) {
    const normalized = normalizeBmkgForecast(result.data, region);

    if (!normalized) {
      return NextResponse.json(
        {
          error: {
            code: "BMKG_INVALID_RESPONSE",
            message: "Data BMKG tidak dapat diproses. Coba beberapa saat lagi.",
          },
        } satisfies ApiError,
        { status: 502 }
      );
    }

    // Days empty check
    if (normalized.days.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: "EMPTY_FORECAST",
            message:
              "Data prakiraan belum tersedia untuk wilayah ini. Coba lagi nanti.",
          },
        } satisfies ApiError,
        { status: 404 }
      );
    }

    // Cache the fresh data
    setCache(cacheKey, normalized);

    return NextResponse.json({
      ...normalized,
      fromCache: false,
      isStale: false,
    } satisfies WeatherForecast);
  }

  // ── BMKG failed — try expanded fallback ──
  // The exact adm4 has no BMKG data. Try a broader set of candidates:
  //   1. Direct code variants (0XXX↔1XXX)
  //   2. Other villages in same district
  //   3. Other districts in same city
  //   4. Other cities in same province
  // Each level uses a shorter timeout (4s) since these are probes.
  console.log(`[Weather] Exact adm4 ${adm4} failed, trying expanded fallback...`);
  const fallbackCandidates = await findBmkgFallback(adm4, 25);
  let fallbackResult: BmkgClientResult | null = null;
  let fallbackCode: string | null = null;
  let fallbackAttempts = 0;
  const MAX_FALLBACK_ATTEMPTS = 25;

  for (let fi = 0; fi < fallbackCandidates.length && fallbackAttempts < MAX_FALLBACK_ATTEMPTS; fi++) {
    const candidate = fallbackCandidates[fi];
    if (candidate === bmkgAdm4 || candidate === adm4) continue; // already tried
    fallbackAttempts++;
    console.log(`[Weather] Trying fallback #${fallbackAttempts}: adm4=${candidate}`);
    fallbackResult = await fetchForecast(candidate, 5000); // 5s timeout for probes
    if (fallbackResult.ok) {
      fallbackCode = candidate;
      console.log(`[Weather] Fallback SUCCESS (#${fallbackAttempts}) for adm4=${candidate}`);
      break;
    }
  }

  if (fallbackResult?.ok && fallbackCode) {
    const normalized = normalizeBmkgForecast(fallbackResult.data, region);

    if (normalized && normalized.days.length > 0) {
      // Look up the actual village name for the fallback code
      const fallbackRegion = normalized.region;

      setCache(cacheKey, normalized);

      return NextResponse.json({
        ...normalized,
        fromCache: false,
        isStale: false,
        fallbackFrom: fallbackRegion.village,
        fallbackAdm4: fallbackCode,
      } satisfies WeatherForecast);
    }
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

  const errorCode = errorMap[result.error.code] ?? "BMKG_UNAVAILABLE";

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
