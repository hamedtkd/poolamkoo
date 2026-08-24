"use client";
import { useId } from "react";

export function AllocationDonut({ segments, size=210, stroke=26 }: { segments:Array<{label:string;value:number;color?:string}>; size?:number; stroke?:number }) {
  const id=useId(); const r=(size-stroke)/2; const c=2*Math.PI*r; const gap=5; let offset=0;
  return <div className="relative grid place-items-center" style={{width:size,height:size}}><svg width={size} height={size} className="-rotate-90 overflow-visible"><defs><filter id={id}><feDropShadow dx="0" dy="3" stdDeviation="5" floodOpacity=".08"/></filter></defs>{segments.map((s,i)=>{const len=Math.max(0,c*(s.value/100)-gap);const dash=`${len} ${c-len}`;const dashOffset=-offset;offset+=c*(s.value/100);const colors=["var(--chart-3)","var(--chart-2)","var(--chart-1)"];return <circle key={s.label} cx={size/2} cy={size/2} r={r} fill="none" stroke={s.color||colors[i%colors.length]} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={dashOffset} filter={`url(#${id})`} className="transition-all duration-500"/>})}</svg><div className="absolute inset-0 grid place-items-center text-center"><div><div className="type-page-title">۱۰۰٪</div><div className="mt-1 text-[10px] text-muted-foreground">تقسیم پول</div></div></div></div>;
}
