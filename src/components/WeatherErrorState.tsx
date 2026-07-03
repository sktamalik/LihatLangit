/**
 * Weather error state — shown when weather data fetch fails.
 * Displays error message with configurable action button.
 */

"use client";

import type { ErrorCode } from "@/types/weather";

interface WeatherErrorStateProps {
  code: ErrorCode;
  message: string;
  onRetry?: () => void;
  onChangeRegion?: () => void;
}

const errorDetails: Record<ErrorCode, { emoji: string }> = {
  INVALID_ADM4: { emoji: "📋" },
  REGION_NOT_FOUND: { emoji: "🔍" },
  BMKG_TIMEOUT: { emoji: "⏱️" },
  BMKG_UNAVAILABLE: { emoji: "📡" },
  BMKG_INVALID_RESPONSE: { emoji: "⚠️" },
  RATE_LIMITED: { emoji: "🔄" },
  EMPTY_FORECAST: { emoji: "📭" },
};

export default function WeatherErrorState({
  code,
  message,
  onRetry,
  onChangeRegion,
}: WeatherErrorStateProps) {
  const detail = errorDetails[code] ?? { emoji: "⚠️" };

  return (
    <div className="animate-fade-in-up flex flex-col items-center justify-center py-12 px-4">
      <span className="text-5xl mb-4">{detail.emoji}</span>
      <h3 className="text-headline-md font-semibold text-text-deep mb-2 font-geist">
        {code === "BMKG_TIMEOUT" && "Koneksi Terputus"}
        {code === "BMKG_UNAVAILABLE" && "Data Tidak Tersedia"}
        {code === "BMKG_INVALID_RESPONSE" && "Kesalahan Data"}
        {code === "EMPTY_FORECAST" && "Data Kosong"}
        {code === "INVALID_ADM4" && "Kode Wilayah Tidak Valid"}
        {code === "REGION_NOT_FOUND" && "Wilayah Tidak Ditemukan"}
        {code === "RATE_LIMITED" && "Terlalu Banyak Permintaan"}
        {!["BMKG_TIMEOUT","BMKG_UNAVAILABLE","BMKG_INVALID_RESPONSE","EMPTY_FORECAST","INVALID_ADM4","REGION_NOT_FOUND","RATE_LIMITED"].includes(code) && "Terjadi Kesalahan"}
      </h3>
      <p className="text-body-md text-text-muted text-center max-w-md mb-6">
        {message}
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-lg font-geist text-label-sm hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Coba lagi
          </button>
        )}
        {onChangeRegion && (
          <button
            onClick={onChangeRegion}
            className="px-5 py-2.5 bg-white/80 text-primary border border-primary/30 rounded-lg font-geist text-label-sm hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Ganti wilayah
          </button>
        )}
      </div>
    </div>
  );
}
