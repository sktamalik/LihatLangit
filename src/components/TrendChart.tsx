"use client";
import { useState } from "react";
import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";

/** Generate smooth Catmull-Rom spline SVG path from points */
function smoothPath(xCoords: number[], yCoords: number[]): string {
  const n = xCoords.length;
  if (n === 0) return "";
  if (n === 1) return `M${xCoords[0]},${yCoords[0]}`;
  if (n === 2) return `M${xCoords[0]},${yCoords[0]} L${xCoords[1]},${yCoords[1]}`;

  let path = `M${xCoords[0]},${yCoords[0]}`;

  for (let i = 0; i < n - 1; i++) {
    // Get 4 points for Catmull-Rom
    const p0 = i > 0 ? i - 1 : 0;
    const p1 = i;
    const p2 = i + 1;
    const p3 = i < n - 2 ? i + 2 : n - 1;

    // Calculate control points using standard Catmull-Rom formula
    const cp1x = xCoords[p1] + (xCoords[p2] - xCoords[p0]) / 6;
    const cp1y = yCoords[p1] + (yCoords[p2] - yCoords[p0]) / 6;
    const cp2x = xCoords[p2] - (xCoords[p3] - xCoords[p1]) / 6;
    const cp2y = yCoords[p2] - (yCoords[p3] - yCoords[p1]) / 6;

    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${xCoords[p2]},${yCoords[p2]}`;
  }

  return path;
}

export default function TrendChart({ forecast }: { forecast: WeatherForecast }) {
  const [showTemp, setShowTemp] = useState(true);
  const [showHum, setShowHum] = useState(true);

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
  const PAD_LEFT = 20;      // padding kiri agar grafik tidak menempel tepi card
  const PAD_RIGHT = 30;     // padding kanan agar grafik tidak menempel tepi card
  const PLOT_H = H - PAD_T - PAD_B;

  const toY = (v: number, min: number, r: number) =>
    PAD_T + PLOT_H - ((v - min) / r) * PLOT_H;

  const xS = (i: number) => {
    if (n <= 1) return W / 2;
    return PAD_LEFT + (i / (n - 1)) * (W - PAD_LEFT - PAD_RIGHT);
  };

  const tempXCoords = temps.map((_, i) => xS(i));
  const tempYCoords = temps.map((t) => toY(t, tMin, tRange));
  const humXCoords = hums.map((_, i) => xS(i));
  const humYCoords = hums.map((h) => toY(h, 40, 50));

  const tPath = smoothPath(tempXCoords, tempYCoords);
  const hPath = smoothPath(humXCoords, humYCoords);

  const labelStep = Math.max(1, Math.floor(n / 6));
  const tl = points.filter((_, i) => i % labelStep === 0 || i === n - 1);

  return (
    <div className="w-full bg-white rounded-[16px] p-4 sm:p-5 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4">
        <h3 className="font-body-sans text-[16px] sm:text-[18px] font-semibold text-text-dark">
          Tren Cuaca 24 Jam
        </h3>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-[12px] font-body-sans font-medium">
          <button
            onClick={() => setShowTemp(!showTemp)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${showTemp
                ? "bg-primary-container/10 text-primary-container"
                : "bg-gray-100 text-gray-400 line-through"
              }`}
          >
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-opacity ${showTemp ? "bg-primary-container opacity-100" : "bg-gray-300 opacity-50"}`} /> Suhu
          </button>
          <button
            onClick={() => setShowHum(!showHum)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all cursor-pointer ${showHum
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-400 line-through"
              }`}
          >
            <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-opacity ${showHum ? "bg-[#FDE047] opacity-100" : "bg-gray-300 opacity-50"}`} /> Kelembapan
          </button>
        </div>
      </div>

      {/* ── Scrollable wrapper for mobile ── */}
      <div className="overflow-x-auto">
        <svg
          className="block"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: Math.max(W, n * 100), height: "auto", minWidth: "100%" }}
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
          {showTemp && (
            <path
              d={`${tPath} L${xS(n - 1)},${PAD_T + PLOT_H} L${xS(0)},${PAD_T + PLOT_H} Z`}
              fill="url(#tg2)"
            />
          )}

          {/* ── Temperature line ───────────────────────── */}
          {showTemp && (
            <path
              d={tPath}
              fill="none"
              stroke="#ff5a22"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* ── Humidity line ──────────────────────────── */}
          {showHum && (
            <path
              d={hPath}
              fill="none"
              stroke="#FDE047"
              strokeWidth="2"
              strokeDasharray="8 8"
              strokeLinecap="round"
            />
          )}

          {/* ── Temperature dots + labels ────────────────── */}
          {showTemp && points.map((_, i) => {
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
          {showHum && points.map((_, i) => {
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
