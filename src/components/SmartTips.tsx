/**
 * Smart daily recommendations based on weather.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";

interface SmartTipsProps {
  forecast: WeatherForecast;
}

export default function SmartTips({ forecast }: SmartTipsProps) {
  const point = forecast.nearestPoint ?? forecast.days[0]?.points[0];
  const temp = point?.temperatureC ?? 30;
  const isHot = temp > 30;
  const isRainy = point?.weatherDescription.toLowerCase().includes("hujan");
  const isHumid = (point?.humidityPct ?? 70) > 75;

  return (
    <div className="weather-card rounded-3xl p-card-padding sky-shadow flex flex-col">
      <h2 className="font-geist text-[20px] font-semibold text-primary mb-4">Rekomendasi Pintar</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TipCard
          icon="directions_run"
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          title="Kesehatan"
          desc={isHot ? "Hindari outdoor siang hari, suhu tinggi." : "Waktu tepat untuk olahraga outdoor."}
          highlight={isHot}
        />
        <TipCard
          icon="laundry"
          iconBg="bg-green-100"
          iconColor="text-green-600"
          title="Rumah"
          desc={isRainy ? "Jangan jemur pakaian, hujan turun." : "Cocok untuk menjemur pakaian hari ini."}
          highlight={isRainy}
        />
        <TipCard
          icon="umbrella"
          iconBg="bg-orange-200"
          iconColor="text-orange-600"
          title="Aktivitas"
          desc={isRainy ? "Siapkan payung jika keluar rumah." : isHumid ? "Cuaca cukup lembap hari ini." : "Cuaca cerah, nikmati hari Anda!"}
          highlight={isRainy}
        />
      </div>
    </div>
  );
}

function TipCard({
  icon,
  iconBg,
  iconColor,
  title,
  desc,
  highlight,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center text-center p-4 rounded-2xl transition-colors ${
      highlight ? "bg-orange-50 border border-orange-100" : "bg-white/50 border border-white/60 hover:bg-white/80"
    }`}>
      <div className={`w-12 h-12 rounded-full ${iconBg} ${iconColor} flex items-center justify-center mb-3`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h3 className="font-label-sm font-semibold mb-1">{title}</h3>
      <p className="text-sm text-on-surface">{desc}</p>
    </div>
  );
}
