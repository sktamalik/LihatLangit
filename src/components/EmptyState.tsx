/**
 * Empty state — shown when no region is selected yet.
 * Displays a soft cloud/sun illustration with a friendly invitation to search.
 */

"use client";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in-up">
      {/* Decorative sun & cloud illustration */}
      <div className="relative mb-8 w-40 h-40">
        {/* Sun */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-amber-300 opacity-70 animate-float" />
        {/* Sun glow */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-amber-200 opacity-30 blur-xl" />
        {/* Cloud */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-14 rounded-full bg-white/90 shadow-inner" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 h-12 rounded-full bg-white/90 -translate-x-6" />
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-24 h-12 rounded-full bg-white/90 translate-x-6" />
      </div>

      {/* Text */}
      <h2 className="text-headline-lg font-semibold text-text-deep mb-2 font-geist">
        Cari wilayahmu untuk memulai
      </h2>
      <p className="text-body-md text-text-muted max-w-md text-center">
        Ketik nama desa/kelurahan, kecamatan, kota, atau provinsi untuk melihat
        prakiraan cuaca terbaru dari BMKG.
      </p>
    </div>
  );
}
