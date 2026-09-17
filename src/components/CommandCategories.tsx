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
      rail.scrollTo({ left: left - (rail.clientWidth - selected.offsetWidth) / 2 });
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
        className="flex overflow-hidden rounded-2xl border border-white/[.09] bg-[#101212]"
      >
        <button
          type="button"
          aria-label="Scroll categories left"
          disabled={!edges.left}
          onClick={() => scroll(-1)}
          className="grid w-10 shrink-0 place-items-center border-r border-white/[.06] text-white/60 transition hover:bg-white/[.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#bdd8ef]/50 disabled:cursor-default disabled:text-white/15 sm:w-12"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div
          ref={railRef}
          className="relative min-w-0 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex w-max">
            {categories.map((group) => {
              const Icon = icons[group.slug] ?? Wrench;
              const active = value === group.slug;
              return (
                <button
                  key={group.slug}
                  type="button"
                  aria-pressed={active}
                  aria-controls="command-results"
                  onClick={() => onChange(group.slug)}
                  className={`relative flex h-16 shrink-0 items-center gap-2.5 whitespace-nowrap border-r border-white/[.045] px-4 text-[13px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#bdd8ef]/50 sm:gap-3 sm:px-5 ${active ? "bg-white/[.065] text-white" : "text-white/50 hover:bg-white/[.035] hover:text-white/85"}`}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[#bdd8ef]" : "text-[#9eb2bc]/75"}`}
                    aria-hidden="true"
                  />
                  <span>{group.name}</span>
                  <span
                    className={`min-w-6 rounded-md px-1.5 py-0.5 text-center font-mono text-[10px] tabular-nums ${active ? "bg-white/[.09] text-white/75" : "bg-white/[.035] text-white/35"}`}
                  >
                    {group.commands.length}
                  </span>
                  {active && (
                    <span className="absolute inset-x-5 bottom-0 h-0.5 rounded-t bg-[#bdd8ef]/80" />
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
          className="grid w-10 shrink-0 place-items-center border-l border-white/[.06] text-white/60 transition hover:bg-white/[.04] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#bdd8ef]/50 disabled:cursor-default disabled:text-white/15 sm:w-12"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </section>
  );
}
