"use client";
import { formatTimestamp } from "@/lib/time";
export default function SourceAttribution({ analysisDateUtc, fetchedAt, fromCache, isStale }: { analysisDateUtc: string | null; fetchedAt: string; fromCache: boolean; isStale: boolean; regionTimezone?: string }) {
  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center p-4 font-body-sans text-sm mt-2 mb-8 bg-white rounded-[16px] border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-2 mb-2 md:mb-0"><span className="material-symbols-outlined text-[16px] text-text-dark">info</span><span className="text-text-dark">Sumber data: Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)</span></div>
      <div className="flex gap-4 text-text-muted">{analysisDateUtc && <span className="text-text-dark">Diperbarui BMKG: {formatTimestamp(analysisDateUtc)}</span>}<span className="text-text-dark">Diambil: {formatTimestamp(fetchedAt)}</span>{fromCache && <span className={isStale ? "text-primary-container font-semibold" : "text-primary font-semibold"}>{isStale ? "Data cadangan" : "Cache"}</span>}</div>
    </div>);
}
