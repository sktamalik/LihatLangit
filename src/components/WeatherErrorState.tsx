/**
 * Weather error state.
 */

"use client";

import type { ErrorCode } from "@/types/weather";

interface WeatherErrorStateProps {
  code: ErrorCode;
  message: string;
  onRetry?: () => void;
}

const errorIcons: Record<string, string> = {
  BMKG_TIMEOUT: "wifi_off",
  BMKG_UNAVAILABLE: "cloud_off",
  BMKG_INVALID_RESPONSE: "warning",
  EMPTY_FORECAST: "inbox",
  INVALID_ADM4: "description",
  REGION_NOT_FOUND: "search_off",
  RATE_LIMITED: "sync",
};

export default function WeatherErrorState({ code, message, onRetry }: WeatherErrorStateProps) {
  return (
    <div className="weather-card rounded-3xl p-10 sky-shadow flex flex-col items-center text-center animate-fade-in-up">
      <span className="material-symbols-outlined text-[48px] text-primary mb-4">{errorIcons[code] ?? "warning"}</span>
      <h3 className="font-geist text-headline-md font-semibold text-text-deep mb-2">
        {code === "BMKG_TIMEOUT" && "Koneksi Terputus"}
        {code === "BMKG_UNAVAILABLE" && "Data Tidak Tersedia"}
        {code === "EMPTY_FORECAST" && "Data Kosong"}
        {(!["BMKG_TIMEOUT", "BMKG_UNAVAILABLE", "EMPTY_FORECAST"].includes(code)) && "Terjadi Kesalahan"}
      </h3>
      <p className="text-text-muted max-w-md mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-6 py-2.5 bg-primary text-white rounded-lg font-geist text-label-sm hover:bg-primary/90 transition-colors">
          Coba lagi
        </button>
      )}
    </div>
  );
}
