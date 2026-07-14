"use client";

/** Skeleton bar with configurable width */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`bg-outline-variant/30 rounded animate-pulse-soft ${className}`} />;
}

/** Skeleton circle */
function Circle({ size = "w-10 h-10" }: { size?: string }) {
  return <div className={`${size} bg-outline-variant/30 rounded-full animate-pulse-soft shrink-0`} />;
}

/** Skeleton card wrapper */
function Card({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] ${className}`}>{children}</div>;
}

export default function WeatherLoadingState() {
  return (
    <div className="w-full space-y-8 animate-fade-in-up">
      {/* ── App preview dashboard skeleton ── */}
      <Card className="p-6 md:p-8">
        <div className="flex items-center gap-4 mb-6">
          <Bar className="h-5 w-32" />
          <Bar className="h-5 w-24" />
        </div>
        {/* Location + temp badge */}
        <div className="border border-outline-variant/20 rounded-lg p-4 flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Circle />
            <div>
              <Bar className="h-4 w-36 mb-2" />
              <Bar className="h-3 w-24" />
            </div>
          </div>
          <Bar className="h-8 w-16 rounded-md" />
        </div>
        {/* 3-day mini preview */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg p-3.5 flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <Circle size="w-6 h-6" />
              <div>
                <Bar className="h-4 w-20 mb-1" />
                <Bar className="h-3 w-24" />
              </div>
            </div>
            <Bar className="h-4 w-16" />
          </div>
        ))}
      </Card>

      {/* ── Peta skeleton ── */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bar className="h-5 w-48" />
          <Bar className="h-4 w-32" />
          <div className="flex-1" />
          <Bar className="h-4 w-20" />
        </div>
        <Bar className="w-full h-[400px] sm:h-[500px] rounded-lg" />
        <div className="flex items-center gap-3 mt-3">
          <Bar className="h-8 w-32 rounded-full" />
          <Bar className="h-3 w-48" />
          <div className="flex-1" />
          <Bar className="h-3 w-24" />
        </div>
      </Card>

      {/* ── Dashboard cards skeleton ── */}
      <div className="flex flex-col gap-8">
        {/* Title */}
        <Bar className="h-6 w-64 mx-auto" />

        {/* TrendChart */}
        <Card className="p-5 md:p-6">
          <Bar className="h-5 w-36 mb-1" />
          <Bar className="h-3 w-56 mb-4" />
          <Bar className="w-full h-[120px] md:h-[160px] rounded-lg" />
        </Card>

        {/* WeatherSummary */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <Circle size="w-10 h-10" />
              <div>
                <Bar className="h-3 w-24 mb-1" />
                <Bar className="h-4 w-32" />
              </div>
            </div>
            <Bar className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-start gap-4 mb-4">
            <Circle size="w-16 h-16" />
            <div>
              <Bar className="h-12 w-24 mb-1" />
              <Bar className="h-4 w-28" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 bg-outline-variant/10 rounded-xl p-3">
                <Circle size="w-5 h-5" />
                <div>
                  <Bar className="h-3 w-16 mb-1" />
                  <Bar className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* WeekForecast */}
        <Card className="p-5 md:p-6">
          <Bar className="h-5 w-36 mb-1" />
          <Bar className="h-3 w-64 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3">
              <div className="flex items-center gap-3">
                <Bar className="h-4 w-16" />
                <Circle size="w-6 h-6" />
                <Bar className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-4">
                <Bar className="h-4 w-16" />
                <Bar className="h-4 w-12" />
                <Bar className="h-4 w-12" />
                <Bar className="h-4 w-12" />
              </div>
              <Bar className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </Card>

        {/* 4 metric cards in grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Bar className="h-5 w-36 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Bar className="h-4 w-20" />
                    <Bar className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* HourlyForecast + CommunityReports row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-4 md:p-5">
            <Bar className="h-5 w-36 mb-4" />
            <div className="flex gap-2.5 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1 w-[70px]">
                  <Bar className="h-3 w-10" />
                  <Circle size="w-6 h-6" />
                  <Bar className="h-4 w-8" />
                </div>
              ))}
            </div>
            <Bar className="h-4 w-32 mx-auto mt-3" />
          </Card>
          <Card className="p-4 md:p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Bar className="h-5 w-32 mb-2" />
                <Bar className="h-3 w-24" />
              </div>
              <Bar className="h-6 w-16 rounded-full" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3 px-2">
                <Circle size="w-5 h-5" />
                <Bar className="h-4 w-14" />
                <div className="flex-1" />
                <Bar className="h-4 w-24" />
                <Bar className="h-3 w-12" />
              </div>
            ))}
          </Card>
        </div>

        {/* WarningBanner skeleton */}
        <Card className="p-4 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Circle size="w-2 h-2" />
              <Bar className="h-5 w-52" />
            </div>
            <div className="flex items-center gap-3">
              <Bar className="h-4 w-16" />
              <Bar className="h-6 w-28 rounded-lg" />
              <Bar className="h-4 w-12" />
            </div>
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="bg-outline-variant/10 rounded-xl p-4 mb-2 flex items-start gap-3">
              <Circle size="w-4 h-4" />
              <div className="flex-1">
                <Bar className="h-4 w-32 mb-1" />
                <Bar className="h-3 w-64 mb-1" />
                <Bar className="h-3 w-20" />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
