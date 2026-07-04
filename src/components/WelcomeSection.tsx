/**
 * Welcome Section — section sambutan di bagian atas halaman.
 * Menyatu dengan section lainnya dalam satu halaman penuh.
 */

"use client";

interface WelcomeSectionProps {
  onExplore: () => void;
  onGeolocate: () => void;
  isGeolocating: boolean;
}

export default function WelcomeSection({ onExplore, onGeolocate, isGeolocating }: WelcomeSectionProps) {
  return (
    <section className="w-full relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#fef9c3] via-[#bae6fd] to-[#e0f2fe] min-h-[500px] md:min-h-[600px] flex items-center justify-center">
      {/* Decorative blurs */}
      <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sky-200/20 blur-3xl" />

      {/* Sun */}
      <div className="absolute top-12 right-[15%] w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-2xl shadow-amber-400/40 animate-float-slow" />
      <div className="absolute top-14 right-[15.5%] w-24 h-24 rounded-full bg-amber-200/30 blur-xl" />
      <div className="absolute top-8 right-[13%] w-36 h-36 rounded-full bg-amber-300/10 blur-3xl animate-pulse-slow" />

      {/* Clouds */}
      <div className="absolute top-20 left-[6%] opacity-80 animate-float-delayed">
        <svg width="150" height="65" viewBox="0 0 180 70" fill="none">
          <ellipse cx="55" cy="48" rx="50" ry="20" fill="white" opacity="0.9" />
          <circle cx="45" cy="35" r="22" fill="white" opacity="0.9" />
          <circle cx="75" cy="32" r="18" fill="white" opacity="0.9" />
          <circle cx="58" cy="25" r="16" fill="white" opacity="0.85" />
        </svg>
      </div>
      <div className="absolute top-40 right-[8%] opacity-70 animate-float-slower">
        <svg width="120" height="50" viewBox="0 0 150 55" fill="none">
          <ellipse cx="45" cy="38" rx="40" ry="16" fill="white" opacity="0.85" />
          <circle cx="36" cy="28" r="18" fill="white" opacity="0.85" />
          <circle cx="62" cy="26" r="14" fill="white" opacity="0.85" />
        </svg>
      </div>
      <div className="absolute bottom-20 left-[15%] opacity-60 animate-float">
        <svg width="100" height="40" viewBox="0 0 130 45" fill="none">
          <ellipse cx="38" cy="32" rx="35" ry="13" fill="white" opacity="0.75" />
          <circle cx="30" cy="22" r="15" fill="white" opacity="0.75" />
          <circle cx="52" cy="20" r="12" fill="white" opacity="0.75" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-16 md:py-20 max-w-3xl">
        <div className="mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[40px] text-primary">cloud</span>
          </div>
        </div>

        <h1 className="font-geist text-4xl md:text-5xl lg:text-6xl font-bold text-text-deep leading-tight mb-4 tracking-tight">
          Selamat Datang di
          <span className="text-primary block mt-1">LihatLangit</span>
        </h1>

        <p className="text-base md:text-lg text-text-muted max-w-xl mb-8 font-inter leading-relaxed">
          Pantau prakiraan cuaca hingga level desa/kelurahan di seluruh Indonesia.
          Data resmi dan terpercaya dari <strong className="text-primary">BMKG</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={onExplore} className="px-8 py-3 bg-primary text-white rounded-full font-geist text-label-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary/90 transition-all duration-300 active:scale-95">
            <span className="flex items-center gap-2">
              Mulai Jelajahi Cuaca
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </span>
          </button>
          <button onClick={onGeolocate} disabled={isGeolocating} className="px-8 py-3 bg-white/70 backdrop-blur-sm text-primary rounded-full font-geist text-label-sm font-semibold border border-white/60 shadow-sm hover:bg-white/90 hover:shadow-md transition-all duration-300 active:scale-95 disabled:opacity-50">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              {isGeolocating ? "Mencari..." : "Gunakan Lokasi Saya"}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {[
            { icon: "search", label: "Cari Wilayah" },
            { icon: "location_on", label: "Deteksi Lokasi" },
            { icon: "calendar_month", label: "Prakiraan 3 Hari" },
            { icon: "show_chart", label: "Tren Cuaca" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1.5 px-3.5 py-2 bg-white/60 backdrop-blur-sm rounded-full text-text-muted text-sm font-geist shadow-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
