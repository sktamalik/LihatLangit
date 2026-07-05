import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef5fc] px-4">
      <div className="weather-card rounded-3xl p-10 max-w-md w-full text-center animate-fade-in-up">
        <span className="material-symbols-outlined text-[56px] text-primary mb-4">search_off</span>
        <h1 className="font-geist text-2xl font-bold text-text-deep mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-text-muted text-sm mb-6">
          Halaman yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 bg-primary text-white rounded-full font-geist font-semibold hover:bg-primary/90 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
