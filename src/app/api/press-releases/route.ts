/**
 * GET /api/press-releases
 *
 * Fetches the latest BMKG press releases (siaran pers) by scraping the
 * BMKG siaran-pers page. Returns structured data: title, date, image, url.
 *
 * Falls back to cached data if the scrape fails.
 */

import { NextResponse } from "next/server";

interface PressRelease {
  title: string;
  date: string;
  dateDisplay: string;
  image: string;
  url: string;
}

// In-memory cache
let cachedData: { data: PressRelease[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function GET() {
  // Return cache if fresh
  if (cachedData && Date.now() - cachedData.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ data: cachedData.data, fromCache: true });
  }

  try {
    const html = await fetchBMKGPage();
    const articles = parseBMKGPressReleases(html);

    if (articles.length > 0) {
      cachedData = { data: articles, fetchedAt: Date.now() };
      return NextResponse.json({ data: articles, fromCache: false });
    }

    // Parse returned 0 articles — fall back to cache if exists
    if (cachedData) {
      return NextResponse.json({ data: cachedData.data, fromCache: true });
    }

    // Return empty with no cache
    return NextResponse.json({ data: [], fromCache: false });
  } catch {
    // On error, return cached data if available
    if (cachedData) {
      return NextResponse.json({ data: cachedData.data, fromCache: true });
    }
    return NextResponse.json({ data: [], fromCache: false });
  }
}

async function fetchBMKGPage(): Promise<string> {
  const res = await fetch("https://www.bmkg.go.id/siaran-pers", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseBMKGPressReleases(html: string): PressRelease[] {
  const articles: PressRelease[] = [];

  // Match article blocks - use [\s\S] instead of . for dotall compatibility
  const articleRegex = /<article[^>]*>[\s\S]*?<\/article>/g;
  const articlesRaw = html.match(articleRegex) ?? [];

  const monthMap: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
    Januari: "01", Februari: "02", Maret: "03", April: "04", Mei: "05", Juni: "06",
    Juli: "07", Agustus: "08", September: "09", Oktober: "10", November: "11", Desember: "12",
  };

  for (const art of articlesRaw) {
    // Extract image
    const imgMatch = art.match(/src="([^"]+)"/);
    const image = imgMatch?.[1] ?? "";

    // Extract title
    const titleMatch = art.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/);
    const title = titleMatch?.[1]?.replace(/<[^>]+>/g, "").trim() ?? "";

    // Extract link
    const linkMatch = art.match(/href="([^"]+)"/);
    const slug = linkMatch?.[1] ?? "";
    const url = slug.startsWith("http") ? slug : `https://www.bmkg.go.id${slug}`;

    // Extract date from <time> tag
    const timeMatch = art.match(/<time[^>]*>(.*?)<\/time>/);
    const dateDisplay = timeMatch?.[1]?.trim() ?? "";

    if (!title || !url) continue;

    // Parse date to ISO
    const dateParts = dateDisplay.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
    let date = dateDisplay;
    if (dateParts) {
      const [, d, m, y] = dateParts;
      const mm = monthMap[m] ?? "01";
      date = `${y}-${mm}-${d.padStart(2, "0")}`;
    }

    articles.push({
      title,
      date,
      dateDisplay,
      image,
      url,
    });
  }

  return articles;
}
