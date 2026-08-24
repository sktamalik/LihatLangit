import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#eef5fc] px-6 text-center">
      <div className="mb-6 w-full max-w-[280px] md:max-w-[380px]">
        <svg viewBox="0 0 220 120" className="h-auto w-full" role="img" aria-label="Awan dan matahari">
          <circle cx="164" cy="38" r="24" fill="#FDE047" />
          <path
            d="M28 88c-11 0-20-9-20-20s9-20 20-20c2-15 15-27 31-27 13 0 24 8 29 19 3-1 7-2 10-2 14 0 25 11 25 25s-11 25-25 25H28Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="3"
          />
        </svg>
      </div>
      <h1 className="font-body-sans text-xl font-bold text-gray-900 md:text-3xl">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mb-6 mt-2 max-w-xs text-sm text-gray-500 md:text-base">
        Halaman yang Anda cari tidak tersedia.
      </p>
      <Link
        href="/"
        className="inline-block rounded-full bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-gray-700 md:px-6 md:py-3 md:text-base"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
