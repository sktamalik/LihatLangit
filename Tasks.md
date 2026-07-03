# Tasks - Backlog Implementasi LihatLangit

Gunakan task list ini sebagai urutan kerja HERMES AGENT. Jangan lompat ke fitur lanjutan sebelum MVP selesai. Semua pekerjaan UI harus mengacu ke `DESIGN.md`.

## Phase 0 - Setup, Stack, dan Design Foundation

- [ ] Tentukan stack final. Rekomendasi: Next.js App Router, TypeScript, Tailwind CSS, Zod, Vitest/Jest.
- [ ] Buat repository/project baru untuk LihatLangit.
- [ ] Tambahkan struktur folder dasar sesuai `PRD.md`.
- [ ] Tambahkan linting, formatting, dan script test.
- [ ] Tambahkan file `.env.example` untuk konfigurasi TTL, stale TTL, timeout, dan rate limit.
- [ ] Tambahkan dokumen `PRD.md`, `DESIGN.md`, `Guideline.md`, dan `Tasks.md` ke root repo implementasi.
- [ ] Konfigurasi design token dari `DESIGN.md`: warna, radius, spacing, shadow, dan font family.
- [ ] Setup font Geist dan Inter.
- [ ] Buat layout shell dashboard awal: background sky surface, max-width container, responsive grid.

Acceptance:

- Project bisa dijalankan secara lokal.
- Script `dev`, `build`, `lint`, dan `test` tersedia atau ada alasan teknis bila salah satu belum ada.
- Token visual utama dari `DESIGN.md` tersedia di sistem styling.
- Layar awal sudah berupa shell dashboard, bukan landing page.

## Phase 1 - Dataset Wilayah `adm4`

- [ ] Buat tipe `Region`.
- [ ] Buat `data/regions-adm4.sample.json`.
- [ ] Isi minimal 10-30 wilayah sample.
- [ ] Pastikan item dataset memiliki `adm4`, `province`, `city`, `district`, `village`.
- [ ] Tambahkan `latitude`, `longitude`, dan `timezone` untuk wilayah sample yang memungkinkan.
- [ ] Buat utilitas `searchRegions(query)`.
- [ ] Implementasikan ranking sederhana: desa, kecamatan, kota/kabupaten, provinsi.
- [ ] Buat utilitas `findNearestRegion(lat, lon)` bila koordinat tersedia.
- [ ] Buat API internal `GET /api/regions?q=...`.
- [ ] Opsional MVP: buat API internal `GET /api/regions/nearest?lat=...&lon=...`.
- [ ] Tambahkan test search region.
- [ ] Tambahkan test nearest region bila fiturnya dibuat.

Acceptance:

- User bisa mengetik nama wilayah dan menerima daftar hasil.
- Setiap hasil memiliki `adm4`.
- Search tidak bergantung pada request BMKG.
- Dataset siap dipakai untuk tombol "Gunakan lokasi" pada wilayah sample yang punya koordinat.

## Phase 2 - BMKG Client dan Validasi

- [ ] Buat fungsi `isValidAdm4(adm4)`.
- [ ] Buat `bmkgClient.fetchForecast(adm4)`.
- [ ] Tambahkan timeout request maksimal 10 detik.
- [ ] Handle HTTP non-200 dari BMKG.
- [ ] Handle JSON parse error.
- [ ] Handle response kosong atau bentuk response tidak sesuai.
- [ ] Tambahkan fixture respons BMKG untuk test.
- [ ] Tambahkan test validasi `adm4`.
- [ ] Tambahkan test error handling client.
- [ ] Pastikan client tidak pernah menerima URL mentah dari user.

Acceptance:

- `adm4` invalid tidak pernah dikirim ke BMKG.
- Error BMKG dikembalikan sebagai error terstruktur, bukan crash mentah.
- Fixture BMKG cukup mewakili data normal dan field kosong.

## Phase 3 - Normalisasi Data Cuaca

- [ ] Buat tipe `WeatherPoint`, `WeatherDay`, dan `WeatherForecast`.
- [ ] Buat `normalizeBmkgForecast(raw, fallbackRegion?)`.
- [ ] Ambil metadata `lokasi`.
- [ ] Ambil `analysis_date`.
- [ ] Flatten dan group data `cuaca` per tanggal lokal.
- [ ] Sort slot prakiraan berdasarkan `local_datetime`.
- [ ] Konversi field numerik dengan aman.
- [ ] Preserve `weather_desc`, `weather_desc_en`, dan `image`.
- [ ] Buat helper `getNearestForecastPoint(forecast, now?)`.
- [ ] Tandai forecast kosong sebagai error `EMPTY_FORECAST`.
- [ ] Tambahkan test fixture normalisasi.
- [ ] Tambahkan test pemilihan slot cuaca terdekat.

Acceptance:

- UI menerima model internal stabil.
- Test membuktikan prakiraan 3 hari dan slot per 3 jam diproses.
- Field kosong tidak membuat aplikasi crash.
- `nearestPoint` tersedia atau `null` secara eksplisit.

## Phase 4 - Cache dan API Internal Weather

- [ ] Buat modul cache in-memory dengan TTL.
- [ ] Konfigurasi TTL default 1 jam.
- [ ] Simpan stale cache sampai 24 jam.
- [ ] Buat API `GET /api/weather?adm4=...`.
- [ ] Integrasikan validasi `adm4`.
- [ ] Integrasikan lookup region dari dataset.
- [ ] Integrasikan `bmkgClient`.
- [ ] Integrasikan normalisasi data.
- [ ] Return `fromCache`, `isStale`, `fetchedAt`, `analysisDateUtc`, `nearestPoint`, dan `days`.
- [ ] Implementasikan fallback stale cache bila BMKG gagal.
- [ ] Tambahkan rate limit internal sederhana.
- [ ] Tambahkan mapping error ke kode `INVALID_ADM4`, `REGION_NOT_FOUND`, `BMKG_TIMEOUT`, `BMKG_UNAVAILABLE`, `BMKG_INVALID_RESPONSE`, `RATE_LIMITED`, `EMPTY_FORECAST`.
- [ ] Tambahkan test API route atau integration test.

Acceptance:

- Request pertama mengambil data BMKG.
- Request berikutnya dalam TTL memakai cache.
- Saat BMKG gagal dan stale cache ada, API tetap mengembalikan data dengan `isStale=true`.
- API mengembalikan error terstruktur bila tidak ada cache dan BMKG gagal.
- Response API cukup untuk merender UI tanpa membaca raw response BMKG.

## Phase 5 - UI Dashboard MVP sesuai DESIGN.md

- [ ] Buat halaman utama dashboard.
- [ ] Tampilkan nama aplikasi "LihatLangit" pada header/dashboard.
- [ ] Buat `RegionSearch` sebagai glass search bar.
- [ ] Tambahkan ikon search pada input.
- [ ] Tambahkan tombol "Gunakan lokasi".
- [ ] Implementasikan flow geolocation: loading, success, denied, unavailable, no-match.
- [ ] Tampilkan floating glass result list untuk hasil pencarian.
- [ ] Buat empty state "Cari wilayahmu untuk memulai" dengan visual awan/matahari ringan.
- [ ] Buat loading state/skeleton.
- [ ] Buat `WeatherSummary` dengan temperatur utama memakai style display-temp.
- [ ] Tampilkan wilayah terpilih: desa/kelurahan, kecamatan, kota/kabupaten, provinsi.
- [ ] Tampilkan metrik utama: suhu, kelembapan, angin, awan, jarak pandang.
- [ ] Buat `ForecastTimeline`.
- [ ] Buat tab/segmented control Hari ini, Besok, Lusa atau Hari 1-3 sesuai data.
- [ ] Buat `ForecastCard` per slot 3 jam.
- [ ] Gunakan ikon cuaca BMKG bila tersedia, dengan alt text.
- [ ] Buat `SourceAttribution`.
- [ ] Tampilkan `analysisDateUtc`, `fetchedAt`, `fromCache`, dan `isStale`.
- [ ] Tampilkan label "Data cadangan" untuk stale cache.
- [ ] Tampilkan error state untuk semua kode error utama.
- [ ] Pastikan desain mobile rapi.
- [ ] Pastikan desain desktop rapi dengan grid maksimal sekitar 1200px.
- [ ] Pastikan cards memakai glass style, radius, shadow, dan warna dari `DESIGN.md`.
- [ ] Pastikan teks tidak overflow di card, button, tab, dan result list.

Acceptance:

- First screen langsung menampilkan pengalaman dashboard.
- User bisa mencari wilayah, memilih hasil, dan melihat prakiraan.
- User bisa menekan "Gunakan lokasi" dan mendapat hasil atau fallback yang jelas.
- Atribusi BMKG terlihat tanpa perlu membuka halaman terpisah.
- UI terasa konsisten dengan `DESIGN.md`.
- Tidak ada data dummy setelah data BMKG berhasil tersedia.

## Phase 6 - QA, Polish, dan Dokumentasi

- [ ] Jalankan lint.
- [ ] Jalankan test.
- [ ] Jalankan build.
- [ ] Manual QA wilayah valid.
- [ ] Manual QA `adm4` invalid.
- [ ] Manual QA search no-result.
- [ ] Manual QA geolocation denied/unavailable.
- [ ] Manual QA cache fresh.
- [ ] Manual QA stale fallback bila BMKG failure bisa disimulasikan.
- [ ] Manual QA network/BMKG failure bila memungkinkan.
- [ ] Manual QA mobile viewport.
- [ ] Manual QA desktop viewport.
- [ ] Manual QA keyboard navigation untuk search dan tabs.
- [ ] Manual QA kontras glass cards.
- [ ] Periksa semua label sumber data BMKG.
- [ ] Periksa copy tidak menyebut "real-time" tanpa konteks data BMKG terbaru.
- [ ] Update README implementasi.
- [ ] Tambahkan catatan known limitations: dataset sample, cache in-memory, dan geolocation bergantung koordinat dataset.

Acceptance:

- Semua acceptance criteria MVP di `PRD.md` terpenuhi.
- Tidak ada issue kritis yang diketahui.
- Dokumentasi cara menjalankan aplikasi tersedia.
- Dokumen menjelaskan keterbatasan MVP dengan jujur.

## Phase 7 - Fitur Lanjutan Opsional

Kerjakan hanya setelah MVP selesai.

- [ ] Tambahkan lokasi favorit di localStorage.
- [ ] Tambahkan share URL per wilayah.
- [ ] Tambahkan peta wilayah.
- [ ] Tambahkan perbandingan beberapa wilayah.
- [ ] Tambahkan integrasi peringatan dini cuaca BMKG RSS/CAP XML.
- [ ] Tambahkan parser CAP XML.
- [ ] Tambahkan dashboard peringatan aktif per provinsi/kecamatan.
- [ ] Tambahkan mode bahasa Indonesia/English.
- [ ] Tambahkan PWA.
- [ ] Tambahkan notifikasi browser untuk peringatan dini.
- [ ] Tambahkan dataset `adm4` lengkap.
- [ ] Tambahkan proses import/validasi dataset lengkap.
- [ ] Ganti cache production ke Redis/Upstash atau database.

Acceptance:

- Fitur opsional tidak merusak flow MVP.
- Peringatan dini tetap mencantumkan sumber BMKG.
- Parser XML punya test fixture.
- Dataset lengkap tervalidasi dan tidak memperlambat search secara signifikan.

## Checklist Final Sebelum Serah ke User

- [ ] `PRD.md` tersedia dan sesuai produk.
- [ ] `DESIGN.md` tersedia dan menjadi sumber desain.
- [ ] `Guideline.md` tersedia dan preskriptif untuk agent.
- [ ] `Tasks.md` tersedia dan bisa dieksekusi bertahap.
- [ ] Endpoint BMKG resmi tercantum.
- [ ] Batas akses BMKG tercantum.
- [ ] Kewajiban atribusi BMKG tercantum.
- [ ] Arti "real-time" dijelaskan sebagai data terbaru BMKG plus metadata update/cache.
- [ ] Flow pengguna dan flow teknis jelas.
- [ ] Flow geolocation punya fallback.
- [ ] Acceptance criteria jelas.
- [ ] UI requirements sinkron dengan `DESIGN.md`.
- [ ] Testing dan manual QA mencakup data, API, cache, UI, dan error state.
- [ ] Prompt untuk HERMES AGENT tersedia.
