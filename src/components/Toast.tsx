/**
 * Toast notification — auto-dismissing popup for success/error/info.
 * Positioned top-right with compact size.
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

const DURATION_MS = 4000;

const ACCENT_MAP: Record<ToastType, string> = {
  success: "bg-emerald-500",
  error: "bg-red-500",
  info: "bg-sky-500",
};

const BADGE_BG: Record<ToastType, string> = {
  success: "bg-emerald-100 text-emerald-600",
  error: "bg-red-100 text-red-600",
  info: "bg-sky-100 text-sky-600",
};

const ICON_MAP: Record<ToastType, string> = {
  success: "check_circle",
  error: "warning",
  info: "wb_sunny",
};

const PROGRESS_BG: Record<ToastType, string> = {
  success: "bg-emerald-300",
  error: "bg-red-300",
  info: "bg-sky-300",
};

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!toast) return;

    const showTimer = setTimeout(() => {
      setVisible(true);
      setProgress(100);
    }, 10);

    startTimeRef.current = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / DURATION_MS) * 100);
      setProgress(remaining);
    }, 30);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      if (progressRef.current) clearInterval(progressRef.current);
      timerRef.current = setTimeout(onDismiss, 300);
    }, DURATION_MS);

    return () => {
      clearTimeout(showTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [toast, onDismiss]);

  const handleClose = () => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setTimeout(onDismiss, 300);
  };

  if (!toast) return null;

  return (
    <div
      className={`fixed top-19 right-4 left-4 md:left-auto z-[9999] md:w-[340px] transition-all duration-300 select-none ${visible
        ? "opacity-100 translate-x-0"
        : "opacity-0 translate-x-8 pointer-events-none"
        }`}
    >
      <div className="relative bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
        {/* Accent bar */}
        <div className={`h-0.5 ${ACCENT_MAP[toast.type]}`} />

        {/* Content row */}
        <div className="flex items-start gap-2.5 px-3 pt-2.5 pb-1.5">
          {/* Icon badge */}
          <div
            className={`shrink-0 w-[30px] h-[30px] rounded-lg ${BADGE_BG[toast.type]} flex items-center justify-center`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {ICON_MAP[toast.type]}
            </span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[12px] font-semibold text-[#0c4a6e] font-geist leading-tight">
              {toast.type === "success" && "Berhasil"}
              {toast.type === "error" && "Gagal"}
              {toast.type === "info" && "Informasi"}
            </p>
            <p className="text-[11px] text-slate-500 font-geist mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            className="shrink-0 -mr-0.5 -mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mx-3 mb-2 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-[width] duration-100 ease-linear ${PROGRESS_BG[toast.type]}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
