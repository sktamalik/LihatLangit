/**
 * Interactive weather trends chart (24h temperature & humidity).
 */

"use client";

import type { WeatherForecast } from "@/types/weather";

interface TrendChartProps {
  forecast: WeatherForecast;
}

export default function TrendChart({ forecast }: TrendChartProps) {
  const today = forecast.days[0];
  if (!today || today.points.length === 0) return null;

  const temps = today.points.map((p) => p.temperatureC ?? 25);
  const hums = today.points.map((p) => p.humidityPct ?? 70);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const rangeT = Math.max(maxT - minT, 1);

  const makePath = (vals: number[], offset: number, scale: number) =>
    vals
      .map((v, i) => {
        const x = (i / (vals.length - 1)) * 1000;
        const y = 160 - ((v - offset) / scale) * 100;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");

  const tempPath = makePath(temps, minT - 1, rangeT + 2);
  const humPath = makePath(hums, 50, 40);

  return (
    <section className="glass-panel rounded-3xl p-card-padding sky-shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-geist text-headline-md font-semibold text-primary">Tren Cuaca 24 Jam</h2>
        <div className="flex gap-4 font-label-sm text-xs">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary-container"></span> Suhu</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sun-accent"></span> Kelembapan</div>
        </div>
      </div>
      <div className="w-full h-[180px] relative overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 180">
          <defs>
            <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path className="trend-area" d={`${tempPath} L1000,180 L0,180 Z`} />
          <path className="trend-line" d={tempPath} />
          <path className="trend-line-alt" d={humPath} />
        </svg>
        <div className="absolute bottom-0 w-full flex justify-between px-2 pb-1 text-outline font-label-sm text-[10px]">
          {today.points.filter((_, i) => i % Math.max(1, Math.floor(today.points.length / 5)) === 0).map((p, i) => (
            <span key={i}>{p.localDateTime.slice(11, 16)}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
