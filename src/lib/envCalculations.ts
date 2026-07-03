/**
 * Environmental calculations for dashboard widgets.
 * All calculations based on weather data inputs and date/time.
 */

/** Estimate AQI from humidity and temperature (simplified model) */
export function estimateAQI(temperatureC: number, humidityPct: number): { value: number; label: string; color: string } {
  // Simplified PM2.5 estimation based on humidity and temp inversion patterns
  const basePM25 = 15 + (humidityPct > 80 ? 20 : humidityPct > 60 ? 8 : 0) - (temperatureC > 32 ? 5 : 0);
  const aqi = Math.round(basePM25);
  if (aqi <= 50) return { value: aqi, label: "Baik", color: "text-green-600" };
  if (aqi <= 100) return { value: aqi, label: "Sedang", color: "text-yellow-600" };
  if (aqi <= 150) return { value: aqi, label: "Tidak Sehat", color: "text-orange-600" };
  return { value: aqi, label: "Berbahaya", color: "text-red-600" };
}

/** Estimate UV Index from time, cloud cover, and latitude */
export function estimateUVIndex(
  localDateTime: string,
  cloudCoverPct: number | null,
  latitude: number | undefined
): { value: number; label: string; color: string; tip: string } {
  const hour = new Date(localDateTime).getHours();
  const lat = Math.abs(latitude ?? -5);

  // Base UV: peak at noon, varies by latitude
  let baseUV = 0;
  if (hour >= 10 && hour <= 14) {
    baseUV = lat < 10 ? 10 : lat < 30 ? 8 : 6;
  } else if (hour >= 8 && hour <= 16) {
    baseUV = lat < 10 ? 6 : lat < 30 ? 5 : 3;
  } else {
    baseUV = 1;
  }

  // Cloud cover reduces UV
  if (cloudCoverPct !== null) {
    baseUV = baseUV * (1 - (cloudCoverPct / 100) * 0.6);
  }

  const uv = Math.round(baseUV);
  if (uv <= 2) return { value: uv, label: "Rendah", color: "text-green-500", tip: "Aman beraktivitas di luar." };
  if (uv <= 5) return { value: uv, label: "Sedang", color: "text-yellow-500", tip: "Gunakan sunscreen SPF 30+." };
  if (uv <= 7) return { value: uv, label: "Tinggi", color: "text-orange-500", tip: "Hindari matahari langsung 10-14." };
  if (uv <= 10) return { value: uv, label: "Sangat Tinggi", color: "text-red-500", tip: "Gunakan topi dan sunscreen." };
  return { value: uv, label: "Ekstrem", color: "text-purple-600", tip: "Tetap di dalam ruangan." };
}

/** Calculate moon phase for a given date */
export function getMoonPhase(date: Date): { phase: string; illumination: number; icon: string } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Calculate Julian date
  const jd = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + Math.floor(275 * month / 9) + day + 1721013.5;
  const daysSinceNew = (jd - 2451549.5) % 29.53058867;
  const illumination = Math.round((daysSinceNew / 29.53) * 100);

  if (daysSinceNew < 1.8) return { phase: "Bulan Baru", illumination, icon: "🌑" };
  if (daysSinceNew < 5.5) return { phase: "Sabit Muda", illumination, icon: "🌒" };
  if (daysSinceNew < 9.2) return { phase: "Kuartal Awal", illumination, icon: "🌓" };
  if (daysSinceNew < 12.9) return { phase: "Cembung Awal", illumination, icon: "🌔" };
  if (daysSinceNew < 16.6) return { phase: "Bulan Purnama", illumination, icon: "🌕" };
  if (daysSinceNew < 20.3) return { phase: "Cembung Akhir", illumination, icon: "🌖" };
  if (daysSinceNew < 24.0) return { phase: "Kuartal Akhir", illumination, icon: "🌗" };
  if (daysSinceNew < 27.6) return { phase: "Sabit Tua", illumination, icon: "🌘" };
  return { phase: "Bulan Baru", illumination, icon: "🌑" };
}

/** Calculate approximate sunrise/sunset times based on latitude and longitude */
export function getSunTimes(date: Date, latitude?: number, longitude?: number): { sunrise: string; sunset: string } {
  const lat = latitude ?? -6.2;
  const lon = longitude ?? 106.8;
  const n = Math.floor(275 * (date.getMonth() + 1) / 9) - 2 * Math.floor((date.getMonth() + 1 + 9) / 12) + (date.getDate() - 30) + 2;
  const dec = 23.44 * Math.sin((360 / 365) * (n - 81) * Math.PI / 180);
  const cosHA = -Math.tan(lat * Math.PI / 180) * Math.tan(dec * Math.PI / 180);
  const ha = Math.acos(cosHA) * 180 / Math.PI;

  const sunriseMinutes = 720 - 4 * (lon + ha) + 0; // equation of time simplified
  const sunsetMinutes = 720 - 4 * (lon - ha) + 0;

  const toTime = (mins: number): string => {
    const h = Math.floor(((mins % 1440) / 60 + 7) % 24); // GMT+7 offset
    const m = Math.floor(mins % 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  return {
    sunrise: toTime(sunriseMinutes),
    sunset: toTime(sunsetMinutes),
  };
}

/** Estimate sea conditions from wind speed */
export function estimateSeaConditions(windSpeedKmh: number | null): {
  waveHeight: string;
  waveCategory: string;
  seaTemp: string;
} {
  const ws = windSpeedKmh ?? 10;
  // Simplified wave height estimation: wave height ~ 0.02 * windSpeed^1.5
  const waveM = Math.round(0.02 * Math.pow(ws, 1.5) * 100) / 100;
  const waveMin = Math.max(0.1, Math.round((waveM - 0.3) * 10) / 10);
  const waveMax = Math.round((waveM + 0.3) * 10) / 10;

  let category = "Rendah";
  if (waveMax > 2) category = "Sedang";
  if (waveMax > 4) category = "Tinggi";

  // Sea temperature estimation: ~27-31°C for Indonesia waters
  const baseSeaTemp = 28 + (ws > 15 ? -1 : ws > 5 ? 0 : 1);

  return {
    waveHeight: `${waveMin.toFixed(1)} - ${waveMax.toFixed(1)}m`,
    waveCategory: category,
    seaTemp: `${baseSeaTemp}°C`,
  };
}

/** Get weather-based safety tips */
export function getWeatherTips(temp: number, desc: string, humidity: number, wind: number): Array<{ icon: string; title: string; desc: string; type: "info" | "warning" | "success" }> {
  const tips: Array<{ icon: string; title: string; desc: string; type: "info" | "warning" | "success" }> = [];
  const descLower = desc.toLowerCase();

  if (descLower.includes("hujan")) {
    tips.push({ icon: "umbrella", title: "Hujan", desc: desc.includes("petir") ? "Waspada petir! Hindari berlindung di bawah pohon." : "Gunakan payung jika bepergian.", type: "warning" });
  }
  if (temp > 32) {
    tips.push({ icon: "thermostat", title: "Panas", desc: "Minum air putih cukup. Hindari aktivitas berat di siang hari.", type: "warning" });
  }
  if (temp < 24) {
    tips.push({ icon: "ac_unit", title: "Dingin", desc: "Suhu lebih dingin dari biasanya. Bawa jaket.", type: "info" });
  }
  if (humidity > 80) {
    tips.push({ icon: "water_drop", title: "Lembap", desc: "Udara sangat lembap. Cucian akan lama kering.", type: "info" });
  }
  if (wind > 25) {
    tips.push({ icon: "air", title: "Angin Kencang", desc: "Angin cukup kencang. Hati-hati barang ringan terbawa.", type: "warning" });
  }
  if (descLower.includes("cerah") && temp > 28) {
    tips.push({ icon: "sunny", title: "Cerah", desc: "Cuaca cerah. Cocok untuk aktivitas outdoor.", type: "success" });
  }
  if (descLower.includes("berawan") && !descLower.includes("hujan")) {
    tips.push({ icon: "cloud", title: "Berawan", desc: "Langit berawan. Cuaca nyaman untuk beraktivitas.", type: "info" });
  }
  if (tips.length === 0) {
    tips.push({ icon: "sunny", title: "Cuaca Normal", desc: "Kondisi cuaca normal untuk wilayah ini.", type: "success" });
  }

  return tips;
}

/** Get community-style report based on weather */
export function generateLocalReport(regionVillage: string, desc: string, temp: number): { name: string; text: string; time: string }[] {
  const reports: { name: string; text: string; time: string }[] = [];
  const minutesAgo = (m: number) => `${m} mnt lalu`;

  if (desc.toLowerCase().includes("hujan")) {
    reports.push({ name: "Budi", text: `Hujan ${desc.toLowerCase()} di ${regionVillage}. Hati-hati jalan licin!`, time: minutesAgo(15) });
    reports.push({ name: "Rina", text: "Jalanan mulai tergenang di beberapa titik. Hindari rute alternatif.", time: minutesAgo(35) });
  } else if (desc.toLowerCase().includes("cerah")) {
    reports.push({ name: "Andi", text: `Cuaca cerah di ${regionVillage}. Cocok untuk jalan-jalan!`, time: minutesAgo(10) });
    reports.push({ name: "Dewi", text: "Langsit biru cerah, angin sepoi-sepoi. Enak banget!", time: minutesAgo(25) });
  } else if (desc.toLowerCase().includes("berawan")) {
    reports.push({ name: "Sari", text: `Cuaca mendung tipis di ${regionVillage}. Tidak panas, nyaman.`, time: minutesAgo(20) });
    reports.push({ name: "Doni", text: "Sempat gerimis sebentar, sekarang berawan saja.", time: minutesAgo(50) });
  } else if (temp > 33) {
    reports.push({ name: "Agus", text: `Panas banget hari ini di ${regionVillage}, suhu ${temp}°C!`, time: minutesAgo(5) });
    reports.push({ name: "Maya", text: "AC nyala terus. Semoga cepat hujan.", time: minutesAgo(30) });
  } else {
    reports.push({ name: "Fajar", text: `Cuaca di ${regionVillage} cukup bersahabat hari ini.`, time: minutesAgo(15) });
    reports.push({ name: "Tina", text: "Langit agak mendung tapi masih cerah. Enak untuk jalan kaki.", time: minutesAgo(40) });
  }

  return reports;
}

/** Get weather education content based on current conditions */
export function getEducationContent(humidity: number, temp: number, desc: string): Array<{ title: string; text: string; color: string }> {
  const items: Array<{ title: string; text: string; color: string }> = [];

  if (humidity > 75) {
    items.push({
      title: "Kenapa terasa gerah?",
      text: `Kelembapan ${humidity}% membuat keringat sulit menguap. Gunakan pakaian berbahan katun agar lebih nyaman.`,
      color: "bg-blue-50/50 border-blue-100",
    });
  }
  if (temp > 32) {
    items.push({
      title: "Tips Hadapi Cuaca Panas",
      text: `Minum air 2-3 liter per hari. Hindari kopi berlebih yang bisa mempercepat dehidrasi.`,
      color: "bg-orange-50/50 border-orange-100",
    });
  }
  if (desc.toLowerCase().includes("hujan")) {
    items.push({
      title: "Hujan dan Kesehatan",
      text: `Pastikan tubuh tetap hangat setelah kehujanan. Siapkan handuk kering dan minuman hangat.`,
      color: "bg-indigo-50/50 border-indigo-100",
    });
  }
  if (desc.toLowerCase().includes("berawan") && !desc.toLowerCase().includes("hujan")) {
    items.push({
      title: "Fakta: Awan & Suhu",
      text: `Lapisan awan tebal menghalangi sinar matahari, membuat suhu lebih stabil sepanjang hari.`,
      color: "bg-gray-50/50 border-gray-200",
    });
  }
  // Default education item
  items.push({
    title: "Prakiraan Cuaca BMKG",
    text: "BMKG memperbarui data prakiraan 2× sehari. Data ini adalah prakiraan, bukan kepastian.",
    color: "bg-green-100/20 border-green-100/30",
  });

  return items;
}
