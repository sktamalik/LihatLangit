"use client";
import type { WeatherForecast } from "@/types/weather";
const icons: Record<string,string>={"cerah":"clear_day","cerah berawan":"partly_cloudy_day","berawan":"cloudy","berawan tebal":"cloud","hujan ringan":"rainy_light","hujan sedang":"rainy","hujan lebat":"rainy_heavy","hujan petir":"thunderstorm"};
const iconColors: Record<string,string>={"cerah":"text-amber-400","cerah berawan":"text-amber-400","berawan":"text-slate-400","berawan tebal":"text-slate-500","hujan ringan":"text-sky-500","hujan sedang":"text-blue-500","hujan lebat":"text-blue-600","hujan petir":"text-purple-500"};
function gi(d:string){const k=Object.keys(icons).find(x=>d.toLowerCase().includes(x));return icons[k??""]??"partly_cloudy_day"}
function gc(d:string){const k=Object.keys(iconColors).find(x=>d.toLowerCase().includes(x));return iconColors[k??""]??"text-primary-container"}
function avg(points:{temperatureC:number|null}[]){const v=points.map(p=>p.temperatureC).filter((t):t is number=>t!==null);if(v.length===0)return{min:0,max:0};return{min:Math.round(Math.min(...v)),max:Math.round(Math.max(...v))}}
function avgH(points:{humidityPct:number|null}[]){const v=points.map(p=>p.humidityPct).filter((h):h is number=>h!==null);if(v.length===0)return 0;return Math.round(v.reduce((a,b)=>a+b,0)/v.length)}

export default function WeekForecast({forecast}:{forecast:WeatherForecast}){
  return(
    <div id="prakiraan-3-hari" className="bg-white rounded-[16px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant h-full flex flex-col">
      <h3 className="font-body-sans text-[20px] font-semibold text-text-dark mb-8">Prakiraan 3 Hari</h3>
      <div className="space-y-4 flex-grow flex flex-col justify-center">
        {forecast.days.map((day,idx)=>{const{min,max}=avg(day.points);const hum=avgH(day.points);
          return(
            <div key={day.date} className="flex items-center justify-between p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors border border-outline-variant/30 hover:border-outline-variant cursor-pointer">
              <span className={`text-[15px] font-medium w-24 font-body-sans ${idx===0?"text-primary-container font-bold":"text-text-dark"}`}>{day.label}</span>
              <span className={`material-symbols-outlined text-[24px] ${gc(day.points[0]?.weatherDescription??"")}`}>{gi(day.points[0]?.weatherDescription??"")}</span>
              <div className="flex items-center gap-2 w-24 justify-end"><span className="material-symbols-outlined text-[18px] text-primary-container">water_drop</span><span className="text-[15px] text-primary-container font-semibold">{hum}%</span></div>
              <div className="flex items-center gap-3 w-28 justify-end"><span className="text-[15px] text-text-muted">{min}°</span><span className="text-[15px] font-bold text-text-dark">{max}°</span></div>
            </div>);})}
      </div>
    </div>);
}
