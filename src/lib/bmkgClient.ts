/**
 * BMKG API client.
 *
 * Fetches weather forecast data from the official BMKG public API.
 * All requests must go through this server-side module — never call BMKG
 * directly from the browser.
 */

import type { BmkgRawResponse } from "@/types/weather";
import { isValidAdm4 } from "./adm4";

const BMKG_BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = [500, 1500];
const USER_AGENTS = [
  "LihatLangit/2.0 (weather-dashboard; +https://lihatlangit.vercel.app)",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
];

export type BmkgClientError = {
  code: "TIMEOUT" | "HTTP_ERROR" | "PARSE_ERROR" | "INVALID_ADM4";
  message: string;
  status?: number;
};

export type BmkgClientResult =
  | { ok: true; data: BmkgRawResponse }
  | { ok: false; error: BmkgClientError };

function buildError(
  code: BmkgClientError["code"],
  message: string,
  status?: number
): BmkgClientError {
  return { code, message, status };
}

/**
 * Fetch weather forecast from BMKG for a given adm4 code.
 * Returns normalized result object (not a thrown exception).
 *
 * Auto-retries on 429 (rate limit) and 5xx with round-robin UA and backoff.
 * Callers MUST check `result.error.status === 429` to short-circuit fallback.
 */
export async function fetchForecast(
  adm4: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
  maxRetries: number = MAX_RETRIES
): Promise<BmkgClientResult> {
  if (!isValidAdm4(adm4)) {
    return {
      ok: false,
      error: buildError("INVALID_ADM4", `Invalid adm4 code: ${adm4}`),
    };
  }

  const url = `${BMKG_BASE_URL}?adm4=${encodeURIComponent(adm4)}`;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const ua = USER_AGENTS[attempt % USER_AGENTS.length];

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": ua,
        },
      });

      if (!response.ok) {
        const status = response.status;
        // 429 or 403 — rate limited / blocked; retry with backoff if attempts remain
        if ((status === 429 || status === 403) && attempt < maxRetries) {
          clearTimeout(timer);
          controller.abort();
          const delay = RETRY_DELAY_MS[attempt] ?? 1500;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        return {
          ok: false,
          error: buildError(
            "HTTP_ERROR",
            `BMKG returned HTTP ${status}`,
            status
          ),
        };
      }

      let raw: unknown;
      try {
        raw = await response.json();
      } catch {
        return {
          ok: false,
          error: buildError("PARSE_ERROR", "Invalid JSON response from BMKG"),
        };
      }

      return { ok: true, data: raw as BmkgRawResponse };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // AbortError from actual timeout, or from manual abort after rate-limit
        if (attempt < maxRetries) {
          continue;
        }
        return {
          ok: false,
          error: buildError("TIMEOUT", "BMKG request timed out"),
        };
      }

      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < maxRetries) {
        continue;
      }
      return {
        ok: false,
        error: buildError("HTTP_ERROR", msg),
      };
    } finally {
      clearTimeout(timer);
    }
  }

  // Should not reach here, but satisfies return
  return { ok: false, error: buildError("HTTP_ERROR", "Request failed after max retries") };
}
