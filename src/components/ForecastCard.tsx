/**
 * Single forecast card — shows one 3-hour slot's weather data.
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
      className={`glass-card rounded-xl p-card-padding text-center transition-all duration-200 hover:shadow-md ${
        isNow
          ? "ring-2 ring-primary ring-offset-2 ring-offset-sky-surface"
          : ""
      }`}
    >
      {/* Time */}
      <p className="text-label-sm text-text-muted font-geist uppercase mb-2">
        {formatTime(point.localDateTime)}
        {isNow && (
          <span className="ml-1 text-primary font-semibold">· Sekarang</span>
        )}
      </p>

      {/* Icon */}
      {point.iconUrl ? (
        <img
          src={point.iconUrl}
          alt={point.weatherDescription}
          className="w-12 h-12 mx-auto mb-2 object-contain"
          loading="lazy"
        />
      ) : (
        <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center text-2xl">
          {getWeatherEmoji(point.weatherDescription)}
        </div>
      )}

      {/* Temperature */}
      <p className="font-geist text-headline-md font-bold text-text-deep">
        {point.temperatureC !== null ? `${Math.round(point.temperatureC)}°` : "--"}
      </p>

      {/* Condition */}
      <p className="text-body-sm text-text-muted mb-2 line-clamp-1">
        {point.weatherDescription}
      </p>

      {/* Metrics */}
      <div className="space-y-1 text-label-sm text-text-muted font-geist">
        <div className="flex justify-between gap-2">
          <span className="uppercase">RH</span>
          <span>{point.humidityPct !== null ? `${point.humidityPct}%` : "--"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="uppercase">Angin</span>
          <span>{point.windSpeedKmh !== null ? `${point.windSpeedKmh}` : "--"}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="uppercase">Awan</span>
          <span>{point.cloudCoverPct !== null ? `${point.cloudCoverPct}%` : "--"}</span>
        </div>
        {point.visibilityText && (
          <div className="flex justify-between gap-2">
            <span className="uppercase">Vis</span>
            <span>{point.visibilityText}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Fallback emoji when BMKG icon is not available */
function getWeatherEmoji(desc: string): string {
  const lower = desc.toLowerCase();
  if (lower.includes("hujan") && lower.includes("petir")) return "⛈️";
  if (lower.includes("hujan")) return "🌧️";
  if (lower.includes("berawan tebal") || lower.includes("mendung")) return "☁️";
  if (lower.includes("berawan")) return "⛅";
  if (lower.includes("cerah")) return "☀️";
  if (lower.includes("kabut")) return "🌫️";
  return "🌤️";
}
