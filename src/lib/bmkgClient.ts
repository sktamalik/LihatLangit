import type { BmkgRawResponse } from "@/types/weather";
import { isValidAdm4 } from "./adm4";

const BMKG_BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
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
            Accept: "application/json, text/plain, */*",
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
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
        // 4xx errors (404, 429 rate limit, 403 forbidden) must NOT retry immediately to avoid hammering
        if (response.status >= 400 && response.status < 500) {
          return { ok: false, error: lastError };
        }
        // Only 5xx server errors retry with a brief backoff
        await new Promise((r) => setTimeout(r, 300));
        continue;
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
