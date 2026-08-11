import type { MetadataRoute } from "next";
import { INDONESIA_CITIES } from "@/data/indonesia-cities";
import { getSiteUrl, slugifyCity } from "@/lib/citySeo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const today = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: today,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cuaca`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Halaman SEO statis per kota — diindex Google (bukan query param ?adm4=)
  const cityPages: MetadataRoute.Sitemap = INDONESIA_CITIES.map((c) => ({
    url: `${baseUrl}/cuaca/${slugifyCity(c.name)}`,
    lastModified: today,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  return [...staticPages, ...cityPages];
}