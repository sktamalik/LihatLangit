# ☁️ LihatLangit — Dashboard Prakiraan Cuaca Indonesia

Dashboard prakiraan cuaca Indonesia berbasis data resmi **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)**. Cari wilayah hingga level desa/kelurahan menggunakan kode `adm4` dan dapatkan prakiraan 3 hari dengan interval 3 jam.

## Fitur MVP

- **Pencarian Wilayah** — Cari desa/kelurahan, kecamatan, kota, atau provinsi dari dataset lokal
- **Gunakan Lokasi** — Deteksi otomatis wilayah terdekat via geolocation browser
- **Ringkasan Cuaca** — Suhu, kondisi, kelembapan, angin, tutupan awan, jarak pandang
- **Prakiraan 3 Hari** — Slot per 3 jam dengan tab Hari Ini, Besok, Lusa
- **Data BMKG** — Semua data cuaca dari endpoint resmi BMKG melalui API internal
- **Status Data** — Tampilkan `analysis_date`, `fetchedAt`, status cache, dan label data cadangan
- **Airy Modernism UI** — Glassmorphism, sky-blue palette, Geist/Inter, responsif mobile & desktop

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Validation:** Zod
- **Testing:** Vitest
- **Fonts:** Geist (headings/data), Inter (body)

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build production
npm run build

# Production start
npm start

# Lint
npm run lint

# Test
npm run test
```

## Struktur Proyek

```
src/
  app/
    page.tsx              # Dashboard utama
    api/
      weather/route.ts    # GET /api/weather?adm4=...
      regions/route.ts    # GET /api/regions?q=... & nearest
  components/
    RegionSearch.tsx       # Glass search bar + geolocate
    WeatherSummary.tsx     # Ringkasan cuaca terdekat
    ForecastTimeline.tsx   # Tab hari + grid forecast cards
    ForecastCard.tsx       # Slot prakiraan 3 jam
    SourceAttribution.tsx  # Atribusi BMKG + metadata
    EmptyState.tsx         # State awal ajakan cari wilayah
    WeatherLoadingState.tsx # Skeleton loading
    WeatherErrorState.tsx  # Error dengan aksi
  lib/
    adm4.ts               # Validasi regex adm4
    bmkgClient.ts         # Client HTTP BMKG
    weatherNormalize.ts   # Normalisasi data BMKG
    cache.ts              # In-memory cache
    regionSearch.ts       # Search & nearest region
    time.ts               # Format waktu
    useWeather.ts         # Hook state dashboard
  types/
    weather.ts            # Tipe data internal
  data/
    regions-adm4.sample.json        # Dataset 30 wilayah
    bmkg-response.fixture.json      # Fixture test
    bmkg-response-empty.fixture.json
    bmkg-response-partial.fixture.json
```

## API Internal

### GET /api/weather?adm4={kode}

Mengambil prakiraan cuaca untuk kode wilayah `adm4`.

**Response sukses:**
```json
{
  "source": "BMKG",
  "region": { "adm4": "31.71.03.1001", "province": "DKI Jakarta", ... },
  "analysisDateUtc": "2026-07-03T00:00:00Z",
  "fetchedAt": "2026-07-03T02:30:00+08:00",
  "fromCache": false,
  "isStale": false,
  "nearestPoint": { ... },
  "days": [ ... ]
}
```

**Response error:**
```json
{
  "error": {
    "code": "BMKG_UNAVAILABLE",
    "message": "Data BMKG belum dapat diambil. Coba beberapa saat lagi."
  }
}
```

### GET /api/regions?q={query}

Pencarian wilayah dari dataset lokal.

### GET /api/regions?lat={lat}&lon={lon}

Cari wilayah terdekat dari koordinat.

## Dataset Wilayah

MVP menyertakan **30 wilayah sample** dari kota-kota besar Indonesia (Jakarta, Bandung, Surabaya, Semarang, Yogyakarta, Medan, Makassar, Balikpapan, Denpasar). Dataset dapat diperluas dengan format yang sama.

## Atribusi BMKG

Semua data cuaca bersumber dari **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)**. Atribusi wajib ditampilkan di setiap tampilan data cuaca.

- Sumber: [https://data.bmkg.go.id](https://data.bmkg.go.id)
- Endpoint: `GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode}`
- Batas akses: 60 request/menit/IP

## Known Limitations (MVP)

- **Dataset sample:** Hanya 30 wilayah — belum mencakup seluruh Indonesia
- **Cache in-memory:** Cache hilang saat server restart (belum Redis/Upstash)
- **Geolocation:** Bergantung pada koordinat di dataset — mungkin tidak cocok untuk semua lokasi
- **BMKG rate limit:** Protections ada di API internal, namun cache in-memory hanya per instance
- **Tidak ada PWA/notifikasi:** Belum support offline atau push notification

## Testing

```bash
npm run test
```

Mencakup:
- Validasi regex `adm4`
- Search region dari dataset lokal
- Nearest region
- Normalisasi fixture respons BMKG
- Handling field kosong
- Pemilihan nearest forecast point
- Cache fresh/stale behavior

## Lisensi

Data cuaca: © BMKG — digunakan sesuai ketentuan resmi BMKG.
