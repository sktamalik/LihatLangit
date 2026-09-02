import type { BmkgRawResponse } from "@/types/weather";
import { isValidAdm4 } from "./adm4";

const BMKG_BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";
const USER_AGENTS = [
  "LihatLangit/2.0 (weather-dashboard; +https://lihatlangit.vercel.app)",
  "Mozilla/5.0 (compatible; LihatLangit/2.0; +https://lihatlangit.vercel.app)",
  "LihatLangit/2.0 (BMKG weather proxy; +https://lihatlangit.vercel.app)",
];

export type BmkgClientError = {
  code: "TIMEOUT" | "HTTP_ERROR" | "PARSE_ERROR" | "INVALID_ADM4";
  message: string;
  status?: number;
};

export type BmkgClientResult =
  | { ok: true; data: BmkgRawResponse }
  | { ok: false; error: BmkgClientError };

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

export async function fetchForecast(
  adm4: string,
  timeoutMs: number = 10_000,
  maxRetries: number = 2
): Promise<BmkgClientResult> {
  if (!isValidAdm4(adm4)) {
    return {
      ok: false,
      error: { code: "INVALID_ADM4", message: `Invalid adm4 code: ${adm4}` },
    };
  }

  let lastError: BmkgClientError = {
    code: "HTTP_ERROR",
    message: "BMKG request failed",
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const ua = USER_AGENTS[attempt % USER_AGENTS.length];
      const response = await fetch(
        `${BMKG_BASE_URL}?adm4=${encodeURIComponent(adm4)}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": ua,
          },
          signal: AbortSignal.timeout(timeoutMs),
        }
      );

      if (!response.ok) {
        lastError = {
          code: "HTTP_ERROR",
          message: `BMKG returned HTTP ${response.status}`,
          status: response.status,
        };
        // Don't retry 4xx except 429/403
        if (response.status < 400 || response.status === 429 || response.status === 403) {
          continue;
        }
        return { ok: false, error: lastError };
      }

      let data: BmkgRawResponse;
      try {
        data = (await response.json()) as BmkgRawResponse;
      } catch {
        return {
          ok: false,
          error: {
            code: "PARSE_ERROR",
            message: "Failed to parse BMKG response JSON",
          },
        };
      }

      return { ok: true, data };
    } catch (error) {
      if (isAbortError(error)) {
        lastError = {
          code: "TIMEOUT",
          message: "BMKG request timed out",
        };
      } else {
        lastError = {
          code: "HTTP_ERROR",
          message: error instanceof Error ? error.message : String(error),
        };
      }
      // Retry timeouts and network errors
      continue;
    }
  }

  return { ok: false, error: lastError };
}
