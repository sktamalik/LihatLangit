/**
 * Single forecast card — shows one 3-hour slot's weather data.
 * Icon is focal point top-center. Current slot highlighted with
 * secondary glow per DESIGN.md.
 */

"use client";

import type { WeatherPoint } from "@/types/weather";
import { formatTime } from "@/lib/time";

interface ForecastCardProps {
  point: WeatherPoint;
  isNow?: boolean;
}

export default function ForecastCard({ point, isNow }: ForecastCardProps) {
  return (
    <div
      className={`glass-card rounded-xl p-3 sm:p-card-padding text-center transition-all duration-200 hover:shadow-md ${
        isNow
          ? "ring-2 ring-secondary-container/60 shadow-lg shadow-secondary-container/20"
          : ""
      }`}
    >
      {/* Time — all-caps label per DESIGN.md */}
      <p className="text-label-sm text-text-muted font-geist uppercase tracking-wider mb-2">
        {formatTime(point.localDateTime)}
      </p>

      {/* Icon — focal point, positioned center */}
      {point.iconUrl ? (
        <img
          src={point.iconUrl}
          alt={point.weatherDescription}
          className="w-14 h-14 mx-auto mb-2 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="w-14 h-14 mx-auto mb-2 flex items-center justify-center text-3xl">
          {getWeatherEmoji(point.weatherDescription)}
        </div>
      )}

      {/* Temperature — Geist for precision per DESIGN.md */}
      <p className="font-geist text-headline-md font-bold text-text-deep leading-tight">
        {point.temperatureC !== null ? `${Math.round(point.temperatureC)}°` : "--"}
      </p>

      {/* Condition */}
      <p className="text-body-sm text-text-muted mb-3 line-clamp-1 font-inter">
        {point.weatherDescription}
      </p>

      {/* Metrics — all-caps labels, compact */}

      <div className="space-y-1.5 text-label-sm text-text-muted font-geist">
        <div className="flex justify-between gap-1">
          <span className="uppercase tracking-wider text-[10px]">RH</span>
          <span className="font-medium">{point.humidityPct !== null ? `${point.humidityPct}%` : "--"}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="uppercase tracking-wider text-[10px]">Angin</span>
          <span className="font-medium">{point.windSpeedKmh !== null ? `${point.windSpeedKmh} km/j` : "--"}</span>
        </div>
        <div className="flex justify-between gap-1">
          <span className="uppercase tracking-wider text-[10px]">Awan</span>
          <span className="font-medium">{point.cloudCoverPct !== null ? `${point.cloudCoverPct}%` : "--"}</span>
        </div>
        {point.visibilityText && (
          <div className="flex justify-between gap-1">
            <span className="uppercase tracking-wider text-[10px]">Vis</span>
            <span className="font-medium">{point.visibilityText}</span>
          </div>
        )}
      </div>

      {/* Sekarang badge */}
      {isNow && (
        <div className="mt-2">
          <span className="inline-block px-2 py-0.5 text-[10px] font-geist font-semibold uppercase tracking-wider bg-secondary-container/40 text-secondary rounded-full">
            Sekarang
          </span>
        </div>
      )}
    </div>
  );
}

/** Fallback emoji when BMKG icon is not available */
function getWeatherEmoji(desc: string): string {
  const lower = desc.toLowerCase();
  if (lower.includes("hujan") && lower.includes("petir")) return "⛈️";
  if (lower.includes("hujan lebat")) return "🌧️";
  if (lower.includes("hujan")) return "🌦️";
  if (lower.includes("berawan tebal") || lower.includes("mendung")) return "☁️";
  if (lower.includes("berawan")) return "⛅";
  if (lower.includes("cerah")) return "☀️";
  if (lower.includes("kabut")) return "🌫️";
  if (lower.includes("angin")) return "💨";
  return "🌤️";
}
