"use client";
import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";

export default function TrendChart({ forecast }: { forecast: WeatherForecast }) {
  const today = forecast.days[0];
  const tomorrow = forecast.days[1];
  if (!today || today.points.length === 0) return null;

  const points = today.points.concat(tomorrow?.points ?? []);
  const n = points.length;

  const temps = points.map((p) => p.temperatureC ?? 25);
  const hums = points.map((p) => p.humidityPct ?? 70);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const tPad = 2;
  const tMin = minT - tPad;
  const tMax = maxT + tPad;
  const tRange = Math.max(tMax - tMin, 4);

  // ── Layout — fixed internal coordinates, responsive via viewBox ──
  const W = 1000;
  const H = 260;            // taller to fit labels + time
  const PAD_T = 18;
  const PAD_B = 48;         // room for time labels below
  const PAD_X = 10;
  const PLOT_H = H - PAD_T - PAD_B;

  const toY = (v: number, min: number, r: number) =>
    PAD_T + PLOT_H - ((v - min) / r) * PLOT_H;

  const xS = (i: number) => {
    if (n <= 1) return W / 2;
    return PAD_X + (i / (n - 1)) * (W - 2 * PAD_X);
  };

  const tPath = points
    .map((_, i) => `${i === 0 ? "M" : "L"}${xS(i)},${toY(temps[i], tMin, tRange)}`)
    .join(" ");
  const hPath = points
    .map((_, i) => `${i === 0 ? "M" : "L"}${xS(i)},${toY(hums[i], 40, 50)}`)
    .join(" ");

  const labelStep = Math.max(1, Math.floor(n / 6));
  const tl = points.filter((_, i) => i % labelStep === 0 || i === n - 1);

  return (
    <div className="w-full bg-white rounded-[16px] p-4 sm:p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4">
        <h3 className="font-body-sans text-[16px] sm:text-[18px] font-semibold text-text-dark">
          Tren Cuaca 24 Jam
        </h3>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-[12px] font-body-sans text-on-surface-variant font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-container" /> Suhu
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#FDE047]" /> Kelembapan
          </div>
        </div>
      </div>

      {/* ── Scrollable wrapper for mobile ── */}
      <div className="overflow-x-auto -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 md:max-w-1xl md:mx-auto">
        <svg
          className="block"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: "100%", minWidth: "auto", height: "auto" }}
          role="img"
          aria-label="Grafik tren suhu dan kelembapan 24 jam"
        >
          <defs>
            <linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5a22" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ff5a22" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ── Temperature area fill ──────────────────── */}
          <path
            d={`${tPath} L${xS(n - 1)},${PAD_T + PLOT_H} L${xS(0)},${PAD_T + PLOT_H} Z`}
            fill="url(#tg2)"
          />

          {/* ── Temperature line ───────────────────────── */}
          <path
            d={tPath}
            fill="none"
            stroke="#ff5a22"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* ── Humidity line ──────────────────────────── */}
          <path
            d={hPath}
            fill="none"
            stroke="#FDE047"
            strokeWidth="2"
            strokeDasharray="8 8"
            strokeLinecap="round"
          />

          {/* ── Temperature dots + labels ────────────────── */}
          {points.map((_, i) => {
            if (n > 12 && i % 2 !== 0) return null;
            const tY = toY(temps[i], tMin, tRange);
            const cx = xS(i);
            return (
              <g key={`t${i}`}>
                <circle cx={cx} cy={tY} r="5" fill="#ff5a22" />
                <text
                  x={cx}
                  y={tY - 10}
                  textAnchor="middle"
                  fill="#ff5a22"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                >
                  {Math.round(temps[i])}°
                </text>
              </g>
            );
          })}

          {/* ── Humidity dots + labels ──────────────────── */}
          {points.map((_, i) => {
            if (n > 12 && i % 2 !== 0) return null;
            const hY = toY(hums[i], 40, 50);
            const cx = xS(i);
            return (
              <g key={`h${i}`}>
                <circle cx={cx} cy={hY} r="4" fill="#FDE047" />
                <text
                  x={cx}
                  y={hY - 8}
                  textAnchor="middle"
                  fill="#8B7500"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                >
                  {Math.round(hums[i])}%
                </text>
              </g>
            );
          })}

          {/* ── X-axis time labels (inside SVG, scroll with chart) ── */}
          {tl.map((p, i) => (
            <text
              key={`tl${i}`}
              x={xS(points.indexOf(p))}
              y={H - 8}
              textAnchor="middle"
              fill="#6B7280"
              fontSize="12"
              fontWeight="500"
              fontFamily="Inter, sans-serif"
            >
              {formatTime(p.localDateTime)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
