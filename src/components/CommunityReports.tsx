"use client";
import type { WeatherForecast } from "@/types/weather";
import { formatDateTimeShort } from "@/lib/time";
export default function CommunityReports({forecast}:{forecast:WeatherForecast}){
  return(
    <div className="w-full bg-white rounded-[16px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-body-sans text-[20px] font-semibold text-text-dark flex items-center gap-2"><span className="material-symbols-outlined text-[20px] text-primary-container">monitoring</span> Status Data</h3>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-grass-green/10 border border-grass-green/20">
          <span className="w-2 h-2 rounded-full bg-grass-green animate-pulse"></span>
          <span className="text-[12px] font-bold text-grass-green font-body-sans">{forecast.fromCache ? "Cache" : "Live"}</span>
        </div>
      </div>
      <div className="space-y-4 font-body-sans">
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors border border-outline-variant/30 hover:border-outline-variant">
          <span className="text-[15px] text-primary-container font-bold w-24">Sumber</span>
          <span className="material-symbols-outlined text-[24px] text-primary-container">cloud_sync</span>
          <span className="text-[15px] text-text-dark font-semibold flex-1 text-right">BMKG</span>
          <span className="text-[15px] text-text-muted w-28 text-right">Resmi</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors border border-outline-variant/30 hover:border-outline-variant">
          <span className="text-[15px] text-text-dark font-medium w-24">Analisis</span>
          <span className="material-symbols-outlined text-[24px] text-grass-green">schedule</span>
          <span className="text-[15px] text-text-dark font-semibold flex-1 text-right">{forecast.analysisDateUtc ? formatDateTimeShort(forecast.analysisDateUtc) : "—"}</span>
          <span className="text-[15px] text-text-muted w-28 text-right">BMKG</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors border border-outline-variant/30 hover:border-outline-variant">
          <span className="text-[15px] text-text-dark font-medium w-24">Diambil</span>
          <span className="material-symbols-outlined text-[24px] text-amber-600">history</span>
          <span className="text-[15px] text-text-dark font-semibold flex-1 text-right">{formatDateTimeShort(forecast.fetchedAt)}</span>
          <span className="text-[15px] text-text-muted w-28 text-right">{forecast.fromCache ? "Cache" : "Live"}</span>
        </div>
      </div>
    </div>);
}
