/**
 * SEO helpers untuk halaman kota (app/cuaca/[slug]).
 * Memberi title/description/keywords/FAQ unik per kota agar muncul
 * di pencarian long-tail "cuaca [kota] hari ini" dll.
 */

import { INDONESIA_CITIES, type IndonesiaCity } from "@/data/indonesia-cities";

export const SITE_URL_DEFAULT = "https://lihatlangitt.my.id";

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL_DEFAULT;
}

export function slugifyCity(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function getCityBySlug(slug: string): IndonesiaCity | undefined {
  return INDONESIA_CITIES.find((c) => slugifyCity(c.name) === slug);
}

export function cityUrl(city: IndonesiaCity): string {
  return `${getSiteUrl()}/cuaca/${slugifyCity(city.name)}`;
}

export function cityTitle(city: IndonesiaCity): string {
  return `Cuaca ${city.name} Hari Ini & Besok — Prakiraan BMKG ${city.province}`;
}

export function cityDescription(city: IndonesiaCity): string {
  return `Cek cuaca ${city.name} hari ini, besok, dan lusa. Prakiraan cuaca ${city.name} ${city.province} dari data resmi BMKG — suhu udara, kelembapan, kecepatan angin, dan peringatan dini cuaca.`;
}

export function cityKeywords(city: IndonesiaCity): string[] {
  const n = city.name.toLowerCase();
  return [
    `cuaca ${n}`,
    `prakiraan cuaca ${n}`,
    `cuaca ${n} hari ini`,
    `cuaca ${n} besok`,
    `cek cuaca ${n}`,
    `suhu ${n}`,
    `cuaca ${city.province.toLowerCase()}`,
    "prakiraan cuaca BMKG",
    "cuaca Indonesia",
    "cuaca hari ini",
  ];
}

/** FAQ unik per kota — pertanyaan natural sesuai pola pencarian pengguna */
export function cityFaq(city: IndonesiaCity): Array<{ q: string; a: string }> {
  const n = city.name;
  const prov = city.province;
  return [
    {
      q: `Bagaimana cuaca di ${n} hari ini?`,
      a: `Cuaca ${n} hari ini dapat dicek secara real-time di LihatLangit. Data prakiraan cuaca ${n} bersumber langsung dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) dan diperbarui berkala — mencakup suhu udara, kondisi langit, kelembapan, dan kecepatan angin.`,
    },
    {
      q: `Berapa suhu udara di ${n} sekarang?`,
      a: `Suhu udara terkini di ${n}, ${prov} ditampilkan langsung dari data BMKG. Anda bisa melihat suhu per 3 jam untuk hari ini, besok, dan lusa lengkap dengan suhu minimum dan maksimum harian di halaman cuaca ${n}.`,
    },
    {
      q: `Apakah ${n} akan hujan hari ini?`,
      a: `LihatLangit menampilkan prakiraan kondisi cuaca ${n} per 3 jam dari BMKG, termasuk potensi hujan ringan, sedang, atau lebat serta peringatan dini cuaca ekstrem dan nowcast BMKG untuk wilayah ${n}, ${prov}.`,
    },
    {
      q: `Bagaimana prakiraan cuaca ${n} besok?`,
      a: `Prakiraan cuaca ${n} besok tersedia lengkap di LihatLangit: suhu minimum dan maksimum, kondisi langit per 3 jam, kelembapan udara, dan kecepatan angin — semua bersumber dari data resmi BMKG untuk ${prov}.`,
    },
    {
      q: `Dari mana data cuaca ${n} berasal?`,
      a: `Semua data cuaca ${n} di LihatLangit bersumber langsung dari API publik BMKG (data.bmkg.go.id) — lembaga pemerintah resmi Indonesia untuk prakiraan cuaca, sehingga data yang ditampilkan akurat dan terpercaya.`,
    },
  ];
}

/** JSON-LD terstruktur per halaman kota: BreadcrumbList + FAQPage + ItemList kota lain */
export function cityJsonLd(city: IndonesiaCity): object[] {
  const url = cityUrl(city);
  const site = getSiteUrl();
  const faq = cityFaq(city);
  const others = INDONESIA_CITIES.filter((c) => c.adm4 !== city.adm4).slice(0, 12);

  return [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "LihatLangit", item: site },
        { "@type": "ListItem", position: 2, name: `Cuaca ${city.name}`, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Cuaca Kota Besar Indonesia`,
      numberOfItems: others.length,
      itemListElement: others.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Cuaca ${c.name}`,
        url: cityUrl(c),
      })),
    },
  ];
}