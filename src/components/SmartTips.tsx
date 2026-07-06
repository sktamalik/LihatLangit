"use client";
import type { WeatherForecast } from "@/types/weather";
export default function SmartTips({forecast}:{forecast:WeatherForecast}){
  const p=forecast.nearestPoint??forecast.days[0]?.points[0];const isRainy=p?.weatherDescription.toLowerCase().includes("hujan");
  return(
    <div className="bg-white rounded-[16px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant flex flex-col h-full">
      <h3 className="font-body-sans text-[16px] font-semibold text-text-dark mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary text-[20px]">security</span> Rekomendasi</h3>
      <div className="flex-grow space-y-3">
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-grass-green/10 flex items-center justify-center text-grass-green"><span className="material-symbols-outlined text-[16px]">monitor_heart</span></div><div><p className="text-[13px] font-semibold text-text-dark">Kesehatan</p><p className="text-[11px] text-text-muted">Hidrasi cukup</p></div></div>
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-[16px]">router</span></div><div><p className="text-[13px] font-semibold text-text-dark">Rumah</p><p className="text-[11px] text-text-muted">{isRainy?"Jangan jemur":"Aman menjemur"}</p></div></div>
        <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center text-primary-container"><span className="material-symbols-outlined text-[16px]">{isRainy?"umbrella":"sunny"}</span></div><div><p className="text-[13px] font-semibold text-text-dark">Aktivitas</p><p className="text-[11px] text-text-muted">{isRainy?"Bawa payung":"Nikmati hari"}</p></div></div>
      </div>
    </div>);
}
