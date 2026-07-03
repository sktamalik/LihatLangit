/**
 * Hourly forecast timeline — horizontal scroll on mobile, grid on desktop.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";

interface HourlyForecastProps {
  forecast: WeatherForecast;
}

const weatherIcons: Record<string, string> = {
  "cerah": "☀️",
  "cerah berawan": "⛅",
  "berawan": "☁️",
  "berawan tebal": "☁️",
  "hujan ringan": "🌦️",
  "hujan sedang": "🌧️",
  "hujan lebat": "🌧️",
  "hujan petir": "⛈️",
};

function getIcon(desc: string): string {
  const key = Object.keys(weatherIcons).find((k) => desc.toLowerCase().includes(k));
  return weatherIcons[key ?? ""] ?? "🌤️";
}

export default function HourlyForecast({ forecast }: HourlyForecastProps) {
  const today = forecast.days[0];
  if (!today) return null;

  return (
    <div className="glass-panel rounded-3xl p-card-padding sky-shadow">
      <h2 className="font-geist text-headline-md font-semibold text-primary mb-4">Prakiraan Hari Ini</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
        {today.points.map((point, i) => {
          const isNow = forecast.nearestPoint?.localDateTime === point.localDateTime;
          return (
            <div
              key={point.localDateTime}
              className={`flex-shrink-0 flex flex-col items-center p-3 rounded-2xl min-w-[85px] transition-all ${
                isNow
                  ? "bg-secondary-container/60 border border-primary/20 shadow-sm -translate-y-1"
                  : "hover:bg-white/60 cursor-pointer"
              }`}
            >
              <span className={`font-label-sm text-label-sm mb-2 ${isNow ? "text-primary font-bold" : "text-outline"}`}>
                {formatTime(point.localDateTime)}
              </span>
              <span className="text-2xl mb-2">{getIcon(point.weatherDescription)}</span>
              <span className={`font-body-md font-semibold ${isNow ? "text-primary text-[18px]" : "text-on-surface"}`}>
                {point.temperatureC !== null ? `${Math.round(point.temperatureC)}°` : "--"}
              </span>
              {point.humidityPct !== null && (
                <span className="text-[10px] text-primary font-medium mt-1">{point.humidityPct}%</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
