<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/Footericon.png">
    <source media="(prefers-color-scheme: light)" srcset="/Headericon.png">
    <img alt="LihatLangit" src="/Headericon.png" width="360">
  </picture>
</p>

<h3 align="center">Prakiraan Cuaca Indonesia — Real-time dari BMKG</h3>

<p align="center">
  Dashboard prakiraan cuaca modern berbasis data resmi BMKG. Cari cuaca hingga level desa/kelurahan,<br>
  visualisasi peta interaktif, peringatan dini, dan informasi lingkungan — seluruh Indonesia.
</p>

<p align="center">
  <a href="#fitur"><strong>Jelajahi Fitur</strong></a> ·
  <a href="#cara-menjalankan"><strong>Coba Sekarang</strong></a> ·
  <a href="#struktur-proyek"><strong>Struktur</strong></a> ·
  <a href="#api-endpoint"><strong>API</strong></a>
</p>

<br>

<p align="center">
  <img src="/Share.jpg" alt="LihatLangit Preview" width="100%">
</p>

<br>

## ✨ Fitur

| Fitur | Deskripsi |
|---|---|
| **🔍 Pencarian Wilayah** | Cari provinsi, kota, kecamatan, hingga desa/kelurahan dari database lokal |
| **📍 Geolokasi** | Deteksi otomatis wilayah terdekat via browser geolocation |
| **🌡️ Ringkasan Cuaca** | Suhu, kondisi langit, kelembapan, kecepatan angin, tutupan awan, jarak pandang |
| **📅 Prakiraan 3 Hari** | Setiap slot 3 jam dengan tab Hari Ini, Besok, dan Lusa |
| **📈 Grafik Tren** | Visualisasi suhu, kelembapan, dan tekanan udara dalam grafik interaktif |
| **🗺️ Peta Interaktif** | Peta cuaca seluruh Indonesia dengan marker suhu dan kondisi cuaca tiap kota |
| **⚠️ Peringatan Dini** | Nowcast BMKG — peringatan cuaca ekstrem real-time langsung dari BMKG |
| **🌊 Kondisi Laut** | Tinggi gelombang, kecepatan angin laut, dan arah angin |
| **☀️🌙 Info Matahari & Bulan** | Waktu terbit, terbenam, fase bulan, dan durasi siang |
| **🌿 Metrik Lingkungan** | Indeks UV, jarak pandang, tutupan awan, tekanan udara |
| **💡 Tips Pintar** | Rekomendasi aktivitas berdasarkan kondisi cuaca terkini |
| **📰 Berita BMKG** | Siaran pers dan informasi terkini dari BMKG |
| **👥 Laporan Komunitas** | Fitur laporan cuaca dari pengguna |
| **📱 Responsif** | Tampilan optimal di desktop, tablet, dan mobile |
| **🎨 Sky Theme UI** | Glassmorphism, palet sky-blue, animasi awan & burung, pixel-art sun |

<br>

## 🛠️ Tech Stack

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 16">
  <img src="https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4">
  <img src="https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Leaflet">
</p>

| Teknologi | Kegunaan |
|---|---|
| **[Next.js 16](https://nextjs.org/)** (App Router) | Framework React full-stack — SSR, API routes, routing |
| **[React 19](https://react.dev/)** | Library UI dengan hooks dan concurrent features |
| **[TypeScript](https://www.typescriptlang.org/)** | Type-safe JavaScript |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Utility-first CSS modern dengan CSS-first config |
| **[Leaflet](https://leafletjs.com/)** | Peta interaktif Indonesia dengan marker cuaca |
| **[Vitest](https://vitest.dev/)** | Unit testing — cepat dan native ESM |
| **[ESLint](https://eslint.org/)** | Linting dengan konfigurasi Next.js |
| **[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)** | Parsing XML data BMKG & CAP alerts |
| **[Zod](https://zod.dev/)** | Validasi skema data runtime |

<br>

## 🚀 Cara Menjalankan

### Prasyarat

- **Node.js** ≥ 18.18.0
- **npm** atau **pnpm** / **yarn**

### Instalasi & Development

```bash
# Clone repositori
git clone https://github.com/sktamalik/LihatLangit.git
cd LihatLangit

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Production Build

```bash
# Build untuk production
npm run build

# Jalankan production server
npm start
```

### Linting & Testing

```bash
# Lint seluruh kode
npm run lint

# Jalankan test
npm run test        # one-shot
npm run test:watch  # watch mode
```

<br>

## 📂 Struktur Proyek

```
src/
├── app/
│   ├── layout.tsx                 # Root layout — global styles, fonts, sky animations
│   ├── page.tsx                   # Dashboard utama — hero, navbar, semua section
│   ├── globals.css                # Tailwind v4 + custom theme CSS & animations
│   ├── loading.tsx                # Loading state (spinner)
│   ├── error.tsx                  # Global error boundary
│   ├── not-found.tsx              # 404 halaman
│   └── api/
│       ├── weather/route.ts       # GET /api/weather?adm4={kode}
│       ├── weather-batch/route.ts # GET /api/weather-batch — data batch untuk peta
│       ├── regions/route.ts       # GET /api/regions?q=... & ?lat=...&lon=...
│       ├── warnings/route.ts      # GET /api/warnings — peringatan dini BMKG
│       ├── press-releases/route.ts# GET /api/press-releases — siaran pers BMKG
│       └── bmkg-content/route.ts  # GET /api/bmkg-content — konten BMKG
│
├── components/
│   ├── RegionSearch.tsx           # Search bar + geolocation trigger
│   ├── WeatherSummary.tsx         # Ringkasan cuaca terkini
│   ├── HourlyForecast.tsx         # Prakiraan per 3 jam
│   ├── WeekForecast.tsx           # Prakiraan 7 hari
│   ├── TrendChart.tsx             # Grafik tren suhu & kelembapan
│   ├── IndonesiaWeatherMap.tsx    # Peta interaktif seluruh Indonesia
│   ├── EnviroMetrics.tsx          # Indeks UV, jarak pandang, tekanan, awan
│   ├── SeaConditions.tsx          # Tinggi gelombang, angin laut
│   ├── SunMoon.tsx                # Info matahari & bulan
│   ├── SmartTips.tsx              # Tips aktivitas berdasarkan cuaca
│   ├── WarningBanner.tsx          # Peringatan dini BMKG
│   ├── BmkgPressRelease.tsx       # Siaran pers BMKG
│   ├── BmkgInfoTabs.tsx           # Tab info BMKG
│   ├── BmkgNewsCard.tsx           # Card berita BMKG
│   ├── CommunityReports.tsx       # Laporan komunitas
│   ├── EducationNews.tsx          # Edukasi kebencanaan
│   ├── SourceAttribution.tsx      # Atribusi data BMKG
│   ├── WeatherLoadingState.tsx    # Skeleton loading
│   ├── WeatherErrorState.tsx      # Error state dengan retry
│   ├── EmptyState.tsx             # State awal — ajakan cari wilayah
│   └── Toast.tsx                  # Notifikasi toast
│
├── lib/
│   ├── adm4.ts                    # Validasi regex kode adm4 BMKG
│   ├── adm4.test.ts               # Unit test validasi adm4
│   ├── bmkgClient.ts              # HTTP client ke API BMKG
│   ├── weatherNormalize.ts        # Normalisasi data BMKG → tipe internal
│   ├── weatherNormalize.test.ts   # Unit test normalisasi
│   ├── cache.ts                   # In-memory cache dengan TTL & stale
│   ├── cache.test.ts              # Unit test cache behavior
│   ├── regionSearch.ts            # Search & nearest region dari dataset
│   ├── regionSearch.test.ts       # Unit test search region
│   ├── envCalculations.ts         # Kalkulasi UV, jarak pandang, dll
│   ├── time.ts                    # Format & utilitas waktu
│   └── useWeather.ts              # Custom hook state management dashboard
│
├── types/
│   └── weather.ts                 # Tipe data internal TypeScript
│
└── data/
    ├── regions-adm4.json          # Dataset wilayah Indonesia (lengkap)
    └── indonesia-cities.ts        # Data kota untuk peta interaktif
```

<br>

## 🌐 API Endpoint

### `GET /api/weather?adm4={kode}`

Mengambil prakiraan cuaca untuk kode wilayah `adm4` dari BMKG.

**Response sukses:**
```json
{
  "source": "BMKG",
  "region": {
    "adm4": "31.71.03.1001",
    "province": "DKI Jakarta",
    "city": "Jakarta Pusat",
    "district": "Menteng",
    "village": "Menteng",
    "timezone": "Asia/Jakarta"
  },
  "analysisDateUtc": "2026-07-10T00:00:00Z",
  "fetchedAt": "2026-07-10T07:30:00+07:00",
  "fromCache": false,
  "isStale": false,
  "nearestPoint": { ... },
  "days": [ ... ]
}
```

### `GET /api/regions`

| Parameter | Deskripsi |
|---|---|
| `?q={query}` | Cari wilayah (provinsi/kota/kecamatan/desa) |
| `?lat={lat}&lon={lon}` | Cari wilayah terdekat dari koordinat GPS |

### `GET /api/weather-batch?cities={kode1},{kode2},...`

Data cuaca multiple kota sekaligus — digunakan untuk peta interaktif.

### `GET /api/warnings`

Peringatan dini cuaca BMKG (nowcast) — feed RSS di-parsing dari XML.

| Parameter | Deskripsi |
|---|---|
| `?detail={link}` | Detail peringatan dalam format CAP (Common Alerting Protocol) |

### `GET /api/press-releases`

Siaran pers terbaru dari BMKG.

### `GET /api/bmkg-content`

Konten dan artikel informatif dari BMKG.

<br>

## 🗺️ Peta Interaktif Indonesia

Peta cuaca menampilkan **40+ kota besar** di seluruh Indonesia dengan:

- **Marker suhu** dengan warna indikator (merah = panas, biru = dingin)
- **Ikon cuaca** (cerah, berawan, hujan, dll.)
- **Popup detail** saat diklik — nama kota, suhu, kondisi, kelembapan, angin
- **Legend** skala suhu
- **Zoom & pan** — jelajahi dari Sabang sampai Merauke

<br>

## ⚠️ Peringatan Dini (Nowcast)

Peringatan cuaca ekstrem **real-time langsung dari BMKG**:

- Data RSS nowcast BMKG di-refresh setiap 5 menit
- Filter per provinsi
- Ekspansi detail per peringatan (waktu kejadian, tingkat urgensi, area terdampak)
- Tampilkan/sembunyikan semua peringatan

<br>

## 🧪 Testing

```bash
# Jalankan semua test
npm run test

# Watch mode
npm run test:watch
```

Cakupan test:
- ✅ Validasi regex kode `adm4` (format BMKG)
- ✅ Pencarian wilayah dari dataset lokal
- ✅ Nearest region dari koordinat geografis
- ✅ Normalisasi fixture response BMKG (sukses, kosong, parsial)
- ✅ Pemilihan nearest forecast point
- ✅ Cache fresh/stale behavior

<br>

## 🎨 Desain

### Tema Visual

| Elemen | Value |
|---|---|
| **Primary** | `#FF5A22` (oranye BMKG) |
| **Accent** | `#3B82F6` (biru) |
| **Background** | `#E2F0F9` (sky blue) |
| **Footer** | `#5A3714` (earth brown) |
| **Heading Font** | *Press Start 2P* (pixel) |
| **Body Font** | *Inter* |
| **Display Font** | *Space Mono* |

### Animasi Latar

- **Awan** — drifting horizontal dengan kecepatan berbeda
- **Burung** — terbang melintasi layar dengan animasi kepakan sayap
- **Matahari** — floating up-down, pixel-art dengan efek glow
- **Fade-in** — transisi halus untuk konten yang muncul

<br>

## 📊 Dataset Wilayah

Saat ini mencakup **seluruh provinsi dan kota besar Indonesia**. Dataset disimpan dalam format JSON di `src/data/regions-adm4.json` dengan struktur:

```json
{
  "adm4": "31.71.03.1001",
  "province": "DKI Jakarta",
  "city": "Jakarta Pusat",
  "district": "Menteng",
  "village": "Menteng",
  "lat": -6.1865,
  "lon": 106.8344,
  "timezone": "Asia/Jakarta"
}
```

<br>

## 📜 Atribusi BMKG

Semua data cuaca bersumber dari **Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)**.

- 🌐 Situs: [data.bmkg.go.id](https://data.bmkg.go.id)
- 📡 Endpoint: `GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode}`
- ⚡ Rate limit: 60 request/menit/IP
- 📋 Atribusi wajib ditampilkan di setiap tampilan data cuaca

> Data prakiraan cuaca BMKG merupakan data terbuka yang dapat digunakan oleh masyarakat dengan tetap mencantumkan sumbernya.

<br>

## 🧠 Known Limitations

| Keterbatasan | Rencana ke Depan |
|---|---|
| **Cache in-memory** — hilang saat server restart | Integrasi Redis / Upstash |
| **Belum PWA** — tidak ada dukungan offline | Service Worker + cache-first |
| **Belum notifikasi** — tidak ada push alert | Web Push API / OneSignal |
| **BMKG rate limit** — perlindungan terbatas | Queue + distributed cache |
| **Dataset statis** — perlu update manual | Pipeline update otomatis dari BMKG |

<br>

## 🤝 Kontribusi

Kontribusi selalu diterima! Berikut cara berkontribusi:

1. **Fork** repositori ini
2. Buat branch fitur: `git checkout -b fitur-keren`
3. **Commit** perubahan: `git commit -m 'feat: tambah fitur keren'`
4. **Push** ke branch: `git push origin fitur-keren`
5. Buat **Pull Request**

### Panduan

- Ikuti konvensi kode yang sudah ada (TypeScript, ESLint)
- Tambahkan test untuk fitur baru
- Pastikan semua test lulus: `npm run test`
- Format commit: [Conventional Commits](https://www.conventionalcommits.org/)

<br>

## 📄 Lisensi

Hak cipta © 2026 [Sktamalik_](https://github.com/sktamalik)

Data cuaca: © **BMKG** — digunakan sesuai ketentuan resmi BMKG.

---

<p align="center">
  Dibuat dengan ☕ dan ❤️ untuk Indonesia
  <br>
  <a href="https://github.com/sktamalik">@sktamalik</a>
</p>

<br>

<p align="center">
  <sub>
    <a href="https://github.com/sktamalik/LihatLangit/issues">Laporkan Bug</a> ·
    <a href="https://github.com/sktamalik/LihatLangit/issues">Request Fitur</a>
  </sub>
</p>
