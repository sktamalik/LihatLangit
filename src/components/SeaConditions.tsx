/**
 * Sea conditions card — data estimated from wind speed.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { estimateSeaConditions } from "@/lib/envCalculations";

interface SeaConditionsProps {
  forecast: WeatherForecast;
}

export default function SeaConditions({ forecast }: SeaConditionsProps) {
  const pt = forecast.nearestPoint ?? forecast.days[0]?.points[0];
  const sea = estimateSeaConditions(pt?.windSpeedKmh ?? 10);

  return (
    <div className="weather-card rounded-3xl p-card-padding sky-shadow flex flex-col">
      <h2 className="font-geist text-[18px] font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">waves</span> Kondisi Laut
      </h2>
      <div className="flex flex-col gap-3">
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-outline leading-none mb-1">Gelombang</span>
            <span className="text-[13px] font-semibold text-on-surface">{sea.waveHeight} ({sea.waveCategory})</span>
          </div>
          <span className="material-symbols-outlined text-primary opacity-40">water</span>
        </div>
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[10px] text-outline leading-none mb-1">Suhu Laut</span>
            <span className="text-[13px] font-semibold text-on-surface">{sea.seaTemp}</span>
          </div>
          <span className="material-symbols-outlined text-primary opacity-40">thermostat</span>
        </div>
        {forecast.region.latitude && forecast.region.longitude && (
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-outline leading-none mb-1">Koordinat</span>
              <span className="text-[13px] font-semibold text-on-surface">
                {forecast.region.latitude.toFixed(2)}°S, {forecast.region.longitude.toFixed(2)}°E
              </span>
            </div>
            <span className="material-symbols-outlined text-primary opacity-40">location_on</span>
          </div>
        )}
      </div>
    </div>
  );
}
