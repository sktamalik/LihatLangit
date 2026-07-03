# PRD - LihatLangit: Dashboard Prakiraan Cuaca Indonesia Berbasis BMKG

Tanggal verifikasi sumber: 2026-07-03
Nama produk: LihatLangit
Target implementasi: website dashboard untuk memantau prakiraan cuaca wilayah Indonesia berdasarkan data publik BMKG.
Dokumen terkait: `DESIGN.md`, `Guideline.md`, dan `Tasks.md`.

## 1. Ringkasan Produk

LihatLangit membantu pengguna memantau kondisi dan prakiraan cuaca di wilayahnya masing-masing sampai level desa/kelurahan. Pengguna dapat mencari wilayah, memilih lokasi dari dataset kode `adm4`, lalu melihat ringkasan cuaca terdekat dan prakiraan 3 hari ke depan berdasarkan data resmi BMKG.

Istilah "real-time" pada produk ini berarti aplikasi mengambil dan menampilkan data BMKG terbaru yang tersedia, lengkap dengan waktu produksi data BMKG, waktu data diambil aplikasi, dan status cache. LihatLangit bukan sensor cuaca langsung dan tidak membuat model prediksi sendiri.

LihatLangit tidak boleh tampil sebagai aplikasi resmi BMKG. Semua data cuaca yang berasal dari BMKG wajib diberi atribusi jelas.

## 2. Sumber Data Resmi

### 2.1 Prakiraan Cuaca BMKG

Sumber resmi: https://data.bmkg.go.id/prakiraan-cuaca/  
Endpoint:

```text
GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah_tingkat_iv}
```

Contoh:

```text
GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001
```

Ketentuan BMKG yang wajib dipatuhi:

- Format data: JSON.
- Cakupan data: prakiraan cuaca kelurahan/desa di Indonesia.
- Rentang prakiraan: 3 hari.
- Frekuensi prakiraan: 8 data per hari, interval per 3 jam.
- Pemutakhiran data: 2 kali sehari.
- Lokasi memakai kode wilayah administrasi tingkat IV (`adm4`), mengacu pada kode wilayah Kemendagri.
- Batas akses: 60 request per menit per IP.
- Atribusi wajib: tampilkan BMKG sebagai sumber data pada aplikasi.

Field penting:

- `lokasi`: metadata lokasi seperti provinsi, kota/kabupaten, kecamatan, desa, latitude, longitude, timezone.
- `data[0].cuaca`: array prakiraan per hari dan per jam.
- `utc_datetime`: waktu UTC.
- `local_datetime`: waktu lokal.
- `t`: suhu udara dalam derajat C.
- `hu`: kelembapan dalam persen.
- `weather_desc`: kondisi cuaca bahasa Indonesia.
- `weather_desc_en`: kondisi cuaca bahasa Inggris.
- `ws`: kecepatan angin dalam km/jam.
- `wd`: arah angin.
- `tcc`: tutupan awan dalam persen.
- `vs_text`: jarak pandang.
- `analysis_date`: waktu produksi data dalam UTC.
- `image`: ikon cuaca dari BMKG bila tersedia.

### 2.2 Peringatan Dini Cuaca BMKG

Peringatan dini cuaca BMKG adalah fitur setelah MVP.

Sumber resmi: https://data.bmkg.go.id/peringatan-dini-cuaca/  
Endpoint RSS:

```text
GET https://www.bmkg.go.id/alerts/nowcast/id
GET https://www.bmkg.go.id/alerts/nowcast/en
```

Endpoint detail CAP:

```text
GET https://www.bmkg.go.id/alerts/nowcast/id/{kode_detail_cap}_alert.xml
GET https://www.bmkg.go.id/alerts/nowcast/en/{kode_detail_cap}_alert.xml
```

## 3. Tujuan Produk

1. Menyediakan dashboard cuaca yang langsung berguna saat halaman pertama dibuka.
2. Memudahkan pengguna mencari wilayah Indonesia sampai level desa/kelurahan.
3. Menampilkan ringkasan kondisi cuaca terdekat secara cepat dibaca.
4. Menampilkan prakiraan 3 hari dalam slot 3 jam dengan data BMKG.
5. Menampilkan status data: produksi BMKG, fetch aplikasi, cache, dan stale fallback.
6. Mengurangi request langsung ke BMKG melalui API internal, cache, timeout, dan rate limit.
7. Menjadi fondasi matang untuk fitur favorit, share wilayah, peta, dan peringatan dini.

## 4. Non-Tujuan

1. Tidak membuat model prediksi cuaca sendiri.
2. Tidak mengklaim data sebagai milik LihatLangit.
3. Tidak melakukan scraping halaman BMKG bila API resmi tersedia.
4. Tidak menampilkan klaim keselamatan mutlak seperti "aman untuk bepergian".
5. Tidak membuat landing page marketing sebagai layar utama.
6. Tidak membuat push notification, PWA, peta, atau multi-wilayah sebelum MVP stabil.

## 5. Persona Pengguna

### 5.1 Masyarakat Umum

Kebutuhan:

- Melihat cuaca di rumah, kantor, kampus, atau tujuan perjalanan.
- Mendapat ringkasan cepat tanpa membaca tabel panjang.
- Menggunakan pencarian wilayah atau lokasi perangkat bila tersedia.

### 5.2 Pekerja Lapangan dan UMKM

Kebutuhan:

- Melihat peluang hujan, angin, jarak pandang, dan tutupan awan beberapa jam ke depan.
- Membaca update data dan status cache agar tahu kesegaran informasi.
- Menyimpan atau membuka ulang wilayah yang sering dipantau.

### 5.3 Operator atau Admin Lokal

Kebutuhan:

- Memantau wilayah tertentu secara konsisten.
- Melihat metadata integrasi BMKG, status stale, dan error yang mudah dipahami.
- Membutuhkan fondasi untuk peringatan dini pada fase lanjutan.

## 6. MVP Scope

### 6.1 Fitur Utama MVP

1. Dashboard prakiraan cuaca sebagai halaman pertama.
2. Pencarian wilayah berbasis dataset `adm4` lokal.
3. Tombol "Gunakan lokasi" untuk geolocation browser bila dataset memiliki latitude/longitude; fallback ke pencarian manual bila izin ditolak atau lokasi tidak cocok.
4. Detail prakiraan untuk satu wilayah terpilih.
5. Ringkasan slot cuaca terdekat berdasarkan `local_datetime`.
6. Prakiraan 3 hari, interval 3 jam.
7. Informasi suhu, kelembapan, kondisi cuaca, angin, tutupan awan, jarak pandang, dan ikon BMKG.
8. Status data: `analysis_date`, `fetchedAt`, `fromCache`, dan `isStale`.
9. Cache API server-side agar request ke BMKG tidak berlebihan.
10. Atribusi: "Sumber data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)".
11. Loading, empty, error, stale-data, dan no-result state.
12. UI sesuai `DESIGN.md`: Airy Modernism, glass cards, palet sky-blue, Geist/Inter, spacing lega, dan dashboard app-like.

### 6.2 Fitur Setelah MVP

1. Lokasi favorit di localStorage.
2. Share link wilayah.
3. Peta Indonesia atau peta wilayah terpilih.
4. Perbandingan beberapa wilayah.
5. Integrasi peringatan dini cuaca nowcast BMKG.
6. Mode bahasa Indonesia/English.
7. Progressive Web App.
8. Notifikasi browser untuk peringatan dini setelah parser CAP stabil.
9. Dataset `adm4` lengkap dan proses import tervalidasi.

## 7. User Flow

### 7.1 Flow Utama Pencarian Manual

1. Pengguna membuka website.
2. Website menampilkan dashboard awal dengan header ringkas, search wilayah, dan empty state.
3. Pengguna mengetik desa, kecamatan, kota/kabupaten, atau provinsi.
4. Frontend melakukan debounce minimal 250 ms.
5. Sistem menampilkan 10-20 hasil dari dataset `adm4` lokal.
6. Pengguna memilih wilayah.
7. Frontend memanggil API internal `/api/weather?adm4=...`.
8. API internal mengecek validasi dan cache.
9. Bila cache fresh, API mengembalikan data cache.
10. Bila cache kosong atau stale, API memanggil BMKG server-side.
11. Respons BMKG dinormalisasi menjadi model internal.
12. Dashboard menampilkan ringkasan, timeline, metadata update, status cache, dan atribusi BMKG.

### 7.2 Flow Gunakan Lokasi

1. Pengguna menekan tombol "Gunakan lokasi" di search bar.
2. Browser meminta izin geolocation.
3. Bila izin diberikan, aplikasi mencari wilayah terdekat dari dataset lokal yang memiliki koordinat.
4. Bila match ditemukan, aplikasi memilih wilayah dan memuat prakiraan.
5. Bila izin ditolak, geolocation gagal, atau dataset belum memadai, tampilkan pesan singkat dan tetap arahkan pengguna ke pencarian manual.

### 7.3 Flow Error

1. Wilayah tidak ditemukan: tampilkan "Wilayah belum tersedia di dataset pencarian" dan saran kata kunci lain.
2. `adm4` invalid: jangan request BMKG, tampilkan error validasi.
3. BMKG timeout atau unavailable: tampilkan cache terakhir bila ada dengan label "Data cadangan".
4. Cache tidak ada dan BMKG gagal: tampilkan error UI-friendly dengan aksi coba lagi.
5. Struktur data berubah: log server-side, tampilkan pesan umum tanpa stack trace.
6. Geolocation ditolak: tampilkan bahwa pengguna tetap bisa mencari wilayah secara manual.

## 8. Data Flow Teknis

```text
Browser
  -> RegionSearch dari dataset/API internal /api/regions
  -> Optional browser geolocation
  -> API internal /api/weather?adm4=...
  -> Validate adm4
  -> Cache lookup
  -> BMKG API bila cache miss/stale
  -> Normalize BMKG response
  -> Return stable internal model
  -> Frontend render dashboard
```

Prinsip:

- Jangan memanggil BMKG langsung dari browser untuk fitur utama.
- Semua request BMKG harus lewat server route/proxy.
- Cache minimal 1 jam; simpan stale cache sampai 24 jam.
- Timeout request BMKG maksimal 10 detik.
- Simpan `analysis_date` dari BMKG dan `fetchedAt` dari aplikasi.
- Semua error integrasi harus dipetakan ke kode error internal.

## 9. Rekomendasi Arsitektur

Stack rekomendasi:

- Frontend: Next.js App Router + TypeScript.
- Styling: Tailwind CSS dengan design token dari `DESIGN.md`.
- UI state: React state atau TanStack Query bila dibutuhkan.
- Server/API: Next.js Route Handler.
- Validasi data: Zod.
- Cache MVP: in-memory cache dengan TTL.
- Cache production: Redis/Upstash atau database ringan.
- Dataset wilayah: JSON statis untuk seed `adm4`, siap diperluas lewat proses import.
- Testing: Vitest/Jest untuk unit test, Playwright untuk smoke/e2e bila waktu cukup.

Struktur aplikasi:

```text
src/
  app/
    page.tsx
    api/
      weather/route.ts
      regions/route.ts
  components/
    RegionSearch.tsx
    WeatherSummary.tsx
    ForecastTimeline.tsx
    ForecastCard.tsx
    SourceAttribution.tsx
    EmptyState.tsx
    WeatherErrorState.tsx
    WeatherLoadingState.tsx
  lib/
    bmkgClient.ts
    weatherNormalize.ts
    cache.ts
    regionSearch.ts
    nearestRegion.ts
    time.ts
  data/
    regions-adm4.sample.json
  types/
    weather.ts
```

## 10. Model Data Internal

```ts
type Region = {
  adm4: string;
  province: string;
  city: string;
  district: string;
  village: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

type WeatherPoint = {
  utcDateTime: string;
  localDateTime: string;
  temperatureC: number | null;
  humidityPct: number | null;
  weatherDescription: string;
  weatherDescriptionEn?: string;
  windSpeedKmh: number | null;
  windDirection: string | null;
  cloudCoverPct: number | null;
  visibilityText: string | null;
  iconUrl?: string;
};

type WeatherDay = {
  date: string;
  label: string;
  points: WeatherPoint[];
};

type WeatherForecast = {
  source: "BMKG";
  region: Region;
  analysisDateUtc: string | null;
  fetchedAt: string;
  fromCache: boolean;
  isStale: boolean;
  nearestPoint: WeatherPoint | null;
  days: WeatherDay[];
};
```

## 11. UX dan UI Requirements

### 11.1 Prinsip Layar

1. First screen adalah dashboard, bukan landing page.
2. Search wilayah adalah aksi utama.
3. Ringkasan cuaca terdekat tampil di atas atau area paling dominan.
4. Timeline 3 hari memakai tab/segmented control.
5. Slot prakiraan tampil sebagai mini-card per 3 jam.
6. Jam yang ditampilkan adalah jam lokal wilayah.
7. Metadata dan atribusi BMKG harus terlihat tanpa membuka halaman lain.
8. Empty state harus mengajak pengguna mencari wilayah, bukan menjual fitur.

### 11.2 Design System dari `DESIGN.md`

Karakter visual:

- Arah: Airy Modernism.
- Rasa UI: tenang, jelas, ringan, tetapi tetap operasional.
- Gaya: minimalisme dengan glassmorphism terkontrol.
- Fokus: data cuaca, bukan dekorasi.

Token wajib:

- Background utama: `sky-surface` `#E0F2FE` atau `background` `#f6faff`.
- Primary/action: `primary` `#006591`.
- Accent matahari/peringatan: `sun-accent` `#F59E0B`, dipakai hemat.
- Heading/data utama: `text-deep` `#0C4A6E`.
- Metadata: `text-muted` `#64748B`.
- Cards: putih transparan sekitar 80%, backdrop blur 12px, border putih low-contrast.

Typography:

- Temperatur utama memakai Geist display, desktop sekitar 64px, mobile sekitar 48px.
- Heading, label, angka data memakai Geist.
- Body dan deskripsi memakai Inter.
- Label metrik seperti "KELEMBAPAN" atau "ANGIN" memakai label kecil all-caps.

Layout:

- Desktop memakai grid 12 kolom dengan max-width sekitar 1200px.
- Mobile memakai single-column stack.
- Spacing mengikuti base 8px, gutter utama 24px, margin mobile minimal 16px.
- Cards memakai radius besar sesuai `rounded-xl` dari desain.
- Hindari kartu bertumpuk di dalam kartu.

Komponen utama:

- Header ringkas dengan nama LihatLangit dan status data kecil.
- Search glass bar dengan ikon search dan tombol "Gunakan lokasi".
- WeatherSummary dengan suhu dominan, kondisi, wilayah, dan metrik utama.
- ForecastTimeline dengan tab Hari 1, Hari 2, Hari 3.
- ForecastCard per slot: jam, ikon, kondisi, suhu, kelembapan, angin, awan, jarak pandang.
- SourceAttribution di footer atau bawah panel data.
- EmptyState dengan ilustrasi awan/matahari yang ringan.

### 11.3 Copywriting

- Gunakan "prakiraan", bukan "kepastian".
- Gunakan "Sumber data: BMKG".
- Gunakan "Diperbarui BMKG" untuk `analysis_date`.
- Gunakan "Diambil aplikasi" untuk `fetchedAt`.
- Gunakan "Data cadangan" saat `isStale=true`.
- Jangan menyebut data sebagai "real-time sensor"; sebut "data terbaru BMKG" atau "terakhir diperbarui".

## 12. Non-Functional Requirements

### Performance

- First load dashboard awal < 3 detik pada jaringan normal.
- Request prakiraan wilayah < 2 detik bila cache tersedia.
- Timeout request BMKG maksimal 10 detik.
- Search region terasa instan pada dataset sample dan tetap responsif saat dataset diperbesar.

### Reliability

- Cache terakhir tetap bisa ditampilkan saat BMKG gagal.
- Parsing defensif terhadap field kosong atau tipe data tidak sesuai.
- UI tidak crash bila ikon BMKG hilang atau image gagal dimuat.
- Error client harus punya pesan dan aksi yang jelas.

### Security dan Privacy

- Validasi `adm4` dengan regex `^\d{2}\.\d{2}\.\d{2}\.\d{4}$`.
- Jangan menerima URL mentah dari user untuk request server.
- Jangan menampilkan stack trace ke frontend.
- Terapkan rate limit API internal.
- Geolocation hanya dipakai di browser setelah izin pengguna dan tidak disimpan tanpa fitur favorit eksplisit.

### Accessibility

- Search bisa digunakan dengan keyboard.
- Semua tombol punya label yang jelas.
- Ikon cuaca punya alt text dari `weather_desc`.
- Loading dan error state dapat dibaca screen reader.
- Kontras teks memadai di atas glass surface.
- Dukung `prefers-reduced-motion`.

### Compliance

- Atribusi BMKG wajib terlihat.
- Sertakan link sumber data BMKG.
- Jangan mengubah makna data cuaca.
- Jangan menampilkan LihatLangit sebagai kanal resmi BMKG.

## 13. Acceptance Criteria MVP

MVP dianggap selesai bila:

1. Pengguna dapat mencari dan memilih minimal 10 wilayah sample dengan kode `adm4`.
2. Tombol "Gunakan lokasi" tersedia dan menangani sukses, ditolak, dan tidak ada match dengan baik.
3. Sistem mengambil data dari endpoint resmi BMKG melalui API internal.
4. Dashboard menampilkan ringkasan cuaca terdekat dari data BMKG.
5. Dashboard menampilkan prakiraan 3 hari dalam slot 3 jam.
6. Metadata `analysis_date`, `fetchedAt`, `fromCache`, `isStale`, dan sumber BMKG tampil.
7. Error state untuk invalid `adm4`, wilayah tidak ditemukan, BMKG gagal, timeout, dan data kosong tersedia.
8. Cache mencegah request berulang ke BMKG untuk wilayah yang sama dalam TTL.
9. Unit test mencakup validasi `adm4`, search region, normalisasi BMKG, dan cache fresh/stale.
10. UI mengikuti `DESIGN.md` pada warna, tipografi, glass cards, layout desktop/mobile, empty state, dan source attribution.
11. Tidak ada data cuaca dummy di UI utama setelah integrasi BMKG selesai.
12. Dokumen `PRD.md`, `Guideline.md`, `Tasks.md`, dan `DESIGN.md` tetap sinkron.

## 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---:|---|
| Dataset `adm4` lengkap sulit disiapkan | Pencarian wilayah tidak lengkap | Mulai dari seed wilayah prioritas, desain struktur import dataset lengkap |
| Koordinat dataset tidak lengkap | "Gunakan lokasi" tidak selalu bisa memilih wilayah | Fallback ke pencarian manual, tampilkan pesan jelas |
| BMKG rate limit 60 request/menit/IP | API aplikasi gagal saat trafik naik | Cache server-side, debounce search, rate limit internal |
| Struktur respons BMKG berubah | UI rusak | Normalisasi defensif, Zod schema, test fixture |
| API BMKG downtime | Data tidak tampil | Fallback stale cache dan status "Data cadangan" |
| Glassmorphism menurunkan keterbacaan | UI sulit dibaca | Batasi transparansi, jaga kontras, test mobile |
| Pengguna salah paham "real-time" | Keputusan lapangan berisiko | Tampilkan waktu update, status cache, dan copy "prakiraan" |

## 15. Prompt Utama untuk HERMES AGENT

Bangun LihatLangit, website dashboard prakiraan cuaca Indonesia menggunakan data resmi BMKG. Layar pertama harus berupa dashboard app-like sesuai `DESIGN.md`: Airy Modernism, glassmorphism terkontrol, palet sky-blue, Geist/Inter, search wilayah dengan tombol "Gunakan lokasi", ringkasan cuaca terdekat, timeline 3 hari per 3 jam, dan atribusi BMKG yang terlihat.

Gunakan endpoint `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah_tingkat_iv}` melalui API internal server-side, bukan langsung dari browser. Implementasikan dataset pencarian `adm4`, validasi parameter, cache server-side, stale fallback, normalisasi respons BMKG, error state lengkap, status data, dan test utama. Jangan membuat prediksi sendiri, jangan menghilangkan atribusi BMKG, dan jangan mulai fitur opsional sebelum acceptance criteria MVP terpenuhi.
