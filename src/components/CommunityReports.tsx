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
    <div className="w-full h-full bg-white rounded-[16px] p-4 md:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col">
      <div className="flex justify-between items-start mb-3 md:mb-4">
        <div>
          <h3 className="font-body-sans text-[18px] md:text-[20px] font-semibold text-text-dark flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] md:text-[20px] text-primary-container">monitoring</span> Status Data
          </h3>
          <p className="text-[10px] md:text-[11px] text-text-muted font-body-sans mt-0.5">
            Diperbarui {ageLabel}
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full border ${statusColor}`}>
          <span className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${forecast.fromCache && !forecast.isStale ? "bg-sky-500" : forecast.isStale ? "bg-amber-500" : "bg-grass-green"} ${!forecast.fromCache || forecast.isStale ? "animate-pulse" : ""}`} />
          <span className={`text-[10px] md:text-[11px] font-bold font-body-sans`}>{statusLabel}</span>
        </div>
      </div>
      <div className="divide-y divide-outline-variant/20 font-body-sans flex-grow flex flex-col justify-center">
        <div className="flex items-center gap-2 py-2.5 md:py-3 px-2 md:px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px] md:text-[24px] text-primary-container shrink-0">cloud_sync</span>
          <span className="text-[13px] md:text-[15px] text-primary-container font-bold shrink-0">Sumber</span>
          <span className="flex-1 text-right text-[13px] md:text-[15px] text-text-dark font-semibold">BMKG</span>
          <span className="text-[10px] md:text-[13px] text-text-muted shrink-0">Resmi</span>
        </div>
        <div className="flex items-center gap-2 py-2.5 md:py-3 px-2 md:px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px] md:text-[24px] text-grass-green shrink-0">schedule</span>
          <span className="text-[13px] md:text-[15px] text-text-dark font-medium shrink-0">Analisis</span>
          <span className="flex-1 text-right text-[13px] md:text-[15px] text-text-dark font-semibold truncate">{analysisDisplay}</span>
          <span className="text-[10px] md:text-[13px] text-text-muted shrink-0">BMKG</span>
        </div>
        <div className="flex items-center gap-2 py-2.5 md:py-3 px-2 md:px-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
          <span className="material-symbols-outlined text-[20px] md:text-[24px] text-amber-600 shrink-0">history</span>
          <span className="text-[13px] md:text-[15px] text-text-dark font-medium shrink-0">Diambil</span>
          <span className="flex-1 text-right text-[13px] md:text-[15px] text-text-dark font-semibold truncate">{formatDateTimeShort(forecast.fetchedAt)}</span>
          <span className="text-[10px] md:text-[13px] text-text-muted shrink-0">{statusLabel}</span>
        </div>
      </div>
    </div>
  );
}
