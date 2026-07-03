/**
 * Source attribution — BMKG data source with metadata timestamps.
 */

"use client";

import { formatTimestamp } from "@/lib/time";

interface SourceAttributionProps {
  analysisDateUtc: string | null;
  fetchedAt: string;
  fromCache: boolean;
  isStale: boolean;
  regionTimezone?: string;
}

export default function SourceAttribution({
  analysisDateUtc,
  fetchedAt,
  fromCache,
  isStale,
}: SourceAttributionProps) {
  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center opacity-70 p-4 font-label-sm text-label-sm text-outline mt-2 bg-surface-container-low/50 rounded-2xl">
      <div className="flex items-center gap-2 mb-2 md:mb-0">
        <span className="material-symbols-outlined text-[16px]">info</span>
        <span>Sumber data: Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)</span>
      </div>
      <div className="flex gap-4">
        {analysisDateUtc && <span>Diperbarui BMKG: {formatTimestamp(analysisDateUtc)}</span>}
        <span>Diambil: {formatTimestamp(fetchedAt)}</span>
        {fromCache && <span className={isStale ? "text-sun-accent font-semibold" : "text-primary font-semibold"}>{isStale ? "Data cadangan" : "Cache"}</span>}
      </div>
    </div>
  );
}
