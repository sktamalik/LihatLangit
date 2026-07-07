"use client";
import type { WeatherForecast } from "@/types/weather";

function getWeatherTheme(desc: string) {
  const d = desc.toLowerCase();
  if (d.includes("hujan")) return { gradient: "from-sky-100 via-blue-50 to-indigo-100", icon: "rainy", color: "text-blue-500", accent: "bg-blue-500/10" };
  if (d.includes("awan")) return { gradient: "from-slate-100 via-gray-50 to-slate-100", icon: "cloud", color: "text-slate-500", accent: "bg-slate-500/10" };
  if (d.includes("petir")) return { gradient: "from-purple-100 via-violet-50 to-indigo-100", icon: "thunderstorm", color: "text-purple-600", accent: "bg-purple-500/10" };
  return { gradient: "from-amber-50 via-orange-50 to-yellow-50", icon: "clear_day", color: "text-amber-500", accent: "bg-amber-500/10" };
}

export default function WeatherSummary({ forecast }: { forecast: WeatherForecast }) {
  const { region, nearestPoint, days } = forecast;
  const c = nearestPoint ?? days[0]?.points[0];
  const theme = getWeatherTheme(c?.weatherDescription ?? "");

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
              <p className="font-body-sans text-[14px] text-text-dark font-semibold">{region.city}</p>
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-white/60 backdrop-blur-sm">
            <span className="font-body-sans text-[10px] text-text-muted font-medium">{c?.localDateTime ? new Date(c.localDateTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "--:--"}</span>
          </div>
        </div>

        {/* Temperature hero */}
        <div className="flex items-center gap-4 mb-4">
          <span className={`material-symbols-outlined text-[64px] ${theme.color} drop-shadow-sm`}>{theme.icon}</span>
          <div>
            <h2 className="font-body-sans text-[56px] font-bold text-text-dark leading-none tracking-tighter">
              {c?.temperatureC !== null ? `${Math.round(c!.temperatureC)}` : "--"}
              <span className="text-[22px] font-semibold text-text-muted ml-0.5">°C</span>
            </h2>
            <p className={`font-body-sans text-[14px] ${theme.color} font-bold uppercase tracking-wide`}>
              {c?.weatherDescription ?? "—"}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/50 my-4" />

        {/* Metrics grid - flex-grow to fill available space */}
        <div className="grid grid-cols-2 gap-4 w-full flex-grow">
          <div className="flex items-center gap-3 bg-white/40 rounded-xl px-3 py-2.5">
            <span className="material-symbols-outlined text-[20px] text-blue-500">humidity_percentage</span>
            <div>
              <p className="font-body-sans text-[10px] text-text-muted font-medium">Kelembapan</p>
              <p className="font-body-sans text-[14px] font-bold text-text-dark">{c?.humidityPct !== null ? `${c!.humidityPct}%` : "--"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/40 rounded-xl px-3 py-2.5">
            <span className="material-symbols-outlined text-[20px] text-teal-500">air</span>
            <div>
              <p className="font-body-sans text-[10px] text-text-muted font-medium">Angin</p>
              <p className="font-body-sans text-[14px] font-bold text-text-dark">{c?.windSpeedKmh !== null ? `${c!.windSpeedKmh} km/h` : "--"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/40 rounded-xl px-3 py-2.5">
            <span className="material-symbols-outlined text-[20px] text-violet-500">visibility</span>
            <div>
              <p className="font-body-sans text-[10px] text-text-muted font-medium">Jarak Pandang</p>
              <p className="font-body-sans text-[14px] font-bold text-text-dark">{c?.visibilityText ?? "--"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/40 rounded-xl px-3 py-2.5">
            <span className="material-symbols-outlined text-[20px] text-emerald-500">near_me</span>
            <div>
              <p className="font-body-sans text-[10px] text-text-muted font-medium">Arah Angin</p>
              <p className="font-body-sans text-[14px] font-bold text-text-dark">{c?.windDirection ?? "--"}</p>
            </div>
          </div>
        </div>

        {/* Additional info section */}
        <div className="mt-4 pt-4 border-t border-white/30">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-text-muted font-body-sans">Terasa seperti</span>
            <span className="font-body-sans font-bold text-text-dark">{c?.temperatureC !== null ? `${Math.round(c!.temperatureC - 2)}°C` : "--"}</span>
          </div>
          <div className="flex items-center justify-between text-[12px] mt-2">
            <span className="text-text-muted font-body-sans">Tekanan udara</span>
            <span className="font-body-sans font-bold text-text-dark">1013 hPa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
