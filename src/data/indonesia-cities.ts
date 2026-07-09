/**
 * Data 38 ibukota provinsi di Indonesia untuk peta cuaca nasional.
 * Setiap kota memiliki koordinat dan kode adm4 untuk fetching data BMKG.
 */
export interface IndonesiaCity {
  adm4: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  island: "Sumatera" | "Jawa" | "Kalimantan" | "Sulawesi" | "Nusa Tenggara" | "Maluku" | "Papua";
}

export const INDONESIA_CITIES: IndonesiaCity[] = [
  // ── Sumatera ──
  { adm4: "11.71.01.0019", name: "Banda Aceh", province: "ACEH", latitude: 5.55, longitude: 95.32, island: "Sumatera" },
  { adm4: "12.71.01.0001", name: "Medan", province: "SUMATERA UTARA", latitude: 3.59, longitude: 98.67, island: "Sumatera" },
  { adm4: "13.71.01.0001", name: "Padang", province: "SUMATERA BARAT", latitude: -0.95, longitude: 100.35, island: "Sumatera" },
  { adm4: "14.71.01.0001", name: "Pekanbaru", province: "RIAU", latitude: 0.53, longitude: 101.45, island: "Sumatera" },
  { adm4: "21.72.01.0001", name: "Tanjung Pinang", province: "KEPULAUAN RIAU", latitude: 0.92, longitude: 104.45, island: "Sumatera" },
  { adm4: "15.71.01.0003", name: "Jambi", province: "JAMBI", latitude: -1.59, longitude: 103.61, island: "Sumatera" },
  { adm4: "16.71.01.0006", name: "Palembang", province: "SUMATERA SELATAN", latitude: -2.99, longitude: 104.76, island: "Sumatera" },
  { adm4: "19.71.01.0001", name: "Pangkal Pinang", province: "KEP. BANGKA BELITUNG", latitude: -2.13, longitude: 106.12, island: "Sumatera" },
  { adm4: "17.71.01.0003", name: "Bengkulu", province: "BENGKULU", latitude: -3.80, longitude: 102.27, island: "Sumatera" },
  { adm4: "18.71.01.0005", name: "Bandar Lampung", province: "LAMPUNG", latitude: -5.42, longitude: 105.26, island: "Sumatera" },

  // ── Jawa ──
  { adm4: "31.71.01.0001", name: "Jakarta", province: "DKI JAKARTA", latitude: -6.21, longitude: 106.85, island: "Jawa" },
  { adm4: "36.73.01.0001", name: "Serang", province: "BANTEN", latitude: -6.11, longitude: 106.15, island: "Jawa" },
  { adm4: "32.73.01.0001", name: "Bandung", province: "JAWA BARAT", latitude: -6.92, longitude: 107.61, island: "Jawa" },
  { adm4: "33.74.01.0001", name: "Semarang", province: "JAWA TENGAH", latitude: -6.97, longitude: 110.42, island: "Jawa" },
  { adm4: "34.71.01.0001", name: "Yogyakarta", province: "DI YOGYAKARTA", latitude: -7.80, longitude: 110.36, island: "Jawa" },
  { adm4: "35.78.01.0001", name: "Surabaya", province: "JAWA TIMUR", latitude: -7.25, longitude: 112.74, island: "Jawa" },

  // ── Nusa Tenggara ──
  { adm4: "51.71.01.0001", name: "Denpasar", province: "BALI", latitude: -8.65, longitude: 115.22, island: "Nusa Tenggara" },
  { adm4: "52.71.01.0004", name: "Mataram", province: "NUSA TENGGARA BARAT", latitude: -8.58, longitude: 116.12, island: "Nusa Tenggara" },
  { adm4: "53.71.01.0001", name: "Kupang", province: "NUSA TENGGARA TIMUR", latitude: -10.16, longitude: 123.60, island: "Nusa Tenggara" },

  // ── Kalimantan ──
  { adm4: "61.71.01.0002", name: "Pontianak", province: "KALIMANTAN BARAT", latitude: -0.03, longitude: 109.34, island: "Kalimantan" },
  { adm4: "62.71.01.0004", name: "Palangka Raya", province: "KALIMANTAN TENGAH", latitude: -2.21, longitude: 113.91, island: "Kalimantan" },
  { adm4: "63.71.01.0001", name: "Banjarmasin", province: "KALIMANTAN SELATAN", latitude: -3.32, longitude: 114.59, island: "Kalimantan" },
  { adm4: "64.72.01.0001", name: "Samarinda", province: "KALIMANTAN TIMUR", latitude: -0.50, longitude: 117.15, island: "Kalimantan" },
  { adm4: "65.02.05.0002", name: "Tanjung Selor", province: "KALIMANTAN UTARA", latitude: 2.85, longitude: 117.37, island: "Kalimantan" },

  // ── Sulawesi ──
  { adm4: "73.71.01.0001", name: "Makassar", province: "SULAWESI SELATAN", latitude: -5.15, longitude: 119.42, island: "Sulawesi" },
  { adm4: "71.71.01.0001", name: "Manado", province: "SULAWESI UTARA", latitude: 1.49, longitude: 124.84, island: "Sulawesi" },
  { adm4: "75.71.01.0001", name: "Gorontalo", province: "GORONTALO", latitude: 0.54, longitude: 123.06, island: "Sulawesi" },
  { adm4: "72.71.01.0004", name: "Palu", province: "SULAWESI TENGAH", latitude: -0.90, longitude: 119.86, island: "Sulawesi" },
  { adm4: "76.04.01.0001", name: "Mamuju", province: "SULAWESI BARAT", latitude: -2.68, longitude: 118.89, island: "Sulawesi" },
  { adm4: "74.71.01.0011", name: "Kendari", province: "SULAWESI TENGGARA", latitude: -3.98, longitude: 122.52, island: "Sulawesi" },

  // ── Maluku ──
  { adm4: "81.71.01.0001", name: "Ambon", province: "MALUKU", latitude: -3.70, longitude: 128.17, island: "Maluku" },
  { adm4: "82.72.05.0006", name: "Sofifi", province: "MALUKU UTARA", latitude: 0.73, longitude: 127.56, island: "Maluku" },

  // ── Papua ──
  { adm4: "91.71.01.0003", name: "Sorong", province: "PAPUA BARAT DAYA", latitude: -0.88, longitude: 131.29, island: "Papua" },
  { adm4: "91.05.11.0001", name: "Manokwari", province: "PAPUA BARAT", latitude: -0.87, longitude: 134.08, island: "Papua" },
  { adm4: "94.71.01.0001", name: "Jayapura", province: "PAPUA", latitude: -2.53, longitude: 140.72, island: "Papua" },
  { adm4: "94.04.05.0014", name: "Nabire", province: "PAPUA TENGAH", latitude: -3.37, longitude: 135.50, island: "Papua" },
  { adm4: "94.01.01.0006", name: "Merauke", province: "PAPUA SELATAN", latitude: -8.50, longitude: 140.40, island: "Papua" },
  { adm4: "94.02.11.0012", name: "Wamena", province: "PAPUA PEGUNUNGAN", latitude: -4.09, longitude: 138.95, island: "Papua" },
];

/** Warna indikator cuaca berdasarkan deskripsi BMKG (seperti yang digunakan BMKG di peta) */
export function getWeatherColor(description: string): string {
  const desc = description.toLowerCase();

  if (desc.includes("cerah") && !desc.includes("berawan")) return "#f59e0b"; // Orange — cerah
  if (desc.includes("cerah berawan")) return "#60a5fa"; // Blue — cerah berawan
  if (desc.includes("berawan") && desc.includes("tebal")) return "#6b7280"; // Gray — berawan tebal
  if (desc.includes("berawan")) return "#9ca3af"; // Light gray — berawan
  if (desc.includes("hujan ringan") || desc.includes("hujan sedang")) return "#6366f1"; // Indigo — hujan ringan/sedang
  if (desc.includes("hujan lebat")) return "#4f46e5"; // Dark indigo — hujan lebat
  if (desc.includes("hujan") && desc.includes("petir")) return "#7c3aed"; // Purple — hujan petir
  if (desc.includes("hujan") && desc.includes("gerimis")) return "#818cf8"; // Light indigo — gerimis
  if (desc.includes("hujan")) return "#6366f1"; // Indigo — hujan
  if (desc.includes("kabut") || desc.includes("asap")) return "#d1d5db"; // Light gray — kabut
  if (desc.includes("angin")) return "#34d399"; // Green — angin

  return "#60a5fa"; // Default blue
}

/** Dapatkan label cuaca untuk legenda */
export function getWeatherLabel(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("cerah") && !desc.includes("berawan")) return "Cerah";
  if (desc.includes("cerah berawan")) return "Cerah Berawan";
  if (desc.includes("berawan tebal")) return "Berawan Tebal";
  if (desc.includes("berawan")) return "Berawan";
  if (desc.includes("hujan ringan")) return "Hujan Ringan";
  if (desc.includes("hujan sedang")) return "Hujan Sedang";
  if (desc.includes("hujan lebat")) return "Hujan Lebat";
  if (desc.includes("hujan petir")) return "Hujan Petir";
  if (desc.includes("gerimis")) return "Gerimis";
  if (desc.includes("hujan")) return "Hujan";
  if (desc.includes("kabut")) return "Kabut";
  if (desc.includes("asap")) return "Asap";
  return description || "—";
}
