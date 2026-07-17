/**
 * Search notification — muncul saat user mencari cuaca suatu desa/kecamatan.
 * Bottom-center di HP, bottom-right di desktop, auto-hilang setelah 3 detik.
 */

"use client";

import { useEffect, useState, useRef } from "react";

export interface SearchNotifState {
  village: string;
  district: string;
}

interface SearchNotifProps {
  notif: SearchNotifState | null;
  onDismiss: () => void;
}

const DURATION_MS = 3000;
const ANIMATION_MS = 250;

export default function SearchNotif({ notif, onDismiss }: SearchNotifProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!notif) return;

    // Reset & animasi masuk
    const frame = requestAnimationFrame(() => {
      setVisible(true);
      setProgress(100);
    });
    startTimeRef.current = Date.now();

    // Progress bar tick — menyusut
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(remaining);
    }, 30);

    // Auto-dismiss
    dismissRef.current = setTimeout(() => {
      setVisible(false);
      if (progressRef.current) clearInterval(progressRef.current);
      dismissRef.current = setTimeout(() => onDismissRef.current(), ANIMATION_MS);
    }, DURATION_MS);

    return () => {
      cancelAnimationFrame(frame);
      if (dismissRef.current) clearTimeout(dismissRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [notif]);

  if (!notif) return null;

  return (
    <div
      className={`fixed bottom-5 left-0 right-0 mx-auto w-[calc(100%-2rem)] max-w-sm md:mx-0 md:left-auto md:right-6 md:bottom-6 z-[9999] transition-all duration-250 select-none ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="relative bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden border border-primary-container/20">
        <div className="flex items-center gap-3 px-4 py-3.5">
          {/* Icon lingkaran checklist */}
          <div className="shrink-0 w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF5A22" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l2 2 4-4" />
            </svg>
          </div>

          {/* Teks notif */}
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 leading-snug">
              Menampilkan cuaca
            </p>
            <p className="text-[12px] text-on-surface-variant truncate leading-snug">
              {notif.village}, {notif.district}
            </p>
          </div>
        </div>

        {/* Progress bar bawah */}
        <div className="mx-4 mb-2.5 h-[3px] bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-container transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
