/**
 * Sun & Moon timeline — calculated from location and date.
 */

"use client";

import type { WeatherForecast } from "@/types/weather";
import { getSunTimes, getMoonPhase } from "@/lib/envCalculations";

interface SunMoonProps {
  forecast: WeatherForecast;
}

export default function SunMoon({ forecast }: SunMoonProps) {
  const now = new Date();
  const sun = getSunTimes(now, forecast.region.latitude, forecast.region.longitude);
  const moon = getMoonPhase(now);

  return (
    <div className="weather-card rounded-3xl p-card-padding sky-shadow flex flex-col flex-grow">
      <h2 className="font-geist text-[18px] font-semibold text-primary mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">brightness_low</span> Matahari & Bulan
      </h2>
      <div className="flex flex-col gap-2">
        <SunRow icon="wb_sunny" color="text-sun-accent" label="Terbit" value={sun.sunrise} />
        <SunRow icon="wb_twilight" color="text-orange-500" label="Terbenam" value={sun.sunset} />
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-indigo-400">{moon.icon}</span>
            <span className="text-[13px] text-on-surface">Bulan</span>
          </div>
          <div className="text-right">
            <div className="text-[13px] font-bold text-on-surface">{moon.phase}</div>
            <div className="text-[10px] text-outline">{moon.illumination}% Iluminasi</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SunRow({ icon, color, label, value }: { icon: string; color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-outline-variant/20">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined ${color} text-[18px]`}>{icon}</span>
        <span className="text-[13px] text-on-surface">{label}</span>
      </div>
      <span className="text-[13px] font-bold text-on-surface">{value}</span>
    </div>
  );
}
