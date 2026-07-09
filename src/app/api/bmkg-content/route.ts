/**
 * GET /api/bmkg-content?type=siaran-pers|pengumuman|artikel
 *
 * Fetches BMKG content pages (siaran pers, pengumuman, artikel) by scraping.
 * Returns structured data: title, date, image, url.
 * Falls back to cached data if the scrape fails.
 */

import { NextRequest, NextResponse } from "next/server";

interface BmkgContent {
  title: string;
  date: string;
  dateDisplay: string;
  image: string;
  url: string;
}

const VALID_TYPES = ["siaran-pers", "pengumuman", "artikel"] as const;
type ContentType = (typeof VALID_TYPES)[number];

// In-memory cache per type
const cacheMap = new Map<string, { data: BmkgContent[]; fetchedAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const monthMap: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  Januari: "01", Februari: "02", Maret: "03", April: "04", Mei: "05", Juni: "06",
  Juli: "07", Agustus: "08", September: "09", Oktober: "10", November: "11", Desember: "12",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as ContentType | null;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Tipe tidak valid. Gunakan: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  const cached = cacheMap.get(type);

  // Return cache if fresh
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ data: cached.data, fromCache: true });
  }

  try {
    const html = await fetchBmkgPage(type);
    const articles = parseBmkgContent(html, type);

    if (articles.length > 0) {
      cacheMap.set(type, { data: articles, fetchedAt: Date.now() });
      return NextResponse.json({ data: articles, fromCache: false });
    }

    // Parse returned 0 articles — fall back to cache
    if (cached) {
      return NextResponse.json({ data: cached.data, fromCache: true });
    }

    return NextResponse.json({ data: [], fromCache: false });
  } catch {
    if (cached) {
      return NextResponse.json({ data: cached.data, fromCache: true });
    }
    return NextResponse.json({ data: [], fromCache: false });
  }
}

async function fetchBmkgPage(type: ContentType): Promise<string> {
  const url = `https://www.bmkg.go.id/${type}`;
  const res = await fetch(url, {
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

function parseBmkgContent(html: string, type: ContentType): BmkgContent[] {
  const articles: BmkgContent[] = [];

  // Match article blocks
  const articleRegex = /<article[^>]*>[\s\S]*?<\/article>/g;
  const articlesRaw = html.match(articleRegex) ?? [];

  for (const art of articlesRaw) {
    // Extract image — prefer full-size from img src
    const imgMatch = art.match(/<img[^>]*src="([^"]+)"/);
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

    articles.push({ title, date, dateDisplay: dateDisplay, image, url });
  }

  return articles;
}
