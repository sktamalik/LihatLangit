"use client";
import type { WeatherForecast } from "@/types/weather";
export default function WeatherSummary({forecast}:{forecast:WeatherForecast}){
  const{region,nearestPoint,days}=forecast;const c=nearestPoint??days[0]?.points[0];
  return(
    <div className="bg-white rounded-[16px] p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col items-center justify-center h-full">
      <div className="w-full flex justify-end mb-6">
        <div className="px-3 py-1.5 rounded-full bg-surface-container flex items-center gap-1.5 border border-outline-variant/50">
          <span className="material-symbols-outlined text-[16px] text-primary-container">location_on</span>
          <span className="font-body-sans text-[13px] text-primary-container font-semibold">{region.city}</span>
        </div>
      </div>
      <span className={`material-symbols-outlined text-[56px] mb-4 ${(()=>{const d=c?.weatherDescription?.toLowerCase()??"";if(d.includes("hujan"))return"text-blue-500";if(d.includes("awan"))return"text-slate-400";return"text-amber-400"})()}`}>{c?.weatherDescription?.toLowerCase().includes("hujan")?"rainy":c?.weatherDescription?.toLowerCase().includes("awan")?"cloud":"clear_day"}</span>
      <h2 className="font-body-sans text-[72px] font-bold text-text-dark leading-none tracking-tighter mb-2">{c?.temperatureC!==null?`${Math.round(c!.temperatureC)}`:"--"}<span className="text-[28px] font-semibold text-text-muted ml-1">°C</span></h2>
      <p className="font-body-sans text-[18px] text-primary-container font-bold mb-10 tracking-wide uppercase">{c?.weatherDescription??"—"}</p>
      <div className="grid grid-cols-2 gap-x-8 gap-y-8 w-full text-center">
        <div><span className="material-symbols-outlined text-[24px] text-text-muted mb-2">humidity_percentage</span><p className="font-body-sans text-[13px] text-text-muted font-medium">Kelembapan</p><p className="font-body-sans text-[16px] font-bold text-text-dark">{c?.humidityPct!==null?`${c!.humidityPct}%`:"--"}</p></div>
        <div><span className="material-symbols-outlined text-[24px] text-text-muted mb-2">air</span><p className="font-body-sans text-[13px] text-text-muted font-medium">Angin</p><p className="font-body-sans text-[16px] font-bold text-text-dark">{c?.windSpeedKmh!==null?`${c!.windSpeedKmh} km/h`:"--"}</p></div>
        <div><span className="material-symbols-outlined text-[24px] text-text-muted mb-2">visibility</span><p className="font-body-sans text-[13px] text-text-muted font-medium">Jarak Pandang</p><p className="font-body-sans text-[16px] font-bold text-text-dark">{c?.visibilityText??"--"}</p></div>
        <div><span className="material-symbols-outlined text-[24px] text-text-muted mb-2">near_me</span><p className="font-body-sans text-[13px] text-text-muted font-medium">Arah Angin</p><p className="font-body-sans text-[16px] font-bold text-text-dark">{c?.windDirection??"--"}</p></div>
      </div>
    </div>);
}
