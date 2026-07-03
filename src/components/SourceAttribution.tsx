/**
 * Source attribution — BMKG data source with metadata timestamps.
 * Per DESIGN.md: placed in footer, small label-sm text.
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
    <div className="glass-card rounded-xl px-card-padding py-4 text-center space-y-1">
      <p className="text-label-sm text-text-muted font-geist tracking-wide">
        Sumber data:{" "}
        <a
          href="https://data.bmkg.go.id"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-primary transition-colors font-medium"
        >
          BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
        </a>
      </p>
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-label-sm text-text-muted font-geist">
        {analysisDateUtc && (
          <span>
            Diperbarui BMKG:{" "}
            <span className="text-text-deep font-medium">
              {formatTimestamp(analysisDateUtc)}
            </span>
          </span>
        )}
        <span>
          Diambil aplikasi:{" "}
          <span className="text-text-deep font-medium">
            {formatTimestamp(fetchedAt)}
          </span>
        </span>
        {fromCache && (
          <span className={`font-semibold ${isStale ? "text-sun-accent" : "text-primary"}`}>
            {isStale ? "Data cadangan" : "Data dari cache"}
          </span>
        )}
      </div>
    </div>
  );
}
