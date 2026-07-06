"use client";
import type { WeatherForecast } from "@/types/weather";
import { getSunTimes } from "@/lib/envCalculations";
export default function SunMoon({forecast}:{forecast:WeatherForecast}){
  const n=new Date();const s=getSunTimes(n,forecast.region.latitude,forecast.region.longitude,forecast.region.timezone);
  return(
    <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col h-full">
      <h3 className="font-body-sans text-[16px] font-semibold text-text-dark mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-[#FDE047] text-[20px]">routine</span> Aktivitas Harian</h3>
      <div className="flex-grow flex flex-col justify-around">
        <div className="flex items-center gap-4"><span className="material-symbols-outlined text-[24px] text-[#FDE047]">wb_twilight</span><div><p className="text-[12px] text-on-surface-variant font-medium">Terbit</p><p className="text-[16px] font-bold text-text-dark">{s.sunrise}</p></div></div>
        <div className="flex items-center gap-4"><span className="material-symbols-outlined text-[24px] text-primary-container">nights_stay</span><div><p className="text-[12px] text-on-surface-variant font-medium">Terbenam</p><p className="text-[16px] font-bold text-text-dark">{s.sunset}</p></div></div>
      </div>
    </div>);
}
