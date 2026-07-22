// Server component — rendered at build time so Googlebot sees static HTML.
// Visually hidden but accessible to crawlers and screen readers.
export default function SeoContent() {
  return (
    <section
      aria-label="Informasi LihatLangit"
      className="sr-only"
    >
      <h1>LihatLangit — Cek Cuaca Indonesia Real-Time dari BMKG</h1>
      <p>
        LihatLangit adalah aplikasi web gratis untuk cek cuaca Indonesia secara real-time.
        Semua data prakiraan cuaca bersumber langsung dari BMKG (Badan Meteorologi,
        Klimatologi, dan Geofisika) — sumber resmi cuaca Indonesia. Cari cuaca hingga
        level desa/kelurahan di seluruh Indonesia dari Sabang sampai Merauke.
      </p>

      <h2>Fitur Cek Cuaca Indonesia</h2>
      <ul>
        <li>Prakiraan cuaca 3 hari ke depan dengan interval 3 jam</li>
        <li>Pencarian cuaca per kota, kecamatan, dan desa/kelurahan</li>
        <li>Peta cuaca interaktif untuk 40+ kota besar Indonesia</li>
        <li>Peringatan dini cuaca ekstrem dan nowcast BMKG real-time</li>
        <li>Indeks UV, kelembapan udara, kecepatan angin, tekanan udara</li>
        <li>Kondisi laut: tinggi gelombang dan arah angin laut</li>
        <li>Informasi waktu terbit dan terbenam matahari serta fase bulan</li>
        <li>Berita dan siaran pers terkini dari BMKG</li>
      </ul>

      <h2>Cuaca Kota Besar Indonesia</h2>
      <p>
        Cek prakiraan cuaca untuk kota-kota besar Indonesia: cuaca Jakarta, cuaca Bandung,
        cuaca Surabaya, cuaca Yogyakarta, cuaca Medan, cuaca Makassar, cuaca Denpasar
        (Bali), cuaca Semarang, cuaca Palembang, dan cuaca Balikpapan — semua tersedia
        dengan data akurat dari BMKG.
      </p>

      <h2>Pertanyaan Umum tentang Cuaca Indonesia</h2>

      <h3>Bagaimana cara cek cuaca hari ini di Indonesia?</h3>
      <p>
        Buka LihatLangit dan ketik nama kota atau desa di kolom pencarian. Aplikasi akan
        menampilkan cuaca hari ini beserta prakiraan 3 hari ke depan dengan data langsung
        dari BMKG, termasuk suhu udara, kondisi langit, kelembapan, dan kecepatan angin.
      </p>

      <h3>Apakah prakiraan cuaca BMKG akurat?</h3>
      <p>
        BMKG menggunakan sistem pemodelan cuaca numerik dan jaringan stasiun pengamatan
        di seluruh Indonesia. Prakiraan BMKG adalah sumber data cuaca resmi dan paling
        akurat untuk kondisi iklim tropis Indonesia, diperbarui secara berkala setiap hari.
      </p>

      <h3>Apa itu nowcast BMKG?</h3>
      <p>
        Nowcast BMKG adalah peringatan dini cuaca ekstrem jangka pendek (0–2 jam ke depan)
        yang dikeluarkan oleh BMKG. LihatLangit menampilkan nowcast BMKG secara real-time
        agar pengguna dapat mengantisipasi hujan lebat, angin kencang, atau cuaca berbahaya
        di wilayah mereka.
      </p>

      <h3>Cuaca besok di kota saya bagaimana?</h3>
      <p>
        LihatLangit menampilkan prakiraan cuaca besok dan lusa dengan data per 3 jam dari
        BMKG. Cari nama kota atau wilayah kamu untuk melihat prediksi cuaca lengkap
        termasuk suhu, kemungkinan hujan, kecepatan angin, dan kondisi langit.
      </p>

      <h2>Tentang Sumber Data BMKG</h2>
      <p>
        BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) adalah lembaga pemerintah
        Indonesia yang bertugas mengamati dan mendistribusikan informasi cuaca resmi.
        LihatLangit mengakses data BMKG secara langsung melalui API publik BMKG di
        data.bmkg.go.id, memastikan informasi cuaca yang ditampilkan selalu akurat dan
        terkini.
      </p>
    </section>
  );
}
