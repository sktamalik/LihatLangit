"use client";

/**
 * ScrollProgress — thin vertical progress bar on the right edge of the viewport.
 * Fills from top to bottom as the user scrolls the page.
 * Transform-only updates (rAF-throttled), pointer-events none (never blocks clicks).
 */

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        const pct = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
        setProgress(pct);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      className="fixed top-0 right-0 bottom-0 w-[3px] z-[60] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="w-full bg-primary-container"
        style={{ height: `${progress * 100}%`, transition: "height 80ms linear" }}
      />
    </div>
  );
}
