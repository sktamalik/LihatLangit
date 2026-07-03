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

const emoji: Record<string, string> = {
  BMKG_TIMEOUT: "⏱️",
  BMKG_UNAVAILABLE: "📡",
  BMKG_INVALID_RESPONSE: "⚠️",
  EMPTY_FORECAST: "📭",
  INVALID_ADM4: "📋",
  REGION_NOT_FOUND: "🔍",
  RATE_LIMITED: "🔄",
};

export default function WeatherErrorState({ code, message, onRetry }: WeatherErrorStateProps) {
  return (
    <div className="glass-panel rounded-3xl p-10 sky-shadow flex flex-col items-center text-center animate-fade-in-up">
      <span className="text-5xl mb-4">{emoji[code] ?? "⚠️"}</span>
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
