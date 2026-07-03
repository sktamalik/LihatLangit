/**
 * Community reports — dynamically generated based on weather conditions.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { generateLocalReport } from "@/lib/envCalculations";

interface CommunityReportsProps {
  forecast: WeatherForecast;
}

export default function CommunityReports({ forecast }: CommunityReportsProps) {
  const pt = forecast.nearestPoint ?? forecast.days[0]?.points[0];
  const reports = generateLocalReport(
    forecast.region.village,
    pt?.weatherDescription ?? "",
    pt?.temperatureC ?? 28
  );

  return (
    <div className="glass-panel rounded-3xl p-card-padding sky-shadow flex flex-col border border-primary-container/20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-geist text-[20px] font-semibold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined">forum</span> Laporan Warga
        </h2>
        <span className="text-label-sm text-text-muted font-geist">Berdasarkan data terkini</span>
      </div>
      <div className="flex flex-col gap-3">
        {reports.map((report, i) => (
          <ReportItem
            key={i}
            initial={report.name[0]}
            name={report.name}
            time={report.time}
            text={report.text}
          />
        ))}
      </div>
    </div>
  );
}

function ReportItem({ initial, name, time, text }: { initial: string; name: string; time: string; text: string }) {
  const colors = ["bg-blue-200 text-blue-600", "bg-green-200 text-green-600", "bg-purple-200 text-purple-600", "bg-amber-200 text-amber-600"];
  const colorClass = colors[Math.abs(name.charCodeAt(0)) % colors.length];

  return (
    <div className="flex gap-3 p-3 bg-white/40 rounded-xl">
      <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs`}>{initial}</div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-label-sm font-semibold text-on-surface">{name}</span>
          <span className="text-[10px] text-outline">{time}</span>
        </div>
        <p className="text-sm text-on-surface-variant">{text}</p>
      </div>
    </div>
  );
}
