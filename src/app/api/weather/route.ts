import { NextRequest, NextResponse } from "next/server";
import { getWeatherForecast } from "@/lib/weatherService";
import type { ApiError } from "@/types/weather";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
};

export async function GET(request: NextRequest) {
  const adm4 = new URL(request.url).searchParams.get("adm4");

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

  const result = await getWeatherForecast(adm4);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error } satisfies ApiError,
      { status: result.error.code === "INVALID_ADM4" ? 400 : 502 }
    );
  }

  return NextResponse.json(result.forecast, { headers: CACHE_HEADERS });
}
