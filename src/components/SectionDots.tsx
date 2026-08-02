"use client";

/**
 * SectionDots — navigation dots fixed on the right viewport edge, one per section.
 * Active section (scroll-spy) is a solid orange dot; inactive are hollow gray.
 * Clicking a dot smooth-scrolls to that section.
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
      className="fixed right-3 md:right-4 top-1/2 -translate-y-1/2 z-[60] hidden md:flex flex-col items-center gap-3"
    >
      {SECTIONS.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onNavigate(s.id)}
            aria-label={s.label}
            aria-current={isActive ? "true" : undefined}
            title={s.label}
            className={`rounded-full transition-all duration-200 cursor-pointer ${
              isActive
                ? "w-3 h-3 bg-primary-container shadow-[0_0_8px_rgba(255,90,34,0.6)]"
                : "w-2 h-2 border border-text-muted/60 hover:border-primary-container hover:bg-primary-container/20"
            }`}
          />
        );
      })}
    </nav>
  );
}
