import type { BmkgRawResponse } from "@/types/weather";
import { isValidAdm4 } from "./adm4";

const BMKG_BASE_URL = "https://api.bmkg.go.id/publik/prakiraan-cuaca";

export type BmkgClientError = {
  code: "TIMEOUT" | "HTTP_ERROR" | "PARSE_ERROR" | "INVALID_ADM4";
  message: string;
  status?: number;
};

export type BmkgClientResult =
  | { ok: true; data: BmkgRawResponse }
  | { ok: false; error: BmkgClientError };

export async function fetchForecast(
  adm4: string,
  timeoutMs: number = 10_000
): Promise<BmkgClientResult> {
  if (!isValidAdm4(adm4)) {
    return {
      ok: false,
      error: { code: "INVALID_ADM4", message: `Invalid adm4 code: ${adm4}` },
    };
  }

  try {
    const response = await fetch(
      `${BMKG_BASE_URL}?adm4=${encodeURIComponent(adm4)}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent":
            "LihatLangit/2.0 (weather-dashboard; +https://lihatlangit.vercel.app)",
        },
        next: { revalidate: 1_800 },
        signal: AbortSignal.timeout(timeoutMs),
      }
    );

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: "HTTP_ERROR",
          message: `BMKG returned HTTP ${response.status}`,
          status: response.status,
        },
      };
    }

    return { ok: true, data: (await response.json()) as BmkgRawResponse };
  } catch (error) {
    const timedOut =
      error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      error: timedOut
        ? { code: "TIMEOUT", message: "BMKG request timed out" }
        : {
            code: "HTTP_ERROR",
            message: error instanceof Error ? error.message : String(error),
          },
    };
  }
}
