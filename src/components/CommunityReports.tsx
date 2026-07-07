"use client";
import { useState, useEffect, useMemo } from "react";
import type { WeatherForecast } from "@/types/weather";
import { formatDateTimeShort, formatAnalysisDate } from "@/lib/time";

/** Calculate "X menit lalu" / "X jam lalu" from fetchedAt */
function relativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function CommunityReports({ forecast }: { forecast: WeatherForecast }) {
  const [tick, setTick] = useState(0);

  // Re-calculate relative time every 30 seconds via tick
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  const ageLabel = useMemo(
    () => relativeTime(forecast.fetchedAt),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [forecast.fetchedAt, tick]
  );

  const analysisDisplay = forecast.analysisDateUtc
    ? formatAnalysisDate(forecast.analysisDateUtc, forecast.region.timezone)
    : "—";

  const statusLabel = forecast.fromCache
    ? forecast.isStale ? "Cache (stale)" : "Cache"
    : "Live";

  const statusColor = forecast.fromCache
    ? forecast.isStale ? "text-amber-600 bg-amber-50 border-amber-200" : "text-sky-600 bg-sky-50 border-sky-200"
    : "text-grass-green bg-grass-green/10 border-grass-green/20";

  return (
    <div className="w-full bg-white rounded-[16px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-body-sans text-[20px] font-semibold text-text-dark flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-primary-container">monitoring</span> Status Data
          </h3>
          <p className="text-[11px] text-text-muted font-body-sans mt-1">
            Diperbarui {ageLabel}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusColor}`}>
          <span className={`w-2 h-2 rounded-full ${forecast.fromCache && !forecast.isStale ? "bg-sky-500" : forecast.isStale ? "bg-amber-500" : "bg-grass-green"} ${!forecast.fromCache || forecast.isStale ? "animate-pulse" : ""}`} />
          <span className={`text-[12px] font-bold font-body-sans`}>{statusLabel}</span>
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
          <span className="text-[15px] text-text-dark font-semibold flex-1 text-right">{analysisDisplay}</span>
          <span className="text-[15px] text-text-muted w-28 text-right">BMKG</span>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors border border-outline-variant/30 hover:border-outline-variant">
          <span className="text-[15px] text-text-dark font-medium w-24">Diambil</span>
          <span className="material-symbols-outlined text-[24px] text-amber-600">history</span>
          <span className="text-[15px] text-text-dark font-semibold flex-1 text-right">{formatDateTimeShort(forecast.fetchedAt)}</span>
          <span className="text-[15px] text-text-muted w-28 text-right">{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}
