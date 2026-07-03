/**
 * Weather summary — the dominant weather display per DESIGN.md.
 * Shows display-temp (64px Geist), condition, location hierarchy,
 * and key metrics with all-caps labels.
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
  const current = nearestPoint ?? days[0]?.points[0];

  return (
    <div className="glass-card rounded-xl p-card-padding animate-fade-in-up h-full">
      <div className="flex flex-col h-full">
        {/* Location hierarchy */}
        <div className="mb-4">
          <p className="text-label-sm text-text-muted font-geist uppercase tracking-wider">
            {region.province}
          </p>
          <h2 className="text-headline-md font-semibold text-text-deep font-geist leading-tight mt-0.5">
            {region.village}
          </h2>
          <p className="text-body-sm text-text-muted font-inter">
            {region.district}, {region.city}
          </p>
        </div>

        {/* Display temperature (64px desktop, 48px mobile) */}
        {current && (
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="font-geist text-5xl sm:text-6xl lg:text-7xl font-bold text-text-deep leading-none tracking-tighter">
                {current.temperatureC !== null
                  ? `${Math.round(current.temperatureC)}°`
                  : "--"}
              </span>
              <span className="text-body-lg text-text-muted font-inter">
                {current.weatherDescription}
              </span>
            </div>
            <p className="text-label-sm text-text-muted font-geist mt-1">
              {tz} &middot;{" "}
              {current.iconUrl && (
                <img
                  src={current.iconUrl}
                  alt=""
                  className="w-4 h-4 inline-block align-text-bottom"
                />
              )}
            </p>
          </div>
        )}

        {/* Metric grid — all-caps labels per DESIGN.md */}
        {current && (
          <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-white/50">
            <Metric label="KELEMBAPAN" value={current.humidityPct !== null ? `${current.humidityPct}%` : "--"} />
            <Metric label="KECEPATAN ANGIN" value={current.windSpeedKmh !== null ? `${current.windSpeedKmh} km/j` : "--"} />
            <Metric label="TUTUPAN AWAN" value={current.cloudCoverPct !== null ? `${current.cloudCoverPct}%` : "--"} />
            <Metric label="JARAK PANDANG" value={current.visibilityText ?? "--"} />
            {current.windDirection && (
              <Metric label="ARAH ANGIN" value={current.windDirection} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-label-sm text-text-muted font-geist uppercase tracking-widest mb-0.5 text-[11px]">
        {label}
      </p>
      <p className="text-body-md font-semibold text-text-deep font-geist">
        {value}
      </p>
    </div>
  );
}
