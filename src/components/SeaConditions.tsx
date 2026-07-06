"use client";
import type { WeatherForecast } from "@/types/weather";
import { estimateSeaConditions } from "@/lib/envCalculations";
export default function SeaConditions({forecast}:{forecast:WeatherForecast}){
  const s=estimateSeaConditions((forecast.nearestPoint??forecast.days[0]?.points[0])?.windSpeedKmh??10);
  return(
    <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col h-full">
      <h3 className="font-body-sans text-[16px] font-semibold text-text-dark mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-secondary text-[20px]">water</span> Kondisi Laut</h3>
      <div className="flex-grow flex flex-col justify-center items-center text-center">
        <span className="material-symbols-outlined text-[40px] text-secondary mb-2">waves</span>
        <p className="text-[14px] text-on-surface-variant font-medium mb-1">Gelombang</p>
        <p className="text-[20px] font-bold text-text-dark">{s.waveCategory}</p>
        <div className="mt-4 flex gap-4 text-[12px] text-text-muted"><span>{s.waveHeight}</span><span>Suhu: {s.seaTemp}</span></div>
      </div>
    </div>);
}
