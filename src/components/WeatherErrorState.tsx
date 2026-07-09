"use client";
import type { ErrorCode } from "@/types/weather";
const ei:Record<string,string>={BMKG_TIMEOUT:"wifi_off",BMKG_UNAVAILABLE:"cloud_off",BMKG_INVALID_RESPONSE:"warning",EMPTY_FORECAST:"inbox",INVALID_ADM4:"description",REGION_NOT_FOUND:"search_off",RATE_LIMITED:"sync"};
export default function WeatherErrorState({code,message,onRetry}:{code:ErrorCode;message:string;onRetry?:()=>void}){return(
  <div className="card-surface rounded-[12px] p-8 md:p-10 flex flex-col items-center text-center animate-fade-in-up">
    <span className="material-symbols-outlined text-[48px] text-primary mb-4">{ei[code]??"warning"}</span>
    <h3 className="font-body-sans text-[20px] font-semibold text-text-primary mb-2">
      {code==="BMKG_TIMEOUT"&&"Koneksi Terputus"}
      {code==="BMKG_UNAVAILABLE"&&"Data Tidak Tersedia"}
      {code==="EMPTY_FORECAST"&&"Data Kosong"}
      {(!["BMKG_TIMEOUT","BMKG_UNAVAILABLE","EMPTY_FORECAST"].includes(code))&&"Terjadi Kesalahan"}
    </h3>
    <p className="text-text-secondary max-w-md mb-6 font-body-sans text-[14px] leading-relaxed">
      {code==="EMPTY_FORECAST" ? (
        <>
          BMKG belum memiliki data prakiraan untuk desa/kelurahan ini.
          {" "}Coba cari <strong>kota/kecamatan</strong> terdekat yang lebih besar untuk melihat data cuaca.
        </>
      ) : code==="BMKG_UNAVAILABLE" ? (
        <>
          Data BMKG untuk wilayah ini sedang tidak tersedia. Mungkin kode wilayah ini tidak tercakup dalam layanan prakiraan BMKG.
          {" "}Coba cari <strong>kota</strong> atau <strong>kecamatan</strong> terdekat.
        </>
      ) : message}
    </p>
    {onRetry&&<button onClick={onRetry} className="px-6 py-2.5 bg-primary text-white rounded-md font-body-sans text-sm font-semibold hover:bg-primary/90 transition-transform hover:scale-[1.02] cursor-pointer">Coba lagi</button>}
  </div>);
}
