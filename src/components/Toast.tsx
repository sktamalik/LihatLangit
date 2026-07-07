/**
 * Toast notification — slide-down popup with progress bar.
 * Positioned top-center on mobile, top-right on desktop.
 */

"use client";

import { useEffect, useState, useRef } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

const DURATION_MS = 4500;
const ANIMATION_MS = 300;

const STYLES: Record<ToastType, {
  accent: string;
  iconBg: string;
  iconColor: string;
  progressBg: string;
  icon: string;
}> = {
  success: {
    accent: "border-l-emerald-500",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    progressBg: "bg-emerald-400",
    icon: "check_circle",
  },
  error: {
    accent: "border-l-red-500",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    progressBg: "bg-red-400",
    icon: "error",
  },
  info: {
    accent: "border-l-sky-500",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    progressBg: "bg-sky-400",
    icon: "info",
  },
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const onDismissRef = useRef(onDismiss);

  // Sync onDismiss ref — render-safe, no deps
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!toast) return;

    // Reset & animate in
    const frame = requestAnimationFrame(() => {
      setVisible(true);
      setProgress(100);
    });
    startTimeRef.current = Date.now();

    // Progress bar tick
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(remaining);
    }, 30);

    // Auto-dismiss via ref — stable regardless of parent re-renders
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const handleClose = () => {
    setVisible(false);
    if (dismissRef.current) clearTimeout(dismissRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setTimeout(() => onDismissRef.current(), ANIMATION_MS);
  };

  if (!toast) return null;

  const s = STYLES[toast.type];

  return (
    <div
      className={`fixed top-19 right-4 left-4 md:left-auto z-[9999] md:w-[380px] transition-all duration-300 select-none ${visible
        ? "opacity-100 translate-y-0"
        : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
    >
      <div
        className={`relative bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-100 border-l-[4px] ${s.accent}`}
      >
        {/* Content row */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-2">
          {/* Icon */}
          <div
            className={`shrink-0 w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center`}
          >
            <span className={`material-symbols-outlined text-[28px] ${s.iconColor}`}>
              {s.icon}
            </span>
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[14px] font-semibold text-slate-800 leading-snug">
              {toast.message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Tutup notifikasi"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-4 mb-3 h-[3px] bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${s.progressBg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
