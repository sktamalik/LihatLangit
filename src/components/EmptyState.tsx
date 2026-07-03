/**
 * Empty state — centered illustration of sun behind cloud.
 * Uses overlapping circles for geometric consistency per DESIGN.md.
 * Inviting Geist heading: "Cari wilayahmu untuk memulai."
 */

"use client";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-fade-in-up">
      {/* Sun and cloud illustration - overlapping circles per DESIGN.md */}
      <div className="relative mb-8 w-44 h-44" aria-hidden="true">
        {/* Sun glow */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-amber-200 opacity-20 blur-2xl" />
        {/* Sun — perfect circle */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-sun-accent opacity-80 animate-float" />
        {/* Sun inner highlight */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-amber-200 opacity-40" />

        {/* Cloud — overlapping circles per DESIGN.md */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          {/* Cloud body */}
          <div className="w-36 h-6 rounded-full bg-white/95 shadow-sm" />
          {/* Cloud bumps */}
          <div className="absolute -top-4 -left-2 w-16 h-12 rounded-full bg-white/95 shadow-sm" />
          <div className="absolute -top-5 left-5 w-14 h-12 rounded-full bg-white/95 shadow-sm" />
          <div className="absolute -top-3 left-14 w-12 h-10 rounded-full bg-white/95 shadow-sm" />
          <div className="absolute -top-4 left-20 w-14 h-12 rounded-full bg-white/95 shadow-sm" />
        </div>
      </div>

      {/* Heading per DESIGN.md */}
      <h2 className="font-geist text-headline-lg font-semibold text-text-deep text-center leading-tight">
        Cari wilayahmu untuk memulai
      </h2>
      <p className="text-body-md text-text-muted text-center max-w-md mt-2 font-inter">
        Ketik nama desa/kelurahan, kecamatan, kota, atau provinsi untuk melihat
        prakiraan cuaca terbaru dari BMKG.
      </p>
    </div>
  );
}
