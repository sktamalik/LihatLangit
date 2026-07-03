/**
 * Weather summary — the dominant weather display.
 * Shows current temperature, condition, location, and key metrics.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { getTimezoneAbbr } from "@/lib/time";

interface WeatherSummaryProps {
  forecast: WeatherForecast;
}

export default function WeatherSummary({ forecast }: WeatherSummaryProps) {
  const { region, nearestPoint, days } = forecast;
  const tz = getTimezoneAbbr(region.timezone);

  // Use nearestPoint data, or fall back to first future point
  const current = nearestPoint ?? days[0]?.points[0];

  return (
    <div className="glass-card rounded-xl p-card-padding animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Location + temperature */}
        <div className="flex-1">
          <h2 className="text-body-md font-semibold text-text-deep font-geist">
            {region.village}
            <span className="text-text-muted font-normal font-inter">
              , {region.district}, {region.city}
            </span>
          </h2>

          {current && (
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-geist text-5xl sm:text-6xl md:text-7xl font-bold text-text-deep leading-none tracking-tight">
                {current.temperatureC !== null
                  ? `${Math.round(current.temperatureC)}°`
                  : "--"}
              </span>
              <span className="text-body-lg text-text-muted">
                {current.weatherDescription}
              </span>
            </div>
          )}

          <p className="text-label-sm text-text-muted font-geist mt-1">
            {region.province} &middot; {tz}
          </p>
        </div>

        {/* Right: Key metrics */}
        {current && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Metric label="Kelembapan" value={current.humidityPct !== null ? `${current.humidityPct}%` : "--"} />
            <Metric label="Angin" value={current.windSpeedKmh !== null ? `${current.windSpeedKmh} km/j` : "--"} />
            <Metric label="Awan" value={current.cloudCoverPct !== null ? `${current.cloudCoverPct}%` : "--"} />
            <Metric label="Jarak pandang" value={current.visibilityText ?? "--"} />
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label-sm text-text-muted font-geist uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-body-md font-semibold text-text-deep font-geist">
        {value}
      </p>
    </div>
  );
}
