"use client";

/**
 * Wind Direction Visual — kompas panah berputar sesuai arah angin.
 * Data windDirection dari BMKG berupa kode 2-3 huruf (N, NE, E, SE, S, SW, W, NW).
 */

import { useMemo } from "react";

const DIRECTION_MAP: Record<string, number> = {
  N: 0, U: 0, // Utara
  NNE: 22.5,
  NE: 45, TL: 45, // Timur Laut
  ENE: 67.5,
  E: 90, T: 90, // Timur
  ESE: 112.5,
  SE: 135, TG: 135, // Tenggara
  SSE: 157.5,
  S: 180, // Selatan
  SSW: 202.5,
  SW: 225, BD: 225, // Barat Daya
  WSW: 247.5,
  W: 270, B: 270, // Barat
  WNW: 292.5,
  NW: 315, BL: 315, // Barat Laut
  NNW: 337.5,
};

const DIRECTION_LABEL: Record<string, string> = {
  N: "Utara", NNE: "Utara Timur Laut", NE: "Timur Laut", ENE: "Timur Timur Laut",
  E: "Timur", ESE: "Timur Tenggara", SE: "Tenggara", SSE: "Selatan Tenggara",
  S: "Selatan", SSW: "Selatan Barat Daya", SW: "Barat Daya", WSW: "Barat Barat Daya",
  W: "Barat", WNW: "Barat Barat Laut", NW: "Barat Laut", NNW: "Utara Barat Laut",
};

interface WindDirectionProps {
  windDirection: string | null;
  windSpeedKmh: number | null;
  /** Size variant: sm=48px, md=64px, lg=96px */
  size?: "sm" | "md" | "lg";
}

function getBeaufortLabel(speed: number | null): string {
  if (speed === null) return "—";
  if (speed < 1) return "Tenang";
  if (speed < 6) return "Angin Sepoi-sepoi";
  if (speed < 12) return "Angin Sedang";
  if (speed < 20) return "Angin Kencang";
  if (speed < 29) return "Angin Kuat";
  if (speed < 39) return "Angin Sangat Kuat";
  if (speed < 50) return "Badai";
  return "Badai Dahsyat";
}

function getBeaufortColor(speed: number | null): string {
  if (speed === null) return "text-gray-400";
  if (speed < 6) return "text-green-500";
  if (speed < 20) return "text-yellow-500";
  if (speed < 39) return "text-orange-500";
  return "text-red-500";
}

export default function WindDirection({ windDirection, windSpeedKmh, size = "md" }: WindDirectionProps) {
  const degrees = useMemo(() => {
    if (!windDirection) return null;
    const dir = windDirection.trim().toUpperCase();
    return DIRECTION_MAP[dir] ?? null;
  }, [windDirection]);

  const label = useMemo(() => {
    if (!windDirection) return null;
    const dir = windDirection.trim().toUpperCase();
    return DIRECTION_LABEL[dir] ?? dir;
  }, [windDirection]);

  const dim = size === "sm" ? 48 : size === "lg" ? 96 : 64;
  const strokeW = size === "sm" ? 2 : 3;
  const fontSize = size === "sm" ? 9 : size === "lg" ? 13 : 11;

  return (
    <div className="flex items-center gap-3">
      {/* ── Kompas ── */}
      <div className="relative shrink-0" style={{ width: dim, height: dim }}>
        {/* Lingkaran luar */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Ring luar */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-gray-200" />

          {/* Crosshair N-S-E-W */}
          <line x1="50" y1="4" x2="50" y2="96" stroke="currentColor" strokeWidth={0.8} className="text-gray-300" opacity={0.6} />
          <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeWidth={0.8} className="text-gray-300" opacity={0.6} />

          {/* Label N S E W */}
          <text x="50" y="8" textAnchor="middle" fontSize={fontSize} fontWeight="bold" fill="currentColor" className="text-red-500">N</text>
          <text x="50" y="96" textAnchor="middle" fontSize={fontSize} fontWeight="bold" fill="currentColor" className="text-gray-400">S</text>
          <text x="98" y="53" textAnchor="end" fontSize={fontSize} fontWeight="bold" fill="currentColor" className="text-gray-400">E</text>
          <text x="2" y="53" textAnchor="start" fontSize={fontSize} fontWeight="bold" fill="currentColor" className="text-gray-400">W</text>

          {/* Panah arah angin */}
          {degrees !== null && (
            <g
              transform={`rotate(${degrees}, 50, 50)`}
              style={{ transition: "transform 0.6s ease-out, fill 0.3s" }}
            >
              {/* Badan panah */}
              <polygon points="50,5 44,45 56,45" fill="currentColor" className="text-primary-container" />
              <polygon points="50,95 44,55 56,55" fill="currentColor" className="text-gray-300" />
              {/* Lingkaran pusat */}
              <circle cx="50" cy="50" r="5" fill="white" stroke="currentColor" strokeWidth={1.5} className="text-gray-400" />
            </g>
          )}

          {/* Fallback ketika tidak ada data */}
          {degrees === null && (
            <g opacity={0.3}>
              <polygon points="50,15 46,45 54,45" fill="currentColor" className="text-gray-400" />
              <polygon points="50,85 46,55 54,55" fill="currentColor" className="text-gray-400" />
              <circle cx="50" cy="50" r="5" fill="white" stroke="currentColor" strokeWidth={1.5} className="text-gray-400" />
            </g>
          )}
        </svg>
      </div>

      {/* ── Info ── */}
      <div className="min-w-0">
        {windSpeedKmh !== null && (
          <p className={`font-body-sans text-[${size === "lg" ? 16 : 14}]px font-bold ${getBeaufortColor(windSpeedKmh)}`}>
            {Math.round(windSpeedKmh)} km/j
          </p>
        )}
        {label && (
          <p className="font-body-sans text-[13px] text-text-dark font-semibold">{label}</p>
        )}
        {windSpeedKmh !== null && (
          <p className={`font-body-sans text-[11px] ${getBeaufortColor(windSpeedKmh)}`}>
            {getBeaufortLabel(windSpeedKmh)}
          </p>
        )}
      </div>
    </div>
  );
}
