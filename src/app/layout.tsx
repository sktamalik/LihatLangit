import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://lihatlangit.vercel.app");
const OG_IMAGE = `${SITE_URL}/Share.jpg?v=3`;
const TITLE = "LihatLangit — Cek Cuaca Indonesia Real-Time dari BMKG";
const DESCRIPTION = "Cek cuaca Indonesia terkini dengan LihatLangit. Prakiraan cuaca akurat berdasarkan data resmi BMKG untuk seluruh wilayah Indonesia. Cari cuaca hingga level desa/kelurahan, lihat prakiraan 3 hari, peringatan dini, dan peta interaktif.";
const KEYWORDS = [
  "cuaca", "cek cuaca", "lihat langit", "prakiraan cuaca", "info cuaca",
  "cuaca hari ini", "cuaca besok", "cuaca Indonesia", "BMKG",
  "prakiraan cuaca BMKG", "cuaca Jakarta", "cuaca Bandung", "cuaca Surabaya",
  "cuaca Yogyakarta", "cuaca Medan", "cuaca Makassar", "cuaca Bali",
  "cuaca Denpasar", "cuaca Semarang", "cuaca Palembang",
  "suhu udara", "kelembapan udara", "kecepatan angin",
  "peringatan dini cuaca", "nowcast BMKG", "cuaca ekstrem",
  "info BMKG terkini", "aplikasi cuaca Indonesia", "dashboard cuaca",
  "cuaca online", "ramalan cuaca", "prediksi cuaca",
  "cuaca per kecamatan", "cuaca per desa", "weather Indonesia",
  "Indonesian weather forecast", "BMKG weather",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s | LihatLangit — Cek Cuaca Indonesia" },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  authors: [{ name: "Sktamalik_", url: "https://github.com/sktamalik" }],
  creator: "Sktamalik_",
  publisher: "LihatLangit",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  icons: { icon: "/Favicon.png", apple: "/apple-touch-icon.png" },
  openGraph: {
    title: TITLE, description: DESCRIPTION, url: SITE_URL, siteName: "LihatLangit",
    images: [{ url: OG_IMAGE, secureUrl: OG_IMAGE, width: 1200, height: 630, alt: "LihatLangit — Cek Prakiraan Cuaca Indonesia via BMKG" }],
    locale: "id_ID", type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
  verification: { google: "5ywu7PYLNVvs2SJ9jze6BegvNwztPKdcyOoKoWYiMBU" },
  alternates: { canonical: SITE_URL },
  category: "weather",
  classification: "Weather Forecast Indonesia",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#E2F0F9" };

/* ═══ Bird shape — 3 titik: sayap kiri, badan, sayap kanan, dengan animasi kepak ═══ */
function BirdShape({ className, style }: { className: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      <svg viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="animate-wing">
        <path d="
          M 2 22
          Q 15 4  30 14
          Q 45 4  58 22
          Q 45 10  30 18
          Q 15 10  2 22 Z
        " fill="#1a1a2e" opacity="0.65" />
      </svg>
    </div>
  );
}

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "LihatLangit",
                "url": SITE_URL,
                "description": DESCRIPTION,
                "applicationCategory": "WeatherApplication",
                "operatingSystem": "Web",
                "browserRequirements": "Modern browser with JavaScript",
                "author": { "@type": "Person", "name": "Sktamalik_" },
                "offers": { "@type": "Offer", "price": "0", "priceCurrency": "IDR" },
                "keywords": "cuaca, cek cuaca, lihat langit, prakiraan cuaca BMKG, weather Indonesia",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "LihatLangit",
                "url": SITE_URL,
                "description": DESCRIPTION,
                "inLanguage": "id",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/?q={search_term_string}` },
                  "query-input": "required name=search_term_string",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "LihatLangit",
                "url": SITE_URL,
                "logo": `${SITE_URL}/Headericon.png`,
                "description": "Dashboard prakiraan cuaca Indonesia berbasis data resmi BMKG.",
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Apa itu LihatLangit?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "LihatLangit adalah aplikasi web gratis untuk cek cuaca Indonesia secara real-time. Data prakiraan cuaca bersumber langsung dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika), sumber resmi cuaca Indonesia. Pengguna dapat mencari cuaca hingga level desa/kelurahan di seluruh wilayah Indonesia.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Bagaimana cara cek cuaca di LihatLangit?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Ketik nama kota, kecamatan, atau desa/kelurahan di kolom pencarian. LihatLangit akan menampilkan prakiraan cuaca 3 hari ke depan dengan interval 3 jam, termasuk suhu udara, kelembapan, kecepatan angin, dan kondisi langit. Data diperbarui secara berkala dari API resmi BMKG.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Apakah data cuaca LihatLangit akurat?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Ya. Semua data cuaca di LihatLangit bersumber langsung dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) — lembaga pemerintah resmi yang bertanggung jawab atas prakiraan cuaca di Indonesia. Data mencakup prakiraan cuaca, peringatan dini cuaca ekstrem, dan nowcast BMKG.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Kota dan wilayah mana saja yang tersedia di LihatLangit?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "LihatLangit mencakup seluruh wilayah Indonesia dari Sabang sampai Merauke, termasuk Jakarta, Bandung, Surabaya, Yogyakarta, Medan, Makassar, Denpasar (Bali), Semarang, Palembang, dan ribuan desa/kelurahan lainnya. Pencarian tersedia hingga level administrasi terkecil (ADM4).",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Apakah LihatLangit gratis?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Ya, LihatLangit sepenuhnya gratis tanpa biaya berlangganan. Tidak perlu membuat akun atau login untuk menggunakan semua fitur termasuk prakiraan cuaca, peta interaktif, peringatan dini, dan informasi lingkungan.",
                    },
                  },
                  {
                    "@type": "Question",
                    "name": "Apa perbedaan LihatLangit dengan aplikasi cuaca lainnya?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "LihatLangit menggunakan data resmi BMKG sehingga prakiraan cuaca lebih relevan untuk kondisi Indonesia dibanding aplikasi berbasis data internasional. Fitur unggulan meliputi pencarian hingga level desa/kelurahan, peta cuaca interaktif 40+ kota, peringatan dini BMKG real-time, kondisi laut, indeks UV, dan berita BMKG terkini.",
                    },
                  },
                ],
              },
            ]),
          }}
        />
      </head>
      <body className="bg-background-sky text-text-dark font-body-sans antialiased min-h-screen flex flex-col relative">
        {/* Pixel Sun — floating up/down */}
        <div className="absolute top-24 right-[8%] w-24 h-24 z-0 rounded-full bg-[#FDE047] shadow-[0_0_40px_rgba(253,224,71,0.6)] animate-float-sun" />

        {/* ═══ Clouds — overflow-visible agar tidak kepotong saat drifting ═══ */}
        <div className="fixed inset-0 pointer-events-none overflow-visible z-0">
          <CloudShape className="absolute top-16 right-[20%] w-40 h-20 opacity-80 hidden md:block animate-cloud-drift" />
          <CloudShape className="absolute top-52 left-[8%] w-48 h-24 opacity-80 hidden md:block animate-cloud-drift-slow" style={{ animationDelay: "5s" }} />
          <CloudShape className="absolute top-80 right-[8%] w-44 h-22 opacity-75 hidden lg:block animate-cloud-drift" style={{ animationDelay: "7s" }} />
          <CloudShape className="absolute top-28 left-[5%] w-34 h-16 opacity-70 hidden md:block animate-cloud-drift-slow" style={{ animationDelay: "3s" }} />
          <CloudShape className="absolute top-[20rem] right-[15%] w-46 h-22 opacity-75 hidden lg:block animate-cloud-drift" style={{ animationDelay: "10s" }} />
          <CloudShape className="absolute top-[36rem] left-[14%] w-42 h-20 opacity-80 hidden md:block animate-cloud-drift-slow" style={{ animationDelay: "13s" }} />
          <CloudShape className="absolute top-[50rem] right-[28%] w-36 h-18 opacity-60 hidden md:block animate-cloud-drift" style={{ animationDelay: "16s" }} />

          {/* ═══ Birds — flying across the sky ═══ */}
          <BirdShape className="absolute top-48 right-[20%] w-14 h-7 opacity-70 hidden md:block animate-bird-fly" style={{ animationDelay: "0s" }} />
          <BirdShape className="absolute top-72 left-[10%] w-12 h-6 opacity-60 hidden md:block animate-bird-fly" style={{ animationDelay: "4s", animationDuration: "10s" }} />
          <BirdShape className="absolute top-30 right-[30%] w-10 h-5 opacity-50 hidden lg:block animate-bird-fly" style={{ animationDelay: "8s", animationDuration: "12s" }} />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">{children}</div>
      </body>
    </html>
  );
}
