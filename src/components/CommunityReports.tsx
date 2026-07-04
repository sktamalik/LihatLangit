/**
 * Data Status — shows real BMKG metadata, cache status, fetch info.
 * Replaces simulated community reports with actual operational data.
 * Layout aligned with SunMoon card for visual consistency.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";

interface CommunityReportsProps {
  forecast: WeatherForecast;
}

export default function CommunityReports({ forecast }: CommunityReportsProps) {
  return (
    <div className="weather-card rounded-3xl p-card-padding sky-shadow flex flex-col">
      <h2 className="font-geist text-[18px] font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">monitoring</span> Status Data
      </h2>
      <div className="flex flex-col gap-2">
        <DataRow
          icon="cloud_sync"
          iconColor="text-primary"
          label="Sumber Data"
          value="BMKG — Badan Meteorologi, Klimatologi, dan Geofisika"
        />
        <DataRow
          icon="distance"
          iconColor="text-indigo-500"
          label="Kode Wilayah (adm4)"
          value={forecast.region.adm4 || "—"}
        />
        <DataRow
          icon="schedule"
          iconColor="text-green-600"
          label="Analisis BMKG"
          value={forecast.analysisDateUtc ? formatShortDate(forecast.analysisDateUtc) : "—"}
          detail="Waktu produksi data prakiraan"
        />
        <DataRow
          icon="history"
          iconColor="text-amber-600"
          label="Diambil Aplikasi"
          value={formatShortDate(forecast.fetchedAt)}
          detail={forecast.fromCache ? "Data dari cache server" : "Data baru dari BMKG"}
        />
        <DataRow
          icon={forecast.isStale ? "warning" : "check_circle"}
          iconColor={forecast.isStale ? "text-red-500" : forecast.fromCache ? "text-amber-500" : "text-green-500"}
          label="Status Cache"
          value={forecast.isStale ? "Data Cadangan" : forecast.fromCache ? "Cache Aktif" : "Data Segar"}
          detail={forecast.isStale ? "Data mungkin tidak terkini. BMKG tidak tersedia." : "Cache server berlaku 1 jam"}
        />
        <DataRow
          icon="schedule"
          iconColor="text-purple-500"
          label="Perbaruan BMKG"
          value="2× sehari (pagi & sore)"
        />
      </div>

      {/* Link ke BMKG */}
      <a
        href="https://data.bmkg.go.id"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center justify-center gap-1 text-[11px] text-primary font-medium hover:underline"
      >
        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
        Kunjungi data.bmkg.go.id
      </a>
    </div>
  );
}

function DataRow({
  icon,
  iconColor,
  label,
  value,
  detail,
}: {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-outline-variant/10 last:border-b-0">
      <span className={`material-symbols-outlined ${iconColor} text-[18px] mt-0.5`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-outline leading-none font-geist uppercase tracking-wider">{label}</span>
          <span className="text-[12px] font-semibold text-on-surface text-right">{value}</span>
        </div>
        {detail && <p className="text-[10px] text-outline mt-0.5">{detail}</p>}
      </div>
    </div>
  );
}

function formatShortDate(iso: string): string {
  try {
    const date = new Date(iso.replace(" ", "T"));
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
