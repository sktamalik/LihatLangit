"use client";

/**
 * SectionDots — numbered navigation dots fixed on the right viewport edge.
 * Dot 1 = section 1, dot 2 = section 2, etc. Active section is highlighted;
 * clicking a dot smooth-scrolls to that section.
 */

interface SectionDef {
  id: string;
  label: string;
}

const SECTIONS: SectionDef[] = [
  { id: "hero", label: "Beranda" },
  { id: "app-preview", label: "Dashboard" },
  { id: "peta-cuaca", label: "Peta Cuaca" },
  { id: "features", label: "Prakiraan" },
  { id: "berita-bmkg", label: "Berita BMKG" },
];

interface SectionDotsProps {
  /** Currently visible section id (tracked by parent's IntersectionObserver). */
  active: string;
  /** Scroll to a section id. */
  onNavigate: (id: string) => void;
}

export default function SectionDots({ active, onNavigate }: SectionDotsProps) {
  return (
    <nav
      aria-label="Navigasi bagian"
      className="fixed right-3 md:right-4 top-1/2 -translate-y-1/2 z-[60] hidden md:flex flex-col items-center gap-2.5"
    >
      {SECTIONS.map((s, i) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            aria-label={s.label}
            aria-current={isActive ? "true" : undefined}
            title={s.label}
            className={`w-7 h-7 rounded-full text-[11px] font-bold font-body-sans flex items-center justify-center transition-all duration-200 cursor-pointer select-none border ${
              isActive
                ? "bg-primary-container text-white border-primary-container shadow-[0_2px_10px_rgba(255,90,34,0.4)] scale-110"
                : "bg-white text-text-muted border-outline-variant/50 hover:bg-primary-container/10 hover:text-primary-container hover:scale-105"
            }`}
          >
            {i + 1}
          </button>
        );
      })}
    </nav>
  );
}
