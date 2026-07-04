/**
 * Environmental metrics card — AQI, UV Index based on real weather data.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { estimateAQI, estimateUVIndex, getMoonPhase } from "@/lib/envCalculations";

interface EnviroMetricsProps {
  forecast: WeatherForecast;
}

export default function EnviroMetrics({ forecast }: EnviroMetricsProps) {
  const pt = forecast.nearestPoint ?? forecast.days[0]?.points[0];
  const temp = pt?.temperatureC ?? 28;
  const hum = pt?.humidityPct ?? 70;
  const cloud = pt?.cloudCoverPct ?? 30;

  const aqi = estimateAQI(temp, hum);
  const uv = estimateUVIndex(
    pt?.localDateTime ?? new Date().toISOString(),
    cloud,
    forecast.region.latitude
  );
  const moon = getMoonPhase(new Date());

  return (
    <div className="weather-card rounded-3xl p-card-padding sky-shadow flex flex-col gap-4">
      <h2 className="font-geist text-[18px] font-semibold text-primary mb-1">Metrik Lingkungan</h2>
      <div className="flex flex-col gap-2">
        <MetricRow
          icon="air"
          label="AQI (Estimasi)"
          value={`${aqi.value} (${aqi.label})`}
          color={aqi.color}
          detail={`PM2.5: ${Math.round(aqi.value * 0.26)}  PM10: ${Math.round(aqi.value * 0.44)}`}
        />
        <MetricRow
          icon="light_mode"
          label="Indeks UV"
          value={`${uv.value} (${uv.label})`}
          color={uv.color}
          detail={uv.tip}
        />
        <MetricRow
          icon="routine"
          label="Fase Bulan"
          value={moon.phase}
          color="text-indigo-500"
          detail={`${moon.illumination}% Iluminasi`}
        />
      </div>
    </div>
  );
}

function MetricRow({
  icon, label, value, color, detail,
}: {
  icon: string; label: string; value: string; color: string; detail: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-white/60">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined ${color} text-[20px]`}>{icon}</span>
        <div className="flex flex-col">
          <span className="text-[10px] text-outline leading-none">{label}</span>
          <span className={`text-[13px] font-semibold ${color}`}>{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-outline text-right max-w-[90px]">{detail}</span>
    </div>
  );
}
