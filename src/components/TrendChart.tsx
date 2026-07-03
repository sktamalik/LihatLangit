/**
 * Interactive weather trends chart (24h temperature & humidity).
 * Fixed: proper SVG rendering, correct axis labels, responsive design.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";

interface TrendChartProps {
  forecast: WeatherForecast;
}

export default function TrendChart({ forecast }: TrendChartProps) {
  const today = forecast.days[0];
  if (!today || today.points.length === 0) return null;

  const points = today.points;
  const n = points.length;

  // Extract values with defaults
  const temps: number[] = [];
  const hums: number[] = [];
  for (const p of points) {
    temps.push(p.temperatureC ?? 25);
    hums.push(p.humidityPct ?? 70);
  }

  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const rangeT = Math.max(maxT - minT, 1);

  // SVG dimensions
  const W = 1000;
  const H = 180;
  const PAD = 10; // vertical padding

  // Map value to SVG Y coordinate
  const toY = (val: number, min: number, range: number): number => {
    return H - PAD - ((val - min) / range) * (H - 2 * PAD);
  };

  const tempMin = minT - 1;
  const tempRange = rangeT + 2;
  const humMin = 40;
  const humRange = 50;

  const tempPath = points
    .map((_, i) => {
      const x = (i / (n - 1)) * W;
      const y = toY(temps[i], tempMin, tempRange);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const humPath = points
    .map((_, i) => {
      const x = (i / (n - 1)) * W;
      const y = toY(hums[i], humMin, humRange);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  // Time labels: show 5 evenly spaced labels
  const labelInterval = Math.max(1, Math.floor(n / 5));
  const timeLabels = points.filter((_, i) => i % labelInterval === 0 || i === n - 1);

  return (
    <section className="glass-panel rounded-3xl p-card-padding sky-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="font-geist text-headline-md font-semibold text-primary">Tren Cuaca 24 Jam</h2>
        <div className="flex gap-4 font-label-sm text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0ea5e9]"></span> Suhu
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#f59e0b]"></span> Kelembapan
          </div>
        </div>
      </div>

      <div className="w-full h-[200px] relative overflow-hidden">
        <svg
          className="w-full h-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${W} ${H}`}
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Temperature area */}
          <path
            d={`${tempPath} L${W},${H} L0,${H} Z`}
            fill="url(#trend-gradient)"
          />

          {/* Temperature line */}
          <path
            d={tempPath}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Humidity line */}
          <path
            d={humPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {points.map((_, i) => {
            const x = (i / (n - 1)) * W;
            const yTemp = toY(temps[i], tempMin, tempRange);
            return (
              <circle
                key={`t${i}`}
                cx={x}
                cy={yTemp}
                r="3"
                fill="#0ea5e9"
                className="hover:r-5"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-1 text-outline font-label-sm text-[10px] pointer-events-none">
          {timeLabels.map((p, i) => (
            <span key={i}>{formatTime(p.localDateTime)}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
