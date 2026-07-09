"use client";

interface BmkgItem {
  title: string;
  date: string;
  dateDisplay: string;
  image: string;
  url: string;
}

/** Shared card grid for BMKG content sections */
export function BmkgCardGrid({
  title,
  data,
  linkUrl,
  linkLabel,
  icon,
}: {
  title: string;
  data: BmkgItem[];
  linkUrl: string;
  linkLabel: string;
  icon: string;
}) {
  const formatDate = (iso: string) => {
    if (!iso || iso.length < 10) return iso;
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const [, y, m, d] = iso.match(/^(\d{4})-(\d{2})-(\d{2})/) ?? [];
    if (!y) return iso;
    return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
  };

  return (
    <div className="w-full bg-white rounded-[16px] p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="font-body-sans text-[16px] sm:text-[18px] font-semibold text-text-dark">
          {title}
        </h3>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-container text-[10px] font-bold font-body-sans no-underline hover:bg-primary-container/20 transition-colors"
        >
          BMKG.go.id <span className="material-symbols-outlined text-[10px]">open_in_new</span>
        </a>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.slice(0, 9).map((item) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100 hover:shadow-[0_8px_32px_0px_rgba(100,116,139,0.15)] transition-all duration-300 no-underline"
          >
            <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-gray-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted bg-gray-50">
                  <span className="material-symbols-outlined text-[40px]">{icon}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1 p-4 gap-2">
              <span className="text-[11px] text-text-muted font-body-sans font-medium">
                {item.dateDisplay || formatDate(item.date)}
              </span>
              <h4 className="text-[13px] sm:text-[14px] font-semibold text-text-dark font-body-sans leading-snug group-hover:text-primary-container transition-colors line-clamp-3">
                {item.title}
              </h4>
              <div className="mt-auto pt-2">
                <span className="text-[11px] text-primary-container font-body-sans font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Baca selengkapnya
                  <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-center">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary-container/30 text-primary-container text-[13px] font-medium font-body-sans hover:bg-primary-container/5 transition-colors no-underline"
        >
          {linkLabel}
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
        </a>
      </div>
    </div>
  );
}

/** Skeleton loader */
export function BmkgSkeleton({ title }: { title: string }) {
  return (
    <div className="w-full bg-white rounded-[16px] p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="font-body-sans text-[16px] sm:text-[18px] font-semibold text-text-dark mb-4">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-gray-50 animate-pulse h-60" />
        ))}
      </div>
    </div>
  );
}

/** Error state */
export function BmkgError({
  title,
  onRetry,
}: {
  title: string;
  onRetry: () => void;
}) {
  return (
    <div className="w-full bg-white rounded-[16px] p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <h3 className="font-body-sans text-[16px] sm:text-[18px] font-semibold text-text-dark mb-4">{title}</h3>
      <div className="rounded-xl bg-error-container/30 p-6 text-center">
        <p className="text-[14px] text-on-error-container font-body-sans">
          Gagal memuat data.{" "}
          <button onClick={onRetry} className="underline font-semibold cursor-pointer">
            Coba lagi
          </button>
        </p>
      </div>
    </div>
  );
}
