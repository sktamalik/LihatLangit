"use client";
import type { WeatherForecast } from "@/types/weather";
import { estimateAQI, estimateUVIndex, getMoonPhase } from "@/lib/envCalculations";

export default function EnviroMetrics({ forecast }: { forecast: WeatherForecast }) {
  const pt = forecast.nearestPoint ?? forecast.days[0]?.points[0];
  const aqi = estimateAQI(pt?.temperatureC ?? 28, pt?.humidityPct ?? 70);
  const uv = estimateUVIndex(pt?.localDateTime ?? new Date().toISOString(), pt?.cloudCoverPct ?? 30, forecast.region.latitude);
  const moon = getMoonPhase(new Date());
  return (
    <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col h-full">
      <h3 className="font-body-sans text-[16px] font-semibold text-text-dark mb-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary-container text-[20px]">co2</span> Metrik Lingkungan</h3>
      <p className="font-body-sans text-[11px] text-text-muted mb-4 italic">*Estimasi berdasarkan kondisi cuaca, bukan pengukuran langsung</p>
      <div className="flex-grow divide-y divide-outline-variant/20">
        <div className="flex justify-between items-center py-2"><span className="text-[14px] text-on-surface-variant font-medium">AQI (Estimasi)</span><span className={`text-[14px] font-bold ${aqi.color}`}>{aqi.value} ({aqi.label})</span></div>
        <div className="flex justify-between items-center py-2"><span className="text-[14px] text-on-surface-variant font-medium">UV Index (Estimasi)</span><span className={`text-[14px] font-bold ${uv.color}`}>{uv.value} ({uv.label})</span></div>
        <div className="flex justify-between items-center py-2"><span className="text-[14px] text-on-surface-variant font-medium">Fase Bulan</span><span className="text-[14px] font-bold text-secondary">{moon.phase}</span></div>
      </div>
    </div>);
}
