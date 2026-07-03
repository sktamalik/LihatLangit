import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LihatLangit — Prakiraan Cuaca Indonesia",
  description:
    "Dashboard prakiraan cuaca Indonesia berdasarkan data resmi BMKG. Cari wilayah hingga level desa/kelurahan dan dapatkan prakiraan 3 hari.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e0f2fe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geist.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-x-hidden">
        {/* Animated cloud decor */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {/* Cloud 1 — top */}
          <div className="absolute -top-4 left-0 animate-cloud opacity-0">
            <CloudShape />
          </div>
          {/* Cloud 2 — middle */}
          <div className="absolute top-1/3 left-0 animate-cloud-slow opacity-0" style={{ animationDelay: "-12s" }}>
            <CloudShapeSmall />
          </div>
          {/* Cloud 3 — lower */}
          <div className="absolute top-2/3 left-0 animate-cloud opacity-0" style={{ animationDelay: "-25s" }}>
            <CloudShape />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}

/** Decorative cloud shape made from overlapping circles */
function CloudShape() {
  return (
    <svg width="160" height="60" viewBox="0 0 160 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="40" rx="50" ry="20" fill="white" opacity="0.6" />
      <circle cx="40" cy="30" r="22" fill="white" opacity="0.6" />
      <circle cx="70" cy="28" r="18" fill="white" opacity="0.6" />
      <circle cx="55" cy="22" r="15" fill="white" opacity="0.55" />
    </svg>
  );
}

function CloudShapeSmall() {
  return (
    <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="26" rx="30" ry="14" fill="white" opacity="0.5" />
      <circle cx="25" cy="18" r="14" fill="white" opacity="0.5" />
      <circle cx="45" cy="16" r="12" fill="white" opacity="0.5" />
      <circle cx="35" cy="12" r="10" fill="white" opacity="0.45" />
    </svg>
  );
}
