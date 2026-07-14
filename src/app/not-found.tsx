"use client";
import Link from "next/link";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFoundPage() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center bg-[#eef5fc] overflow-hidden px-6 pt-[12vh] md:pt-[7vh]">
      {/* Lottie Animation */}
      <div className="w-full max-w-[280px] md:max-w-[400px] aspect-square">
        <DotLottieReact
          src="https://lottie.host/ec92a786-0eb8-47fc-ad7e-59350f80f312/HjvUjVcyaI.json"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Text & button */}
      <div className="flex flex-col items-center text-center -mt-4 md:-mt-6">
        <h1 className="font-body-sans text-xl md:text-3xl font-bold text-gray-900 mb-2">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-500 text-sm md:text-base mb-6 max-w-xs">
          Halaman yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 md:px-6 md:py-3 bg-gray-800 text-white rounded-full font-body-sans font-semibold hover:bg-gray-700 transition-colors shadow-md text-sm md:text-base"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
