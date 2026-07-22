/**
 * GET /api/warnings — list peringatan dini BMKG
 * GET /api/warnings?detail=<link> — detail CAP XML
 *
 * Uses fast-xml-parser for reliable XML parsing instead of fragile regex.
 */

import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

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

const XML_PARSER_OPTS = {
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  preserveOrder: false,
  trimValues: true,
  isArray: (name: string) =>
    ["item", "parameter", "area", "resource", "eventCode"].includes(name),
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const detailUrl = searchParams.get("detail");

  // ─── Detail CAP XML ───
  if (detailUrl) {
    try {
      const allowedHost = "bmkg.go.id";
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(detailUrl);
      } catch {
        return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
      }
      if (!parsedUrl.hostname.endsWith(allowedHost)) {
        return NextResponse.json({ error: "URL tidak diizinkan" }, { status: 400 });
      }
      const res = await fetch(detailUrl, { next: { revalidate: 300 } });
      if (!res.ok)
        return NextResponse.json(
          { error: "Gagal mengambil detail" },
          { status: 502 }
        );
      const xml = await res.text();

      const parser = new XMLParser(XML_PARSER_OPTS);
      const parsed = parser.parse(xml);
      const alert = parsed?.alert ?? {};

      const detail: WarningDetail = {
        identifier: alert.identifier ?? "",
        sent: alert.sent ?? "",
        event: alert.info?.event ?? alert.info?.[0]?.event ?? "",
        urgency: alert.info?.urgency ?? alert.info?.[0]?.urgency ?? "",
        severity: alert.info?.severity ?? alert.info?.[0]?.severity ?? "",
        certainty:
          alert.info?.certainty ?? alert.info?.[0]?.certainty ?? "",
        headline:
          alert.info?.headline ?? alert.info?.[0]?.headline ?? "",
        description:
          alert.info?.description ?? alert.info?.[0]?.description ?? "",
        effective:
          alert.info?.effective ?? alert.info?.[0]?.effective ?? "",
        expires:
          alert.info?.expires ?? alert.info?.[0]?.expires ?? "",
        senderName: alert.senderName ?? "",
        areaDesc:
          alert.info?.area?.areaDesc ??
          alert.info?.[0]?.area?.areaDesc ??
          "",
        web:
          alert.info?.web ?? alert.info?.[0]?.web ?? undefined,
        instruction:
          alert.info?.instruction ??
          alert.info?.[0]?.instruction ??
          undefined,
        contact:
          alert.info?.contact ?? alert.info?.[0]?.contact ?? undefined,
      };

      return NextResponse.json(detail);
    } catch {
      return NextResponse.json(
        { error: "Gagal memproses detail" },
        { status: 502 }
      );
    }
  }

  // ─── Daftar peringatan ───
  try {
    const res = await fetch("https://www.bmkg.go.id/alerts/nowcast/id", {
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ warnings: [] });

    const xml = await res.text();
    const parser = new XMLParser(XML_PARSER_OPTS);
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel ?? {};
    const items = channel.item ?? [];

    const warnings: WarningItem[] = items.map((item: Record<string, unknown>) => {
      const title = String(item.title ?? "");
      const regionMatch = title.match(/di (.+)$/);
      return {
        title: stripHtml(String(item.title ?? "")),
        description: stripHtml(String(item.description ?? "")).trim(),
        region: regionMatch ? regionMatch[1] : "",
        pubDate: String(item.pubDate ?? ""),
        link: String(item.link ?? ""),
        category: String(item.category ?? ""),
      };
    });

    return NextResponse.json({ warnings, total: warnings.length });
  } catch {
    return NextResponse.json({ warnings: [], total: 0 });
  }
}

/** Remove HTML tags from a string */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}
