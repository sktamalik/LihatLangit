import { isValidAdm4 } from "@/lib/adm4";
import { fetchForecast, type BmkgClientResult } from "@/lib/bmkgClient";
import { getCache, setCache } from "@/lib/cache";
import {
  findBmkgFallback,
  findNearestWithData,
  getAdm3Prefix,
  getRegionByAdm4,
  toBmkgAdm4,
} from "@/lib/regionSearch";
import { normalizeBmkgForecast } from "@/lib/weatherNormalize";
import type { ApiError, Region, WeatherForecast } from "@/types/weather";

const CACHE_KEY_PREFIX = "weather:bmkg:adm4:";
const EXACT_TIMEOUT_MS = 2_500;
const FALLBACK_TIMEOUT_MS = 2_000;
const TOTAL_BUDGET_MS = 6_500;

// In-flight request dedup: concurrent identical adm4 share one promise
const inflightMap = new Map<string, Promise<WeatherServiceResult>>();

export type WeatherServiceResult =
  | { ok: true; forecast: WeatherForecast }
  | { ok: false; error: ApiError["error"]; rateLimited: boolean };

type GetWeatherOptions = {
  allowNetwork?: boolean;
};

function withCachedFlags(
  forecast: WeatherForecast,
  status: "fresh" | "stale"
): WeatherForecast {
  return {
    ...forecast,
    fromCache: true,
    isStale: status === "stale",
  };
}

function getCachedForecast(
  adm4: string
): WeatherForecast | { stale: WeatherForecast } | null {
  const cached = getCache<WeatherForecast>(`${CACHE_KEY_PREFIX}${adm4}`);

  if (cached.status === "fresh") {
    return withCachedFlags(cached.payload, "fresh");
  }
  if (cached.status === "stale") {
    return { stale: withCachedFlags(cached.payload, "stale") };
  }
  return null;
}

function applySearchedRegion(
  forecast: WeatherForecast,
  region: Region | undefined,
  fallbackCode?: string
): WeatherForecast {
  if (!region) return forecast;

  return {
    ...forecast,
    region: {
      ...forecast.region,
      adm4: region.adm4,
      province: region.province,
      city: region.city,
      district: region.district,
      village: region.village,
      timezone: region.timezone,
    },
    fallbackFrom: fallbackCode ? forecast.region.village : undefined,
    fallbackAdm4: fallbackCode,
  };
}

function serviceError(
  code: ApiError["error"]["code"],
  message: string,
  rateLimited = false
): WeatherServiceResult {
  return { ok: false, error: { code, message }, rateLimited };
}

export async function getWeatherForecast(
  adm4: string,
  options: GetWeatherOptions = {}
): Promise<WeatherServiceResult> {
  if (!isValidAdm4(adm4)) {
    return serviceError(
      "INVALID_ADM4",
      "Kode adm4 tidak valid. Format: XX.XX.XX.XXXX (contoh: 31.71.03.1001)."
    );
  }

  const cached = getCachedForecast(adm4);
  if (cached && !("stale" in cached)) {
    return { ok: true, forecast: cached };
  }
  if (options.allowNetwork === false) {
    return cached
      ? { ok: true, forecast: cached.stale }
      : serviceError("BMKG_UNAVAILABLE", "Data BMKG tidak tersedia.", true);
  }

  const existing = inflightMap.get(adm4);
  if (existing) return existing;

  const promise = fetchWeatherForecast(adm4);
  inflightMap.set(adm4, promise);
  try {
    return await promise;
  } finally {
    inflightMap.delete(adm4);
  }
}

async function fetchWeatherForecast(
  adm4: string
): Promise<WeatherServiceResult> {
  // Re-check cache (dedup may have resolved before us)
  const cached = getCachedForecast(adm4);
  if (cached && !("stale" in cached)) {
    return { ok: true, forecast: cached };
  }

  const region = await getRegionByAdm4(adm4);
  const startedAt = Date.now();
  const deadline = startedAt + TOTAL_BUDGET_MS;
  const exactCode = toBmkgAdm4(adm4);
  const exactCandidates = [...new Set([exactCode, adm4])];
  let rateLimited = false;
  let lastError: ApiError["error"] = {
    code: "BMKG_UNAVAILABLE",
    message: "Data BMKG belum dapat diambil.",
  };

  for (const candidate of exactCandidates) {
    if (Date.now() >= deadline) break;

    const result = await fetchForecast(candidate, EXACT_TIMEOUT_MS, 1);
    if (result.ok) {
      const normalized = normalizeBmkgForecast(result.data, region);
      if (normalized && normalized.days.length > 0) {
        // Exact match — BMKG's lokasi is authoritative for this code. Do NOT
        // overwrite it with the (BPS-numbered) dataset entry: for split Papua
        // provinces the same numeric string maps to a DIFFERENT city in BPS vs
        // BMKG/Kemendagri (e.g. 91.71.01.1001 = Sorong in BPS but Jayapura in
        // BMKG), so the override would mislabel the marker.
        const forecast = normalized;
        setCache(`${CACHE_KEY_PREFIX}${adm4}`, forecast);
        return { ok: true, forecast };
      }
      lastError = {
        code: "EMPTY_FORECAST",
        message: "Data BMKG belum berisi prakiraan.",
      };
      continue;
    }

    lastError = {
      code:
        result.error.code === "TIMEOUT"
          ? "BMKG_TIMEOUT"
          : result.error.code === "PARSE_ERROR"
            ? "BMKG_INVALID_RESPONSE"
            : "BMKG_UNAVAILABLE",
      message: "Data BMKG belum dapat diambil.",
    };
    rateLimited = result.error.status === 429 || result.error.status === 403;
    if (rateLimited) break;
  }

  const tried = new Set<string>([adm4, exactCode]);

  if (!rateLimited && Date.now() < deadline) {
    const nearest = await findNearestWithData(getAdm3Prefix(adm4), 6);
    const candidates = nearest
      .map(({ code }) => code)
      .filter((code) => code !== exactCode && code !== adm4 && !tried.has(code))
      .slice(0, 6);
    candidates.forEach((c) => tried.add(c));

    if (candidates.length > 0) {
      // Probe in waves: first 3, then if none work try next 3
      const wave1 = candidates.slice(0, 3);
      const wave2 = candidates.slice(3, 6);

      for (const wave of [wave1, wave2].filter((w) => w.length > 0)) {
        if (Date.now() >= deadline) break;
        const results = await Promise.all(
          wave.map(async (candidate) => ({
            candidate,
            result: await fetchForecast(
              candidate,
              Math.max(500, Math.min(FALLBACK_TIMEOUT_MS, deadline - Date.now())),
              0
            ),
          }))
        );

        const hit = results.find(
          (entry): entry is { candidate: string; result: BmkgClientResult & { ok: true } } => {
            if (!entry.result.ok) return false;
            const normalized = normalizeBmkgForecast(entry.result.data, region);
            return Boolean(normalized && normalized.days.length > 0);
          }
        );
        rateLimited ||= results.some(
          ({ result }) =>
            !result.ok &&
            (result.error.status === 429 || result.error.status === 403)
        );

        if (hit) {
          const normalized = normalizeBmkgForecast(hit.result.data, region);
          if (normalized && normalized.days.length > 0) {
            const forecast = applySearchedRegion(
              normalized,
              region,
              hit.candidate
            );
            setCache(`${CACHE_KEY_PREFIX}${adm4}`, forecast);
            return { ok: true, forecast };
          }
        }

        // If rate-limited in this wave, stop probing
        if (rateLimited) break;
      }
    }

    // ── Broad fallback chain (coverage + blind patterns + guaranteed capitals) ──
    // Runs only when both the exact code and nearest-with-data missed. Probes in
    // parallel batches of 5 and accepts the FIRST candidate with non-empty days
    // so a search NEVER returns "Data Tidak Tersedia" while any nearby region
    // has data. Aborts on 429/403 just like the nearest stage.
    if (!rateLimited && Date.now() < deadline) {
      const chain = await findBmkgFallback(adm4, 60);
      const chainCandidates = chain.filter((code) => !tried.has(code));

      for (let i = 0; i < chainCandidates.length && Date.now() < deadline; i += 5) {
        const batch = chainCandidates.slice(i, i + 5);
        const results = await Promise.all(
          batch.map(async (candidate) => ({
            candidate,
            result: await fetchForecast(
              candidate,
              Math.max(400, Math.min(FALLBACK_TIMEOUT_MS, deadline - Date.now())),
              0
            ),
          }))
        );

        const hit = results.find(
          (entry): entry is { candidate: string; result: BmkgClientResult & { ok: true } } => {
            if (!entry.result.ok) return false;
            const normalized = normalizeBmkgForecast(entry.result.data, region);
            return Boolean(normalized && normalized.days.length > 0);
          }
        );
        rateLimited ||= results.some(
          ({ result }) =>
            !result.ok &&
            (result.error.status === 429 || result.error.status === 403)
        );

        if (hit) {
          const normalized = normalizeBmkgForecast(hit.result.data, region);
          if (normalized && normalized.days.length > 0) {
            const forecast = applySearchedRegion(
              normalized,
              region,
              hit.candidate
            );
            setCache(`${CACHE_KEY_PREFIX}${adm4}`, forecast);
            return { ok: true, forecast };
          }
        }

        if (rateLimited) break;
      }
    }
  }

  if (cached) {
    return { ok: true, forecast: cached.stale };
  }

  return serviceError(
    lastError.code,
    rateLimited
      ? "Layanan BMKG sedang sibuk. Silakan coba lagi."
      : "Data BMKG tidak dapat diambil. Coba beberapa saat lagi.",
    rateLimited
  );
}
