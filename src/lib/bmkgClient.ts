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
 */
export async function fetchForecast(
  adm4: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<BmkgClientResult> {
  if (!isValidAdm4(adm4)) {
    return {
      ok: false,
      error: buildError("INVALID_ADM4", `Invalid adm4 code: ${adm4}`),
    };
  }

  const url = `${BMKG_BASE_URL}?adm4=${encodeURIComponent(adm4)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return {
        ok: false,
        error: buildError(
          "HTTP_ERROR",
          `BMKG returned HTTP ${response.status}`,
          response.status
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
      return {
        ok: false,
        error: buildError("TIMEOUT", "BMKG request timed out"),
      };
    }

    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: buildError("HTTP_ERROR", msg),
    };
  } finally {
    clearTimeout(timer);
  }
}
