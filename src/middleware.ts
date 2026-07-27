/**
 * Edge Middleware — rate limiter untuk API weather.
 *
 * Berjalan di Vercel Edge Network (bukan serverless functions),
 * sehingga state Map lebih persisten (lebih sedikit instance).
 *
 * Rate limit: 30 request per IP per 60 detik.
 * Hanya aktif untuk /api/weather routes.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Edge Runtime — state survives across requests in the same edge instance
const rateLimitMap = new Map<string, RateLimitEntry>();

// Periodic cleanup setiap 5 menit mencegah memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now >= entry.resetAt) rateLimitMap.delete(ip);
  }
}, 300_000).unref?.();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya rate-limit API weather
  if (!pathname.startsWith("/api/weather")) {
    return NextResponse.next();
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (entry && now < entry.resetAt) {
    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message:
              "Terlalu banyak permintaan. Silakan coba lagi beberapa saat.",
          },
        },
        { status: 429 }
      );
    }
  } else {
    // Reset entry — window baru
    rateLimitMap.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
