import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lihatlangit.vercel.app");
const OG_IMAGE = `${SITE_URL}/Share.jpg?v=3`;
const TITLE = "LihatLangit | Prakiraan Cuaca Indonesia";
const DESCRIPTION = "Dashboard prakiraan cuaca Indonesia berdasarkan data resmi BMKG. Cari wilayah hingga level desa/kelurahan dan dapatkan prakiraan 3 hari.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), title: TITLE, description: DESCRIPTION,
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SITE_URL, siteName: "LihatLangit", images: [{ url: OG_IMAGE, secureUrl: OG_IMAGE, width: 1200, height: 630, alt: "LihatLangit — Prakiraan Cuaca Indonesia via BMKG" }], locale: "id_ID", type: "website" },
  twitter: { card: "summary_large_image", title: "LihatLangit", description: DESCRIPTION, images: [OG_IMAGE] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#E2F0F9" };

/* ═══ Cloud — single clean path with generous padding so edges never clip ═══ */
function CloudShape({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <path d="
          M 35 100
          C 25 100  18 92  18 82
          C 18 72  25 64  35 60
          C 38 45  52 32  70 30
          C 82 20  98 14  118 16
          C 132 14  150 18  160 30
          C 175 20  195 24  208 38
          C 220 48  225 65  215 78
          C 225 82  232 92  225 102
          C 218 110  205 112  190 108
          L 50 108
          C 38 110  30 106  35 100 Z
        " fill="white" opacity="0.9" />
      </svg>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
      </head>
      <body className="bg-background-sky text-text-dark font-body-sans antialiased min-h-screen flex flex-col relative">
        {/* Pixel Sun */}
        <div className="absolute top-24 right-[8%] w-24 h-24 z-0 rounded-full bg-[#FDE047] shadow-[0_0_40px_rgba(253,224,71,0.6)]" />

        {/* ═══ Clouds — overflow-visible agar tidak kepotong saat drifting ═══ */}
        <div className="fixed inset-0 pointer-events-none overflow-visible z-0">
          <CloudShape className="absolute top-16 right-[20%] w-40 h-20 opacity-80 hidden md:block animate-cloud-drift" />
          <CloudShape className="absolute top-52 left-[8%] w-48 h-24 opacity-80 hidden md:block animate-cloud-drift-slow" style={{ animationDelay: "5s" }} />
          <CloudShape className="absolute top-80 right-[8%] w-44 h-22 opacity-75 hidden lg:block animate-cloud-drift" style={{ animationDelay: "7s" }} />
          <CloudShape className="absolute top-28 left-[5%] w-34 h-16 opacity-70 hidden md:block animate-cloud-drift-slow" style={{ animationDelay: "3s" }} />
          <CloudShape className="absolute top-[20rem] right-[15%] w-46 h-22 opacity-75 hidden lg:block animate-cloud-drift" style={{ animationDelay: "10s" }} />
          <CloudShape className="absolute top-[36rem] left-[14%] w-42 h-20 opacity-80 hidden md:block animate-cloud-drift-slow" style={{ animationDelay: "13s" }} />
          <CloudShape className="absolute top-[50rem] right-[28%] w-36 h-18 opacity-60 hidden md:block animate-cloud-drift" style={{ animationDelay: "16s" }} />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
      </body>
    </html>
  );
}
