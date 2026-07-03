/**
 * Source attribution — BMKG data source notice with metadata timestamps.
 * Must always be visible when weather data is displayed.
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
    <div className="glass-card rounded-xl px-card-padding py-3 text-center space-y-0.5">
      <p className="text-label-sm text-text-muted font-geist">
        Sumber data:{" "}
        <a
          href="https://data.bmkg.go.id"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary transition-colors"
        >
          BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
        </a>
      </p>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-label-sm text-text-muted font-geist">
        {analysisDateUtc && (
          <span>
            Diperbarui BMKG: {formatTimestamp(analysisDateUtc)}
          </span>
        )}
        <span>
          Diambil aplikasi: {formatTimestamp(fetchedAt)}
        </span>
        {fromCache && (
          <span className="text-primary font-medium">
            {isStale ? "Data cadangan" : "Data dari cache"}
          </span>
        )}
        {isStale && (
          <span className="text-sun-accent font-medium">
            Data mungkin tidak terkini
          </span>
        )}
      </div>
    </div>
  );
}
