"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef5fc] px-4">
      <div className="weather-card rounded-3xl p-10 max-w-md w-full text-center animate-fade-in-up">
        <span className="material-symbols-outlined text-[56px] text-primary mb-4">error_outline</span>
        <h1 className="font-geist text-2xl font-bold text-text-deep mb-2">Terjadi Kesalahan</h1>
        <p className="text-text-muted text-sm mb-6">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi.
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary text-white rounded-full font-geist font-semibold hover:bg-primary/90 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
