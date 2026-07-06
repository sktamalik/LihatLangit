"use client";
import type { WeatherForecast } from "@/types/weather";
import { formatTime } from "@/lib/time";
export default function TrendChart({forecast}:{forecast:WeatherForecast}){
  const today=forecast.days[0];if(!today||today.points.length===0)return null;
  const points=today.points;const n=points.length;
  const xS=n>1?(i:number)=>(i/(n-1))*W:()=>W/2;
  const temps=points.map(p=>p.temperatureC??25);const hums=points.map(p=>p.humidityPct??70);
  const minT=Math.min(...temps),maxT=Math.max(...temps),rangeT=Math.max(maxT-minT,1);
  const W=1000,H=200,P=10;
  const toY=(v:number,min:number,r:number)=>H-P-((v-min)/r)*(H-2*P);
  const tPath=points.map((_,i)=>`${i===0?"M":"L"}${xS(i)},${toY(temps[i],minT-1,rangeT+2)}`).join(" ");
  const hPath=points.map((_,i)=>`${i===0?"M":"L"}${xS(i)},${toY(hums[i],40,50)}`).join(" ");
  const li=Math.max(1,Math.floor(n/5));const tl=points.filter((_,i)=>i%li===0||i===n-1);
  return(
    <div className="w-full bg-white rounded-[16px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h3 className="font-body-sans text-[20px] font-semibold text-text-dark">Tren Cuaca 24 Jam</h3>
        <div className="flex items-center gap-4 text-[12px] font-body-sans text-on-surface-variant font-medium">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary-container"></div> Suhu</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#FDE047]"></div> Kelembapan</div>
        </div>
      </div>
      <div className="w-full h-[240px] relative mt-6">
        <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
          <defs><linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff5a22" stopOpacity="0.2"/><stop offset="100%" stopColor="#ff5a22" stopOpacity="0"/></linearGradient></defs>
          <path d={`${tPath} L${W},${H} L0,${H} Z`} fill="url(#tg2)"/>
          <path d={tPath} fill="none" stroke="#ff5a22" strokeWidth="3" strokeLinecap="round"/>
          <path d={hPath} fill="none" stroke="#FDE047" strokeWidth="2" strokeDasharray="8 8" strokeLinecap="round"/>
          {points.map((_,i)=>{if(n>12&&i%2!==0)return null;return(<circle key={`t${i}`} cx={xS(i)} cy={toY(temps[i],minT-1,rangeT+2)} r="5" fill="#ff5a22"/>);})}
        </svg>
        {n>0&&(<><div className="absolute top-[20px] left-0 text-[13px] text-primary-container font-bold bg-white px-2 rounded">{Math.round(temps[0])}°</div>
        <div className="absolute bottom-[20px] right-0 text-[13px] text-primary-container font-bold bg-white px-2 rounded">{Math.round(temps[n-1])}°</div></>)}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1 text-[13px] text-text-muted font-medium">{tl.map((p,i)=><span key={i}>{formatTime(p.localDateTime)}</span>)}</div>
      </div>
    </div>);
}
