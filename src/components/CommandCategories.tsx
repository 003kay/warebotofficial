import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Eye,
  Gamepad2,
  Gavel,
  Gift,
  Heart,
  Image,
  Info,
  ListFilter,
  Mic2,
  Music2,
  ScrollText,
  Server,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Tags,
  TrendingUp,
  TicketCheck,
  WalletCards,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { platformLogos } from "@/lib/platformLogos";
import type { WareCommandCategory } from "@/lib/canonicalCommands";

const icons: Record<string, LucideIcon> = {
  information: Info,
  moderation: Gavel,
  server: Server,
  roles: Tags,
  antinuke: ShieldCheck,
  antiraid: ShieldAlert,
  voicemaster: Mic2,
  logs: ScrollText,
  utility: Wrench,
  snipe: Eye,
  tickets: TicketCheck,
  lastfm: Music2,
  music: Music2,
  spotify: Music2,
  social: Bell,
  media: Image,
  fun: Sparkles,
  games: Gamepad2,
  roleplay: Heart,
  economy: WalletCards,
  leveling: TrendingUp,
  giveaways: Gift,
  ai: Bot,
  premium: Crown,
};

type Props = {
  categories: WareCommandCategory[];
  value: string;
  onChange: (slug: string) => void;
};

export function CommandCategories({ categories, value, onChange }: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      const left = rail.scrollLeft > 2;
      const right = rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 2;
      setEdges((previous) =>
        previous.left === left && previous.right === right ? previous : { left, right },
      );
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => {
      rail.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    const selected = rail?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!rail || !selected) return;
    // Scroll only the category rail; do not jump the user's page position.
    const left = selected.offsetLeft;
    const right = left + selected.offsetWidth;
    if (left < rail.scrollLeft || right > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: Math.max(0, left - 8) });
    }
  }, [value]);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  return (
    <section aria-label="Command categories" className="mb-9">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-white/40">
          <ListFilter className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{categories.length} categories</span>
        </div>
        <div className="relative">
          <select
            aria-label="Jump to category"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="max-w-[210px] cursor-pointer appearance-none rounded-lg border border-white/[.08] bg-[#101212] py-2 pl-3 pr-9 text-[12px] text-white/65 outline-none transition hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[#bdd8ef]/50 [color-scheme:dark]"
          >
            {categories.map((group) => (
              <option key={group.slug} value={group.slug}>
                {group.name} · {group.commands.length}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40"
            aria-hidden="true"
          />
        </div>
      </div>
      <nav
        aria-label="Browse command categories"
        className="flex h-16 items-center overflow-hidden rounded-2xl border border-white/[.10] bg-[linear-gradient(180deg,#141717_0%,#0d1010_100%)] px-1 shadow-[inset_0_1px_0_rgba(255,255,255,.035),0_8px_28px_rgba(0,0,0,.12)]"
      >
        <button
          type="button"
          aria-label="Scroll categories left"
          disabled={!edges.left}
          onClick={() => scroll(-1)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/55 transition hover:bg-white/[.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#bdd8ef]/50 disabled:cursor-default disabled:text-white/15 sm:w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          ref={railRef}
          className="relative min-w-0 flex-1 snap-x snap-proximity overflow-x-auto overscroll-x-contain px-1 [scroll-padding-inline:4px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max items-center gap-1.5 py-2">
            {categories.map((group) => {
              const Icon = icons[group.slug] ?? Wrench;
              const active = value === group.slug;
              const logo = platformLogos[group.slug];
              return (
                <button
                  key={group.slug}
                  type="button"
                  aria-pressed={active}
                  aria-controls="command-results"
                  onClick={() => onChange(group.slug)}
                  className={`group/category relative flex h-12 shrink-0 snap-start items-center gap-2.5 whitespace-nowrap rounded-xl border px-3.5 text-[13px] font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#bdd8ef]/50 sm:gap-3 sm:px-4 ${active ? "border-[#bdd8ef]/20 bg-[linear-gradient(135deg,rgba(189,216,239,.12),rgba(255,255,255,.04))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06)]" : "border-transparent text-white/55 hover:border-white/[.06] hover:bg-white/[.035] hover:text-white/90"}`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition ${active ? "bg-white/[.06] text-[#d7e7ee]" : "text-[#a8bac2] group-hover/category:text-white"}`}
                  >
                    {logo ? (
                      <svg
                        data-platform={group.slug}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-[19px] w-[19px]"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d={logo} />
                      </svg>
                    ) : (
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    )}
                  </span>
                  <span>{group.name}</span>
                  <span
                    className={`ml-0.5 min-w-6 rounded-md border px-1.5 py-0.5 text-center font-mono text-[10px] tabular-nums transition ${active ? "border-white/[.08] bg-white/[.08] text-white/80" : "border-white/[.035] bg-black/15 text-white/40 group-hover/category:text-white/65"}`}
                  >
                    {group.commands.length}
                  </span>
                  {active && (
                    <span className="absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-[#bdd8ef]/70 to-transparent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          aria-label="Scroll categories right"
          disabled={!edges.right}
          onClick={() => scroll(1)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/55 transition hover:bg-white/[.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#bdd8ef]/50 disabled:cursor-default disabled:text-white/15 sm:w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </section>
  );
}
