import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type ModernSelectOption = { label: string; value: string; hint?: string };

export function ModernSelect({ value, options, onChange, disabled = false, placeholder = "Select…" }: { value: string; options: ModernSelectOption[]; onChange: (value: string) => void; disabled?: boolean; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div ref={root} className="relative">
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen((current) => !current)}
      className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-full border px-4 text-left text-[12px] font-semibold outline-none transition ${disabled ? "cursor-not-allowed border-white/[.04] bg-white/[.018] text-white/20" : open ? "border-white/[.18] bg-[#111313] text-white/90 shadow-[0_12px_40px_rgba(0,0,0,.28)]" : "border-white/[.08] bg-[#0a0c0c] text-white/74 hover:border-white/[.14] hover:bg-[#101212]"}`}
    >
      <span className="truncate">{selected?.label ?? placeholder}</span>
      <ChevronDown className={`h-4 w-4 shrink-0 text-white/35 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && !disabled ? <div className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-[18px] border border-white/[.09] bg-[#111313] p-1.5 shadow-[0_22px_70px_rgba(0,0,0,.52)]">
      {options.map((option) => <button
        key={option.value}
        type="button"
        onClick={() => { onChange(option.value); setOpen(false); }}
        className={`flex w-full items-center gap-3 rounded-[13px] px-3.5 py-3 text-left transition ${option.value === value ? "bg-white/[.085] text-white" : "text-white/58 hover:bg-white/[.045] hover:text-white/88"}`}
      >
        <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold">{option.label}</span>{option.hint ? <span className="mt-0.5 block truncate text-[9px] font-medium text-white/24">{option.hint}</span> : null}</span>
        {option.value === value ? <span className="grid h-6 w-6 place-items-center rounded-full bg-white/[.08]"><Check className="h-3.5 w-3.5" /></span> : null}
      </button>)}
    </div> : null}
  </div>;
}
