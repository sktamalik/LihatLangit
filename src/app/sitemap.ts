import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lihatlangit.vercel.app";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 1.0,
    },
  ];

  // Dynamic region pages — add major cities for SEO
  const majorRegions = [
    "31.71.03.1001", // Jakarta Pusat
    "32.73.01.1001", // Bandung
    "35.78.01.1001", // Surabaya
    "34.71.01.1001", // Yogyakarta
    "12.71.01.1001", // Medan
    "73.71.01.1001", // Makassar
    "51.71.01.1001", // Denpasar
    "33.74.01.1001", // Semarang
    "16.71.01.1001", // Palembang
    "64.71.01.1001", // Balikpapan
  ];

  const regionPages = majorRegions.map((adm4) => ({
    url: `${baseUrl}/?adm4=${adm4}`,
    lastModified: new Date(),
    changeFrequency: "hourly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...regionPages];
}
