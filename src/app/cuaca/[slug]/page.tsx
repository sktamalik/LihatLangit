import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WeatherCityLive from "@/components/WeatherCityLive";
import {
  INDONESIA_CITIES,
} from "@/data/indonesia-cities";
import {
  slugifyCity,
  getCityBySlug,
  getSiteUrl,
  cityTitle,
  cityDescription,
  cityKeywords,
  cityFaq,
  cityJsonLd,
  cityUrl,
} from "@/lib/citySeo";

export const dynamicParams = false;

export function generateStaticParams() {
  return INDONESIA_CITIES.map((c) => ({ slug: slugifyCity(c.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return {};
  return {
    title: cityTitle(city),
    description: cityDescription(city),
    keywords: cityKeywords(city),
    alternates: { canonical: cityUrl(city) },
    openGraph: {
      title: cityTitle(city),
      description: cityDescription(city),
      url: cityUrl(city),
      siteName: "LihatLangit",
      locale: "id_ID",
      type: "website",
    },
  };
}

export default async function CityWeatherPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const faq = cityFaq(city);
  const others = INDONESIA_CITIES.filter((c) => c.adm4 !== city.adm4);

  return (
    <main className="w-full max-w-5xl mx-auto px-5 md:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cityJsonLd(city)) }}
      />
      <nav className="text-sm font-body-sans text-text-secondary mb-4">
        <Link href="/" className="hover:text-primary">Beranda</Link>
        <span className="mx-2">/</span>
        <Link href="/cuaca" className="hover:text-primary">Cuaca Kota</Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{city.name}</span>
      </nav>

      <h1 className="font-body-sans text-[28px] md:text-[36px] font-bold text-text-primary leading-tight">
        Cuaca {city.name} Hari Ini &amp; Besok
      </h1>
      <p className="mt-1 font-body-sans text-text-secondary">
        Prakiraan cuaca {city.name}, {city.province} — data resmi BMKG
      </p>

      <p className="mt-6 font-body-sans text-text-secondary leading-relaxed">
        Cek cuaca {city.name} hari ini secara gratis. LihatLangit menampilkan
        prakiraan cuaca {city.name} selama 3 hari ke depan dengan interval 3 jam,
        termasuk suhu udara, kelembapan, kecepatan angin, potensi hujan, dan
        peringatan dini cuaca ekstrem. Semua data cuaca {city.name} bersumber
        langsung dari BMKG dan diperbarui secara berkala.
      </p>

      <div className="mt-6">
        <WeatherCityLive adm4={city.adm4} city={city.name} />
      </div>

      <h2 className="mt-12 font-body-sans text-[22px] font-bold text-text-primary">
        Pertanyaan Umum tentang Cuaca {city.name}
      </h2>
      <div className="mt-4 grid gap-4">
        {faq.map((f) => (
          <div key={f.q} className="card-surface rounded-[16px] p-5">
            <h3 className="font-body-sans font-semibold text-text-primary">{f.q}</h3>
            <p className="mt-2 font-body-sans text-text-secondary leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 font-body-sans text-[22px] font-bold text-text-primary">
        Cuaca Kota Besar Lainnya di Indonesia
      </h2>
      <ul className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {others.map((c) => (
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

      <p className="mt-8 text-xs font-body-sans text-text-secondary">
        Sumber data: BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) via{" "}
        <a className="text-primary" href="https://data.bmkg.go.id" rel="nofollow noopener" target="_blank">
          data.bmkg.go.id
        </a>
        {" — "}
        {getSiteUrl()}
      </p>
    </main>
  );
}