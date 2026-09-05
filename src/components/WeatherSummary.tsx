"use client";
import { useState } from "react";
import type { WeatherForecast } from "@/types/weather";
import WindDirection from "@/components/WindDirection";
import { useWarnings } from "@/lib/useWarnings";

function calcFeelsLike(tempC: number, rh: number): number {
  // Heat Index (Rothfusz regression) for temp ≥ 27°C
  // Below 27°C, feels-like ≈ actual temp (dew-point-based feels fine)
  if (tempC < 27 || rh < 40) return tempC;
  // Not safe above 56°C index — clamp input, shouldn't hit on Earth
  if (tempC > 50) return tempC;
  // Convert to Fahrenheit, Rothfusz regression
  const T = tempC * 9 / 5 + 32;
  const HI = -42.379 + 2.04901523 * T + 10.14333127 * rh
    - 0.22475541 * T * rh - 0.00683783 * T * T - 0.05481717 * rh * rh
    + 0.00122874 * T * T * rh + 0.00085282 * T * rh * rh
    - 0.00000199 * T * T * rh * rh;
  return Math.round(((HI - 32) * 5 / 9) * 10) / 10;
}

function getWeatherTheme(desc: string) {
  const d = desc.toLowerCase();
  if (d.includes("hujan")) return { gradient: "from-sky-100 via-blue-50 to-indigo-100", icon: "rainy", color: "text-blue-500", accent: "bg-blue-500/10" };
  if (d.includes("awan")) return { gradient: "from-slate-100 via-gray-50 to-slate-100", icon: "cloud", color: "text-slate-500", accent: "bg-slate-500/10" };
  if (d.includes("petir")) return { gradient: "from-purple-100 via-violet-50 to-indigo-100", icon: "thunderstorm", color: "text-purple-600", accent: "bg-purple-500/10" };
  return { gradient: "from-amber-50 via-orange-50 to-yellow-50", icon: "clear_day", color: "text-amber-500", accent: "bg-amber-500/10" };
}

export default function WeatherSummary({ forecast }: { forecast: WeatherForecast }) {
  const [copied, setCopied] = useState(false);
  const { region, nearestPoint, days } = forecast;
  const { matchedWarning } = useWarnings(region);
  const c = nearestPoint ?? days[0]?.points[0];
  const theme = getWeatherTheme(c?.weatherDescription ?? "");

  const handleShare = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("adm4", region.adm4);
    url.searchParams.delete("q");
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-gradient-to-br ${theme.gradient} rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex flex-col h-full relative overflow-hidden`}>
      {/* Decorative background circle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/30 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/20 blur-xl" />

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Location badge */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${theme.accent} flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-[22px] ${theme.color}`}>{theme.icon}</span>
            </div>
            <div>
              <p className="font-body-sans text-[11px] text-text-muted font-medium uppercase tracking-wider">Cuaca Saat Ini</p>
              <p className="font-body-sans text-[14px] text-text-dark font-semibold">{region.village ? `${region.village}, ${region.city}` : region.city}</p>
              {forecast.fallbackFrom && forecast.fallbackFrom !== region.village && (
                <p className="font-body-sans text-[11px] text-primary flex items-center gap-0.5 mt-0.5 font-medium">
                  <span className="material-symbols-outlined text-[13px]">near_me</span>
                  Data stasiun terdekat: {forecast.fallbackFrom}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Salin tautan cuaca wilayah ini"
              className="px-2.5 py-1 rounded-full bg-white/60 hover:bg-white text-text-dark backdrop-blur-sm transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            >
              <span className="material-symbols-outlined text-[14px]">{copied ? "check" : "share"}</span>
              <span>{copied ? "Tersalin" : "Bagikan"}</span>
            </button>
            <div className="px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-sm">
              <span className="font-body-sans text-[10px] text-text-muted font-medium">{c?.localDateTime ? new Date(c.localDateTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</span>
            </div>
          </div>
        </div>

        {/* Temperature hero */}
        <div className="flex items-center gap-4 mb-4">
          <span className={`material-symbols-outlined text-[64px] ${theme.color} drop-shadow-sm`}>{theme.icon}</span>
          <div>
            <h2 className="font-body-sans text-[56px] font-bold text-text-dark leading-none tracking-tighter">
              {c?.temperatureC != null ? `${Math.round(c.temperatureC)}` : "--"}
              <span className="text-[22px] font-semibold text-text-muted ml-0.5">°C</span>
            </h2>
            {c?.temperatureC != null && c?.humidityPct != null && (
              <p className="font-body-sans text-[13px] text-text-muted mt-1">
                Terasa{" "}
                <span className="font-semibold text-text-dark">
                  {Math.round(calcFeelsLike(c.temperatureC, c.humidityPct))}°C
                </span>
              </p>
            )}
            <p className={`font-body-sans text-[14px] ${theme.color} font-bold uppercase tracking-wide`}>
              {c?.weatherDescription ?? "—"}
            </p>
          </div>
        </div>

        {/* Peringatan Dini Cuaca BMKG Kontekstual */}
        {matchedWarning && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-950 flex items-start gap-2.5 shadow-xs">
            <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
              warning
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-[11px] text-amber-900 uppercase tracking-wider">
                    Peringatan Dini BMKG
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-200/80 text-amber-900">
                    {matchedWarning.matchLevel === "district"
                      ? "Wilayah Kecamatan"
                      : matchedWarning.matchLevel === "city"
                      ? "Kota / Kabupaten"
                      : "Provinsi"}
                  </span>
                </div>
                <a
                  href="#peringatan-dini"
                  className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold underline shrink-0 whitespace-nowrap"
                >
                  Detail ↗
                </a>
              </div>
              <p className="text-[12px] text-amber-950/90 font-medium mt-1 leading-snug">
                {matchedWarning.warning.title}
              </p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-white/50 my-4" />

        {/* Metrics grid - flex-grow to fill available space */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full flex-grow">
          <div className="flex items-center gap-3 bg-white/40 rounded-xl px-3 py-2.5">
            <span className="material-symbols-outlined text-[20px] text-blue-500">humidity_percentage</span>
            <div>
              <p className="font-body-sans text-[10px] text-text-muted font-medium">Kelembapan</p>
              <p className="font-body-sans text-[14px] font-bold text-text-dark">{c?.humidityPct != null ? `${c.humidityPct}%` : "--"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/40 rounded-xl px-3 py-2.5">
            <span className="material-symbols-outlined text-[20px] text-violet-500">visibility</span>
            <div>
              <p className="font-body-sans text-[10px] text-text-muted font-medium">Jarak Pandang</p>
              <p className="font-body-sans text-[14px] font-bold text-text-dark">{c?.visibilityText ?? "--"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/40 rounded-xl px-2.5 py-2">
            <WindDirection windDirection={c?.windDirection ?? null} windSpeedKmh={c?.windSpeedKmh ?? null} size="sm" />
            <div className="min-w-0">
              <p className="font-body-sans text-[10px] text-text-muted font-medium">Angin</p>
              <p className="font-body-sans text-[12px] font-bold text-text-dark">{c?.windSpeedKmh != null ? `${Math.round(c.windSpeedKmh)} km/h` : "--"}</p>
            </div>
          </div>
        </div>

        {/* Additional info section */}
        <div className="mt-4 pt-4 border-t border-white/30">
          <div className="flex items-center justify-between text-[12px] mt-2">
            <span className="text-text-muted font-body-sans">Tutupan awan</span>
            <span className="font-body-sans font-bold text-text-dark">{c?.cloudCoverPct != null ? `${c.cloudCoverPct}%` : "--"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
