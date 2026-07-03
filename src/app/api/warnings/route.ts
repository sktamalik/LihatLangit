/**
 * GET /api/warnings — list peringatan dini BMKG
 * GET /api/warnings?detail=<link> — detail CAP XML
 */

import { NextRequest, NextResponse } from "next/server";

export type WarningItem = {
  title: string;
  description: string;
  region: string;
  pubDate: string;
  link: string;
  category: string;
};

export type WarningDetail = {
  identifier: string;
  sent: string;
  event: string;
  urgency: string;
  severity: string;
  certainty: string;
  headline: string;
  description: string;
  instruction?: string;
  effective: string;
  expires: string;
  senderName: string;
  areaDesc: string;
  web?: string;
  contact?: string;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const detailUrl = searchParams.get("detail");

  // ─── Detail CAP XML ───
  if (detailUrl) {
    try {
      const res = await fetch(detailUrl, { next: { revalidate: 300 } });
      if (!res.ok) return NextResponse.json({ error: "Gagal mengambil detail" }, { status: 502 });
      const xml = await res.text();

      const extract = (tag: string): string => {
        const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return match ? match[1].trim() : "";
      };

      const detail: WarningDetail = {
        identifier: extract("identifier"),
        sent: extract("sent"),
        event: extract("event"),
        urgency: extract("urgency"),
        severity: extract("severity"),
        certainty: extract("certainty"),
        headline: extract("headline"),
        description: extract("description"),
        effective: extract("effective"),
        expires: extract("expires"),
        senderName: extract("senderName"),
        areaDesc: extract("areaDesc"),
        web: extract("web") || undefined,
        contact: extract("contact") || undefined,
      };

      return NextResponse.json(detail);
    } catch {
      return NextResponse.json({ error: "Gagal memproses detail" }, { status: 502 });
    }
  }

  // ─── Daftar peringatan ───
  try {
    const res = await fetch("https://www.bmkg.go.id/alerts/nowcast/id", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ warnings: [] });

    const xml = await res.text();
    const warnings: WarningItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = item.match(/<title>(.*?)<\/title>/)?.[1] || "";
      const description = item.match(/<description>(.*?)<\/description>/)?.[1] || "";
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const category = item.match(/<category>(.*?)<\/category>/)?.[1] || "";
      const regionMatch = title.match(/di (.+)$/);
      const region = regionMatch ? regionMatch[1] : "";

      if (title) {
        warnings.push({
          title: title.replace(/<\/?[^>]+>/g, ""),
          description: description.replace(/<[^>]*>/g, "").trim(),
          region,
          pubDate,
          link,
          category,
        });
      }
    }

    return NextResponse.json({ warnings, total: warnings.length });
  } catch {
    return NextResponse.json({ warnings: [], total: 0 });
  }
}
