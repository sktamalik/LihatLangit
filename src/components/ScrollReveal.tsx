"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms sebelum animasi */
  delay?: number;
  /** Threshold (0-1) — seberapa banyak element visible sebelum trigger */
  threshold?: number;
}

/**
 * ScrollReveal — wrapper yang memicu animasi fade-in-up saat element discroll.
 * Menggunakan IntersectionObserver, hanya trigger sekali.
 */
export default function ScrollReveal({ children, className = "", delay = 0, threshold = 0.1 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Micro delay biar efeknya staggered
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}
