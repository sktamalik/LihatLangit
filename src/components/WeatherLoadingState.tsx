"use client";
export default function WeatherLoadingState(){return(
  <div className="space-y-6 animate-fade-in-up">
    <div className="bg-white rounded-[16px] p-8 shadow-sm"><div className="h-5 w-40 bg-outline-variant/30 rounded animate-pulse-soft mb-4"/><div className="h-[200px] bg-surface-container-low rounded-lg animate-pulse-soft"/></div>
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-5"><div className="bg-white rounded-[16px] p-8 h-64 animate-pulse-soft"/></div>
      <div className="md:col-span-7"><div className="bg-white rounded-[16px] p-8 h-64 animate-pulse-soft"/></div>
    </div>
  </div>);
}
