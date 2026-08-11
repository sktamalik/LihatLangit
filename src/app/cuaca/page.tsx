import type { Metadata } from "next";
import Link from "next/link";
import { INDONESIA_CITIES } from "@/data/indonesia-cities";
import { slugifyCity, getSiteUrl, cityTitle, cityDescription, cityUrl } from "@/lib/citySeo";

export const metadata: Metadata = {
  title: "Cuaca Kota Besar Indonesia — Prakiraan BMKG Hari Ini",
  description:
    "Daftar cuaca kota besar Indonesia: Jakarta, Bandung, Surabaya, Medan, Makassar, Denpasar, dan 33 kota lainnya. Prakiraan cuaca per kota dari data resmi BMKG, diperbarui setiap 3 jam.",
  keywords: [
    "cuaca kota besar indonesia", "cuaca jakarta", "cuaca bandung", "cuaca surabaya",
    "cuaca medan", "cuaca makassar", "cuaca yogyakarta", "cuaca denpasar",
    "prakiraan cuaca indonesia", "cek cuaca", "cuaca hari ini",
  ],
  alternates: { canonical: `${getSiteUrl()}/cuaca` },
};

export default function CuacaIndexPage() {
  const byIsland = new Map<string, typeof INDONESIA_CITIES>();
  for (const c of INDONESIA_CITIES) {
    const list = byIsland.get(c.island) ?? [];
    list.push(c);
    byIsland.set(c.island, list);
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-5 md:px-8 py-12">
      <nav className="text-sm font-body-sans text-text-secondary mb-4">
        <Link href="/" className="hover:text-primary">Beranda</Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">Cuaca Kota</span>
      </nav>

      <h1 className="font-body-sans text-[28px] md:text-[36px] font-bold text-text-primary leading-tight">
        Cuaca Kota Besar Indonesia Hari Ini
      </h1>
      <p className="mt-2 font-body-sans text-text-secondary leading-relaxed max-w-3xl">
        Cek prakiraan cuaca {INDONESIA_CITIES.length} kota besar di Indonesia dari Sabang
        sampai Merauke. Setiap halaman cuaca kota menampilkan prakiraan 3 hari ke depan
        dari data resmi BMKG: suhu udara, kelembapan, kecepatan angin, dan peringatan
        dini cuaca — diperbarui setiap 3 jam.
      </p>

      {[...byIsland.entries()].map(([island, cities]) => (
        <section key={island} className="mt-10">
          <h2 className="font-body-sans text-[20px] font-bold text-text-primary">
            Cuaca Kota {island}
          </h2>
          <ul className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {cities.map((c) => (
              <li key={c.adm4}>
                <Link
                  href={`/cuaca/${slugifyCity(c.name)}`}
                  className="block card-surface rounded-[12px] px-4 py-3 font-body-sans text-text-primary hover:text-primary transition-colors"
                >
                  Cuaca {c.name}
                  <span className="block text-xs text-text-secondary">{c.province}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-10 text-xs font-body-sans text-text-secondary">
        Semua data prakiraan cuaca bersumber dari BMKG via{" "}
        <a className="text-primary" href="https://data.bmkg.go.id" rel="nofollow noopener" target="_blank">
          data.bmkg.go.id
        </a>.
        {cityTitle(INDONESIA_CITIES[0]) && ` Halaman contoh: ${cityUrl(INDONESIA_CITIES[0])}`}
      </p>
    </main>
  );
}