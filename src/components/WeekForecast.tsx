"use client";
import type { WeatherForecast, WeatherPoint } from "@/types/weather";

const icons: Record<string, string> = {
  "cerah": "clear_day", "cerah berawan": "partly_cloudy_day",
  "berawan": "cloudy", "berawan tebal": "cloud",
  "hujan ringan": "rainy_light", "hujan sedang": "rainy",
  "hujan lebat": "rainy_heavy", "hujan petir": "thunderstorm",
};
const iconColors: Record<string, string> = {
  "cerah": "text-amber-400", "cerah berawan": "text-amber-400",
  "berawan": "text-slate-400", "berawan tebal": "text-slate-500",
  "hujan ringan": "text-sky-500", "hujan sedang": "text-blue-500",
  "hujan lebat": "text-blue-600", "hujan petir": "text-purple-500",
};

function gi(d: string) {
  const k = Object.keys(icons).find((x) => d.toLowerCase().includes(x));
  return icons[k ?? ""] ?? "partly_cloudy_day";
}
function gc(d: string) {
  const k = Object.keys(iconColors).find((x) => d.toLowerCase().includes(x));
  return iconColors[k ?? ""] ?? "text-primary-container";
}

function tempRange(points: { temperatureC: number | null }[]) {
  const v = points.map((p) => p.temperatureC).filter((t): t is number => t !== null);
  if (v.length === 0) return { min: 0, max: 0 };
  return { min: Math.round(Math.min(...v)), max: Math.round(Math.max(...v)) };
}
function avgH(points: { humidityPct: number | null }[]) {
  const v = points.map((p) => p.humidityPct).filter((h): h is number => h !== null);
  if (v.length === 0) return 0;
  return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
}
function dominantWeather(points: WeatherPoint[]): string {
  const count: Record<string, number> = {};
  for (const p of points) {
    const d = p.weatherDescription || "—";
    count[d] = (count[d] || 0) + 1;
  }
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}
function maxWind(points: WeatherPoint[]): number | null {
  const winds = points.map((p) => p.windSpeedKmh).filter((w): w is number => w !== null);
  if (winds.length === 0) return null;
  return Math.round(Math.max(...winds));
}
function maxCloud(points: WeatherPoint[]): number | null {
  const clouds = points.map((p) => p.cloudCoverPct).filter((c): c is number => c !== null);
  if (clouds.length === 0) return null;
  return Math.round(Math.max(...clouds));
}
function rainChance(points: WeatherPoint[]): number {
  const rainy = points.filter((p) =>
    p.weatherDescription.toLowerCase().includes("hujan")
  ).length;
  if (points.length === 0) return 0;
  return Math.round((rainy / points.length) * 100);
}
function dominantWindDir(points: WeatherPoint[]): string | null {
  const dirs = points.map((p) => p.windDirection).filter((d): d is string => d != null && d !== "");
  if (dirs.length === 0) return null;
  const count: Record<string, number> = {};
  for (const d of dirs) count[d] = (count[d] || 0) + 1;
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
function minVisibility(points: WeatherPoint[]): string | null {
  const visTexts = points.map((p) => p.visibilityText).filter((v): v is string => v != null && v !== "");
  if (visTexts.length === 0) return null;
  return visTexts[0];
}
const windLabel = (kmh: number): string => {
  if (kmh <= 5) return "Tenang";
  if (kmh <= 15) return "Sedang";
  if (kmh <= 30) return "Kencang";
  return "Sangat Kencang";
};
const cloudLabel = (pct: number): string => {
  if (pct <= 30) return "Cerah";
  if (pct <= 70) return "Berawan";
  return "Mendung";
};

/* ── Shared sizes: base → md: slightly bump from tiny, no "xl" jumps ── */
const sz = {
  row: "p-3 md:p-4",
  label: "text-[14px] md:text-[15px]",
  labelW: "w-16 md:w-20",
  icon: "text-[24px] md:text-[26px]",
  desc: "text-[12px] md:text-[13px]",
  detail: "text-[11px] md:text-[12px]",
  detailIcon: "text-[13px] md:text-[14px]",
  badge: "px-2 py-1 md:px-2.5 md:py-1.5",
  badgeText: "text-[12px] md:text-[13px]",
  badgeSlash: "text-[10px] md:text-[11px]",
};

export default function WeekForecast({ forecast }: { forecast: WeatherForecast }) {
  return (
    <div
      id="prakiraan-3-hari"
      className="bg-white rounded-[16px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] h-full flex flex-col"
    >
      <h3 className="font-body-sans text-[20px] font-semibold text-text-dark mb-1">
        Prakiraan 3 Hari
      </h3>
      <p className="text-[11px] text-text-muted font-body-sans mb-5">
        Ringkasan cuaca harian berdasarkan data per 3 jam dari BMKG. Suhu, kelembapan, angin, dan tutupan awan ditampilkan dalam rentang 24 jam. Data diperbarui mengikuti jadwal pembaruan resmi BMKG.
      </p>

      <div className="divide-y divide-outline-variant/20 space-y-3 md:space-y-4 flex-grow flex flex-col justify-center">
        {forecast.days.map((day, idx) => {
          const { min, max } = tempRange(day.points);
          const hum = avgH(day.points);
          const dom = dominantWeather(day.points);
          const wind = maxWind(day.points);
          const cloud = maxCloud(day.points);
          const rain = rainChance(day.points);
          const windDir = dominantWindDir(day.points);
          const vis = minVisibility(day.points);
          const icon = gi(dom);
          const color = gc(dom);

          return (
            <div
              key={day.date}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3 ${sz.row} rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer`}
            >
              {/* ── Left: label + weather icon + desc ── */}
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <span
                  className={`${sz.label} font-medium ${sz.labelW} shrink-0 font-body-sans ${idx === 0 ? "text-primary-container font-bold" : "text-text-dark"
                    }`}
                >
                  {day.label}
                </span>
                <span className={`material-symbols-outlined ${sz.icon} ${color}`}>
                  {icon}
                </span>
                <span className={`${sz.desc} text-on-surface-variant font-body-sans truncate`}>
                  {dom}
                </span>
              </div>

              {/* ── Center: detail ── */}
              <div className={`flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-0.5 ${sz.detail} font-body-sans text-on-surface-variant`}>
                <span className="font-semibold text-text-dark">
                  {min}° – {max}°
                </span>

                {rain > 0 && (
                  <span className="flex items-center gap-0.5" title={`Peluang hujan ${rain}%`}>
                    <span className={`material-symbols-outlined ${sz.detailIcon} text-sky-500`}>rainy</span>
                    {rain}%
                  </span>
                )}

                {wind != null && (
                  <span className="flex items-center gap-0.5" title={`Angin ${windLabel(wind)}${windDir ? `, arah ${windDir}` : ""}`}>
                    <span className={`material-symbols-outlined ${sz.detailIcon} text-text-muted`}>air</span>
                    {wind} km/h
                    {windDir && <span className="text-[9px] opacity-60 ml-0.5">{windDir}</span>}
                  </span>
                )}

                {cloud != null && (
                  <span className="flex items-center gap-0.5" title={cloudLabel(cloud)}>
                    <span className={`material-symbols-outlined ${sz.detailIcon} text-text-muted`}>cloud</span>
                    {cloud}%
                  </span>
                )}

                <span className="flex items-center gap-0.5">
                  <span className={`material-symbols-outlined ${sz.detailIcon} text-primary-container`}>water_drop</span>
                  {hum}%
                </span>

                {vis && (
                  <span className="flex items-center gap-0.5" title="Jarak pandang">
                    <span className={`material-symbols-outlined ${sz.detailIcon} text-text-muted`}>visibility</span>
                    {vis}
                  </span>
                )}
              </div>

              {/* ── Right: hi/lo temp badge ── */}
              <div className="flex items-center shrink-0">
                <div className={`flex items-center gap-1 ${sz.badge} rounded-full bg-primary-container/10`}>
                  <span className={`${sz.badgeText} font-bold text-primary-container`}>{max}°</span>
                  <span className={`${sz.badgeSlash} text-text-muted`}>/</span>
                  <span className={`${sz.badgeText} text-text-muted`}>{min}°</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Summary footer ── */}
      <div className="mt-6 pt-4 border-t border-outline-variant/30 flex flex-wrap items-center gap-3 text-[11px] text-text-muted font-body-sans">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-text-muted">info</span>
          Data ditampilkan berdasarkan prakiraan BMKG per 3 jam.
        </span>
      </div>
    </div>
  );
}
