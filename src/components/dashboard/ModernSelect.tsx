import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type ModernSelectOption = { label: string; value: string; hint?: string };

export function ModernSelect({ value, options, onChange, disabled = false, placeholder = "Select…" }: { value: string; options: ModernSelectOption[]; onChange: (value: string) => void; disabled?: boolean; placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selected = options.find(option => option.value === value);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={root} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(value => !value)}
        className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-[15px] border px-4 text-left outline-none transition-all duration-200 ${
          disabled
            ? "cursor-not-allowed border-white/[.045] bg-[#080a0d] text-white/20"
            : open
              ? "border-[#7182d8]/28 bg-[#11141a] text-white/92 shadow-[0_18px_46px_rgba(0,0,0,.34)]"
              : "border-white/[.075] bg-[#07090d] text-white/78 hover:border-white/[.13] hover:bg-[#0d1014]"
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-black tracking-[-.01em]">{selected?.label ?? placeholder}</span>
          {selected?.hint && selected.value ? <span className="mt-0.5 block truncate text-[9px] font-semibold text-white/24">{selected.hint}</span> : null}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/34 transition-transform duration-200 ${open ? "rotate-180 text-white/70" : ""}`} />
      </button>

      {open && !disabled ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[400] max-h-[320px] overflow-auto rounded-[16px] border border-white/[.10] bg-[#090c10]/[.995] p-1.5 shadow-[0_28px_90px_rgba(0,0,0,.7)] backdrop-blur-2xl [scrollbar-color:#303642_transparent] [scrollbar-width:thin]">
          {options.map(option => {
            const active = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-[12px] px-3.5 py-3 text-left transition ${
                  active ? "bg-[#6576ce]/12 text-white" : "text-white/56 hover:bg-white/[.045] hover:text-white/90"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-black">{option.label}</span>
                  {option.hint ? <span className="mt-0.5 block truncate text-[9px] font-semibold text-white/24">{option.hint}</span> : null}
                </span>
                {active ? <Check className="h-4 w-4 shrink-0 text-[#91a1ea]/80" /> : null}
              </button>
            );
          })}
          {!options.length ? <div className="px-3.5 py-4 text-[10px] font-semibold text-white/28">Nothing available</div> : null}
        </div>
      ) : null}
    </div>
  );
}
