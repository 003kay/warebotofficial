import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type ModernSelectOption = { label: string; value: string; hint?: string };

export function ModernSelect({ value, options, onChange, disabled = false, placeholder = "Select…" }: { value: string; options: ModernSelectOption[]; onChange: (value: string) => void; disabled?: boolean; placeholder?: string }) {
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const selected=options.find(option=>option.value===value);
  useEffect(()=>{function close(event:MouseEvent){if(!root.current?.contains(event.target as Node))setOpen(false)}document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close)},[]);

  return <div ref={root} className="relative w-full">
    <button type="button" disabled={disabled} onClick={()=>setOpen(v=>!v)} className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[16px] border px-4 text-left outline-none transition-all duration-200 ${disabled?"cursor-not-allowed border-white/[.045] bg-white/[.015] text-white/20":open?"border-white/[.18] bg-[#121414] text-white/92 shadow-[0_18px_50px_rgba(0,0,0,.35)]":"border-white/[.085] bg-[#090b0b] text-white/76 hover:border-white/[.14] hover:bg-[#101212]"}`}>
      <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold">{selected?.label??placeholder}</span>{selected?.hint&&selected.value?<span className="mt-0.5 block truncate text-[9px] font-medium text-white/25">{selected.hint}</span>:null}</span>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border transition ${open?"border-white/[.12] bg-white/[.065]":"border-white/[.055] bg-white/[.025]"}`}><ChevronDown className={`h-4 w-4 text-white/38 transition-transform duration-200 ${open?"rotate-180":""}`}/></span>
    </button>
    {open&&!disabled?<div className="absolute left-0 right-0 z-[120] mt-2 max-h-[300px] overflow-auto rounded-[18px] border border-white/[.10] bg-[#0c0e0e]/[.99] p-2 shadow-[0_28px_90px_rgba(0,0,0,.62)] backdrop-blur-xl [scrollbar-width:thin]">
      {options.map(option=><button key={option.value} type="button" onClick={()=>{onChange(option.value);setOpen(false)}} className={`flex w-full items-center gap-3 rounded-[13px] px-3.5 py-3 text-left transition ${option.value===value?"bg-white/[.085] text-white":"text-white/58 hover:bg-white/[.045] hover:text-white/90"}`}>
        <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold">{option.label}</span>{option.hint?<span className="mt-1 block truncate text-[9px] font-medium text-white/24">{option.hint}</span>:null}</span>
        {option.value===value?<span className="grid h-7 w-7 place-items-center rounded-full border border-white/[.08] bg-white/[.07]"><Check className="h-3.5 w-3.5"/></span>:null}
      </button>)}
    </div>:null}
  </div>;
}
