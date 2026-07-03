# Guideline - Implementasi LihatLangit untuk HERMES AGENT

Dokumen ini berisi aturan kerja untuk agent saat merancang dan membangun LihatLangit. Ikuti bersama `PRD.md`, `DESIGN.md`, dan `Tasks.md`.

## 1. Prinsip Produk

1. Produk adalah dashboard cuaca, bukan landing page.
2. Tujuan utama: membantu pengguna memantau prakiraan cuaca wilayahnya masing-masing berdasarkan data BMKG.
3. "Real-time" berarti menampilkan data BMKG terbaru yang tersedia beserta status waktu dan cache, bukan data sensor langsung.
4. Data cuaca utama wajib berasal dari BMKG.
5. Tampilkan atribusi BMKG secara jelas di UI.
6. Jangan membuat prediksi sendiri atau mengubah makna data BMKG.
7. Semua integrasi eksternal harus punya loading, empty, error, dan fallback state.
8. Bangun MVP dulu, lalu fitur lanjutan.
9. Gunakan "LihatLangit" sebagai nama aplikasi; jangan menampilkan aplikasi sebagai aplikasi resmi BMKG.

## 2. Sumber Kebenaran Dokumen

Urutan rujukan:

1. `PRD.md` menentukan scope produk, data, acceptance criteria, dan non-functional requirements.
2. `DESIGN.md` menentukan sistem visual, komponen UI, warna, tipografi, layout, dan tone.
3. `Guideline.md` menentukan aturan implementasi teknis dan perilaku agent.
4. `Tasks.md` menentukan urutan eksekusi.

Bila ada konflik:

- Untuk visual/UI, ikuti `DESIGN.md`.
- Untuk sumber data dan compliance, ikuti `PRD.md` dan aturan BMKG.
- Untuk urutan kerja, ikuti `Tasks.md` kecuali ada dependensi teknis yang jelas.

## 3. Aturan Integrasi BMKG

Endpoint prakiraan:

```text
GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah_tingkat_iv}
```

Aturan wajib:

- Request ke BMKG dilakukan dari backend/API route aplikasi.
- Jangan memanggil endpoint BMKG langsung dari komponen frontend utama.
- Validasi `adm4` sebelum request.
- Gunakan timeout maksimal 10 detik.
- Gunakan cache agar tidak melewati batas 60 request/menit/IP.
- Tampilkan `analysis_date` bila tersedia.
- Tampilkan `fetchedAt` dari aplikasi.
- Bila field BMKG kosong, tampilkan fallback seperti `-`, bukan error mentah.
- Bila BMKG gagal dan cache terakhir tersedia, tampilkan cache dengan label jelas.
- Jangan mengarang endpoint pencarian BMKG yang tidak ada di dokumentasi.

Regex `adm4`:

```regex
^\d{2}\.\d{2}\.\d{2}\.\d{4}$
```

## 4. Strategi Cache

MVP:

- Gunakan in-memory cache keyed by `adm4`.
- TTL default: 1 jam.
- Simpan stale cache sampai 24 jam untuk fallback.

Production-ready:

- Gunakan Redis/Upstash atau database.
- Key disarankan: `weather:bmkg:adm4:{adm4}`.
- Simpan `payload`, `analysisDateUtc`, `fetchedAt`, `expiresAt`, dan `staleUntil`.

Perilaku cache:

1. Cache fresh: langsung balikan data, `fromCache=true`, `isStale=false`.
2. Cache stale dan BMKG sukses: refresh cache, `fromCache=false`, `isStale=false`.
3. Cache stale dan BMKG gagal: balikan stale cache, `fromCache=true`, `isStale=true`.
4. Tidak ada cache dan BMKG gagal: balikan error UI-friendly.

Label UI:

- Fresh cache: boleh tampil sebagai "Diambil aplikasi ..." dengan status normal.
- Stale cache: tampilkan "Data cadangan" dan waktu data.
- Jangan menyembunyikan status stale.

## 5. API Internal yang Disarankan

### 5.1 Get Weather

```text
GET /api/weather?adm4=31.71.03.1001
```

Respons sukses:

```json
{
  "source": "BMKG",
  "region": {
    "adm4": "31.71.03.1001",
    "province": "DKI Jakarta",
    "city": "Jakarta Pusat",
    "district": "Kemayoran",
    "village": "Kemayoran",
    "latitude": -6.16,
    "longitude": 106.85,
    "timezone": "Asia/Jakarta"
  },
  "analysisDateUtc": "2026-07-03T00:00:00Z",
  "fetchedAt": "2026-07-03T02:30:00+08:00",
  "fromCache": false,
  "isStale": false,
  "nearestPoint": null,
  "days": []
}
```

Respons error:

```json
{
  "error": {
    "code": "BMKG_UNAVAILABLE",
    "message": "Data BMKG belum dapat diambil. Coba beberapa saat lagi."
  }
}
```

Kode error minimal:

- `INVALID_ADM4`
- `REGION_NOT_FOUND`
- `BMKG_TIMEOUT`
- `BMKG_UNAVAILABLE`
- `BMKG_INVALID_RESPONSE`
- `RATE_LIMITED`
- `EMPTY_FORECAST`

### 5.2 Search Regions

```text
GET /api/regions?q=kemayoran
```

Aturan:

- Search boleh dari file JSON lokal.
- Debounce input frontend minimal 250 ms.
- Return maksimal 10-20 hasil.
- Ranking hasil: desa exact match, kecamatan, kota/kabupaten, provinsi.
- Hasil harus menyertakan `adm4`.
- Jangan hardcode hasil pencarian langsung di komponen UI.

### 5.3 Nearest Region

Untuk tombol "Gunakan lokasi", implementasi MVP boleh dilakukan di frontend dengan dataset yang sudah memiliki `latitude` dan `longitude`, atau lewat API internal:

```text
GET /api/regions/nearest?lat=-6.16&lon=106.85
```

Aturan:

- Minta izin geolocation hanya setelah user menekan tombol.
- Jangan menyimpan koordinat user tanpa fitur favorit/izin eksplisit.
- Jika dataset belum punya match layak, tampilkan fallback ke search manual.
- Validasi range latitude dan longitude bila memakai API internal.

## 6. Dataset Wilayah

BMKG membutuhkan kode `adm4`. Karena endpoint pencarian wilayah tidak disediakan sebagai API pencarian umum, aplikasi harus menyediakan dataset kode wilayah sendiri.

MVP:

- Buat `regions-adm4.sample.json`.
- Isi minimal 10-30 wilayah contoh dari kota besar atau wilayah target user.
- Pastikan setiap item punya `adm4`, `province`, `city`, `district`, dan `village`.
- Tambahkan `latitude`, `longitude`, dan `timezone` bila ingin mendukung "Gunakan lokasi".

Lanjutan:

- Import dataset kode wilayah administrasi tingkat IV sesuai acuan Kemendagri.
- Buat proses validasi duplikat `adm4`.
- Buat proses validasi koordinat bila fitur nearest-region dipakai.
- Jangan menaruh dataset besar langsung di komponen UI.

Format:

```json
[
  {
    "adm4": "31.71.03.1001",
    "province": "DKI Jakarta",
    "city": "Jakarta Pusat",
    "district": "Kemayoran",
    "village": "Kemayoran",
    "latitude": -6.16,
    "longitude": 106.85,
    "timezone": "Asia/Jakarta"
  }
]
```

## 7. Normalisasi Data

Buat fungsi khusus, misalnya `normalizeBmkgForecast(raw)`, yang mengubah struktur BMKG menjadi model internal.

Aturan:

- Jangan render langsung `raw.data[0].cuaca` di UI.
- Tangani `cuaca` sebagai array hari yang berisi array slot prakiraan.
- Sort slot berdasarkan `local_datetime`.
- Kelompokkan data per tanggal lokal.
- Konversi angka dengan aman. Bila gagal, gunakan `null`.
- Preserve `weather_desc`, `weather_desc_en`, dan `image`.
- Preserve `analysis_date`.
- Bila `lokasi` tidak lengkap, fallback ke dataset region bila tersedia.

Pilih slot "cuaca terdekat":

1. Parse `local_datetime`.
2. Gunakan timezone lokasi bila tersedia.
3. Cari slot pertama yang waktunya >= waktu lokal wilayah.
4. Jika semua slot sudah lewat, gunakan slot terakhir yang tersedia.
5. Jika tidak ada slot valid, set `nearestPoint=null` dan tampilkan empty/error state yang sesuai.

## 8. UI dan UX

### 8.1 Tampilan Utama

Tampilan utama wajib berupa dashboard sesuai `DESIGN.md`:

- Header sederhana dengan nama "LihatLangit".
- Search wilayah sebagai aksi utama.
- Tombol "Gunakan lokasi" di search bar.
- Panel ringkasan cuaca terdekat.
- Tab/segmented control untuk Hari 1, Hari 2, Hari 3.
- Timeline slot prakiraan per 3 jam.
- Area metadata sumber dan update.
- Empty state saat belum memilih wilayah.
- Error state saat integrasi atau input gagal.

Komponen wajib:

- `RegionSearch`
- `WeatherSummary`
- `ForecastTimeline`
- `ForecastCard`
- `SourceAttribution`
- `EmptyState`
- `WeatherErrorState`
- `WeatherLoadingState`

### 8.2 Design Direction Wajib

Ikuti `DESIGN.md`:

- Arah visual: Airy Modernism.
- Gaya: minimalisme + glassmorphism terkontrol.
- Background: langit terang, bukan putih polos total.
- Cards: white translucent sekitar 80%, backdrop blur 12px, border terang low-contrast.
- Shadow: ambient blue shadow yang halus.
- Radius: cards `rounded-xl`, buttons/input `rounded-lg`.
- Primary action: `#006591`.
- Accent hangat `#F59E0B` hanya untuk cuaca cerah, temperatur puncak, atau warning.
- Heading dan data utama memakai Geist.
- Body memakai Inter.
- Temperatur utama memakai style `display-temp`.

Larangan UI:

- Jangan membuat hero marketing besar.
- Jangan membuat halaman penuh copy promosi.
- Jangan membuat dekorasi yang mengalahkan data cuaca.
- Jangan membuat glass effect yang mengurangi kontras teks.
- Jangan menaruh kartu besar di dalam kartu besar.
- Jangan menampilkan data dummy sebagai data utama setelah integrasi BMKG tersedia.

Responsive:

- Mobile: search di atas, ringkasan, metadata, lalu timeline.
- Desktop: 12-column grid, max-width sekitar 1200px.
- Ringkasan cuaca boleh menjadi panel kiri atau top summary dominan.
- Timeline desktop memakai grid/list lebar.
- Timeline mobile boleh horizontal scroll atau stack, asal jam dan metrik tetap terbaca.

Accessibility:

- Semua ikon cuaca punya alt text dari `weather_desc`.
- Kontras teks cukup di atas glass surface.
- Search dan tombol bisa digunakan dengan keyboard.
- Loading dan error state punya teks yang dapat dibaca screen reader.
- Respect `prefers-reduced-motion`.

## 9. Copywriting

Aturan copy:

- Gunakan "prakiraan", bukan "kepastian".
- Gunakan "Sumber data: BMKG".
- Gunakan "Diperbarui BMKG" untuk `analysis_date`.
- Gunakan "Diambil aplikasi" untuk `fetchedAt`.
- Gunakan "Data cadangan" saat `isStale=true`.
- Gunakan "Cari wilayahmu untuk memulai" untuk empty state.
- Hindari klaim "cuaca real-time" tanpa konteks; gunakan "data terbaru BMKG".

Contoh label:

- `Suhu`
- `Kelembapan`
- `Angin`
- `Awan`
- `Jarak pandang`
- `Hari ini`
- `Besok`
- `Lusa`
- `Coba lagi`
- `Ganti wilayah`

## 10. Testing Requirements

Minimal unit/integration test:

- Validasi regex `adm4`.
- Search region dari dataset lokal.
- Ranking search region.
- Nearest region bila fitur "Gunakan lokasi" diimplementasikan.
- Normalisasi fixture respons BMKG.
- Handling field kosong.
- Pemilihan nearest forecast point.
- Cache fresh/stale behavior.
- API route mengembalikan error untuk `adm4` invalid.
- Mapping error BMKG ke error internal.

Manual QA:

- Pilih wilayah valid dan pastikan data tampil.
- Refresh halaman, pastikan cache bekerja.
- Simulasikan BMKG gagal, pastikan fallback cache atau error tampil.
- Cek geolocation ditolak dan fallback search manual.
- Cek tampilan mobile.
- Cek tampilan desktop.
- Cek atribusi BMKG terlihat.
- Cek loading, empty, error, dan stale state.
- Cek teks tidak overflow di card dan button.

## 11. Logging dan Observability

Log server-side:

- Request BMKG dimulai.
- Request BMKG berhasil, termasuk durasi.
- Request BMKG gagal, termasuk status/error.
- Cache hit/miss/stale.
- Invalid response.
- Rate limit internal.

Jangan log:

- Koordinat user dari geolocation kecuali dibutuhkan untuk debugging lokal dan tidak dikirim ke production log.
- Data pribadi pengguna.
- Stack trace penuh ke client.

## 12. Definition of Done

Sebuah task dianggap selesai bila:

- Implementasi sesuai PRD.
- UI sesuai `DESIGN.md` untuk area yang disentuh.
- Error state tersedia.
- Test relevan lulus.
- Tidak melanggar batasan BMKG.
- Atribusi BMKG terlihat bila data BMKG dipakai.
- Tidak ada hardcoded data cuaca palsu di UI utama.
- Loading, empty, error, dan stale state ditangani.
- Dokumentasi diperbarui bila kontrak API, model data, atau UX berubah.

## 13. Prompt Lengkap untuk HERMES AGENT

Gunakan prompt ini untuk memulai implementasi:

```text
Anda adalah HERMES AGENT yang bertugas membangun LihatLangit, website dashboard prakiraan cuaca Indonesia berbasis data resmi BMKG.

Baca dan patuhi dokumen berikut:
1. PRD.md
2. DESIGN.md
3. Guideline.md
4. Tasks.md

Tujuan:
Bangun aplikasi web bernama LihatLangit yang memungkinkan pengguna mencari wilayah Indonesia sampai level desa/kelurahan menggunakan kode adm4, lalu menampilkan data terbaru BMKG yang tersedia: ringkasan cuaca terdekat dan prakiraan 3 hari dengan interval 3 jam.

Sumber data utama:
GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={kode_wilayah_tingkat_iv}

Ketentuan BMKG yang wajib dipatuhi:
- Data format JSON.
- Prakiraan 3 hari, interval 3 jam.
- Update BMKG 2 kali sehari.
- Limit 60 request per menit per IP.
- Wajib menampilkan atribusi BMKG sebagai sumber data.

Instruksi teknis:
- Gunakan API internal server-side untuk memanggil BMKG.
- Jangan request BMKG langsung dari browser.
- Validasi adm4 dengan regex ^\d{2}\.\d{2}\.\d{2}\.\d{4}$.
- Implementasikan cache server-side minimal 1 jam dan stale fallback.
- Normalisasi respons BMKG ke model internal sebelum dirender UI.
- Buat pencarian wilayah dari dataset adm4 lokal.
- Implementasikan tombol "Gunakan lokasi" dengan browser geolocation bila dataset koordinat tersedia; fallback ke search manual bila gagal.
- Jangan mengarang endpoint pencarian BMKG yang tidak ada di dokumentasi.
- Tampilkan error state untuk invalid adm4, wilayah tidak ditemukan, BMKG timeout, data kosong, stale cache, dan response tidak valid.
- Tampilkan metadata analysis_date, fetchedAt, status cache, dan sumber BMKG.

UI yang harus dibuat:
- Dashboard sebagai layar pertama, bukan landing page.
- Ikuti DESIGN.md: Airy Modernism, glassmorphism terkontrol, sky-blue palette, Geist/Inter, cards transparan, spacing lega, dan desain mobile/desktop rapi.
- Search wilayah sebagai aksi utama dengan tombol "Gunakan lokasi".
- Ringkasan cuaca terdekat.
- Timeline prakiraan 3 hari per 3 jam.
- Kartu prakiraan dengan suhu, kelembapan, kondisi cuaca, angin, tutupan awan, jarak pandang, dan ikon.
- Area atribusi "Sumber data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)".

Prioritas pekerjaan:
Ikuti urutan Tasks.md dari Phase 0 sampai Phase 6. Jangan mulai fitur opsional seperti peta, PWA, notifikasi, atau peringatan dini sebelum MVP selesai dan acceptance criteria terpenuhi.

Definition of Done:
- Data benar-benar berasal dari endpoint BMKG.
- Dashboard bekerja untuk minimal beberapa wilayah sample adm4.
- Cache dan validasi berjalan.
- Test normalisasi, validasi adm4, search region, cache, dan API route tersedia.
- UI sesuai DESIGN.md.
- Atribusi BMKG terlihat.
- Tidak ada data cuaca dummy di UI utama setelah integrasi selesai.
```
