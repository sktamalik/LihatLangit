"use client";
import { formatTimestamp, formatAnalysisDate } from "@/lib/time";
export default function SourceAttribution({ analysisDateUtc, fetchedAt, fromCache, isStale, regionTimezone }: { analysisDateUtc: string | null; fetchedAt: string; fromCache: boolean; isStale: boolean; regionTimezone?: string }) {
  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 p-3 sm:px-5 sm:py-3 font-body-sans mt-2 mb-8 bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      {/* Kiri: BMKG */}
      <span className="flex items-center gap-1.5 shrink-0">
        <span className="material-symbols-outlined text-[12px] sm:text-[14px] text-text-muted shrink-0">info</span>
        <span className="text-[11px] sm:text-[13px] text-text-dark font-medium whitespace-nowrap">Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)</span>
      </span>

      {/* Tengah: timestamp */}
      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] sm:text-[12px] text-text-muted flex-1 sm:justify-center px-0 sm:px-3">
        <span className="whitespace-nowrap">
          Diperbarui BMKG: <span className="font-medium text-text-dark">{analysisDateUtc ? formatAnalysisDate(analysisDateUtc, regionTimezone) : "Tidak tersedia"}</span>
        </span>
        <span className="whitespace-nowrap">
          Diambil: <span className="font-medium text-text-dark">{formatTimestamp(fetchedAt)}</span>
        </span>
      </span>

      {/* Kanan: cache */}
      <span className="sm:w-[15%] flex sm:justify-end shrink-0">
        {fromCache && (
          <span className={`text-[10px] sm:text-[12px] font-semibold whitespace-nowrap ${isStale ? "text-primary-container" : "text-primary"}`}>
            {isStale ? "Data cadangan" : "Cache"}
          </span>
        )}
      </span>
    </div>);
}
