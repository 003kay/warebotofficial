import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Search, Layers3, ShieldCheck, Gavel, Info, Heart, Music2,
  Ticket, Bot, Sparkles, Gamepad2, Wrench, Gift, Crown, User, Server, Image,
  ScrollText, WalletCards, Settings2, Radio, Volume2,
  Copy, Check, ChevronLeft, ChevronRight, Bitcoin, ListChecks, Timer, Youtube,
  Twitch, Cloud, Hash, MessageCircle, Gamepad, BellRing,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { commandCategories } from "@/lib/commands";
import { lastFmCategory } from "@/lib/lastfmCommands";
import { referenceCommandCategories } from "@/lib/referenceCommands";

type CommandEntry = {
  name: string;
  description: string;
  usage: string;
  example?: string;
  aliases?: string[];
  permission?: string;
};

type CategoryEntry = {
  slug: string;
  name: string;
  description: string;
  commands: CommandEntry[];
};

function mergeCategories(...groups: CategoryEntry[][]): CategoryEntry[] {
  const merged = new Map<string, CategoryEntry>();
  for (const list of groups) {
    for (const category of list) {
      const current = merged.get(category.slug);
      if (!current) {
        merged.set(category.slug, { ...category, commands: [...category.commands] });
        continue;
      }
      const known = new Set(current.commands.map(command => command.name.toLowerCase()));
      for (const command of category.commands) {
        if (!known.has(command.name.toLowerCase())) {
          current.commands.push(command);
          known.add(command.name.toLowerCase());
        }
      }
    }
  }
  return [...merged.values()];
}

const categories = mergeCategories(
  [...commandCategories, lastFmCategory] as unknown as CategoryEntry[],
  referenceCommandCategories as unknown as CategoryEntry[],
);

const WARE_COMMAND_TOTAL = 822;
const WARE_LOGO = "/ware-logo.svg?v=4";

const iconBySlug: Record<string, typeof Layers3> = {
  home: Layers3,
  moderation: Gavel,
  "channels-roles": Settings2,
  voicemaster: Volume2,
  "config-logs": ScrollText,
  antinuke: ShieldCheck,
  antiraid: ShieldCheck,
  economy: WalletCards,
  fun: Sparkles,
  games: Gamepad2,
  utility: Wrench,
  tickets: Ticket,
  ai: Bot,
  giveaways: Gift,
  premium: Crown,
  leveling: Radio,
  user: User,
  server: Server,
  images: Image,
  roleplay: Heart,
  security: ShieldCheck,
  welcome: Info,
  roblox: Gamepad2,
  lastfm: Music2,
  crypto: Bitcoin,
  snipe: MessageCircle,
  counters: ListChecks,
  timers: Timer,
  soundcloud: Cloud,
  twitch: Twitch,
  youtube: Youtube,
  logs: Hash,
  twitter: Hash,
  reddit: MessageCircle,
  fortnite: Gamepad,
  "bump-reminder": BellRing,
};

function getArguments(usage: string) {
  const matches = usage.match(/[([][^\])]+[\])]/g) ?? [];
  return matches.map(value => value.slice(1, -1).trim()).filter(Boolean);
}

export const Route = createFileRoute("/commands")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Commands — Ware" },
      { name: "description", content: "Browse Ware's complete command library." },
    ],
  }),
  component: CommandsPage,
});

function CommandsIntro() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDone(true), 1725);
    return () => window.clearTimeout(timer);
  }, []);

  if (done) return null;

  return <div className="ware-commands-intro fixed inset-0 z-[500] grid place-items-center bg-black" aria-hidden>
    <div className="ware-commands-intro-glow" />
    <img src={WARE_LOGO} alt="" className="ware-commands-intro-logo" />
    <style>{`
      .ware-commands-intro{animation:wareOverlayExit 1.725s linear both;}
      .ware-commands-intro-logo{width:118px;height:118px;object-fit:contain;will-change:transform,filter,opacity;animation:wareLogoFlight 1.725s cubic-bezier(.16,1,.3,1) both;}
      .ware-commands-intro-glow{position:absolute;width:260px;height:260px;border-radius:999px;background:radial-gradient(circle,rgba(255,255,255,.12),rgba(255,255,255,.03) 38%,transparent 70%);filter:blur(28px);animation:wareGlowFlight 1.725s ease both;}
      @keyframes wareLogoFlight{
        0%{transform:scale(.45) rotate(-8deg);opacity:0;filter:blur(14px) drop-shadow(0 0 0 transparent)}
        27%{transform:scale(1.12) rotate(1deg);opacity:1;filter:blur(0) drop-shadow(0 0 38px rgba(255,255,255,.22))}
        48%{transform:scale(1) rotate(0);opacity:1;filter:blur(0) drop-shadow(0 0 24px rgba(255,255,255,.14))}
        62%{transform:scale(1) rotate(0);opacity:1;filter:blur(0) drop-shadow(0 0 24px rgba(255,255,255,.14))}
        100%{transform:scale(.3) rotate(5deg);opacity:0;filter:blur(16px) drop-shadow(0 0 0 transparent)}
      }
      @keyframes wareGlowFlight{0%{opacity:0;transform:scale(.45)}32%{opacity:1;transform:scale(1.15)}62%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(.3)}}
      @keyframes wareOverlayExit{0%,65%{opacity:1}100%{opacity:0}}
      @media(prefers-reduced-motion:reduce){.ware-commands-intro{animation:wareOverlayExit .45s ease both}.ware-commands-intro-logo{animation:none;opacity:1;transform:scale(1);filter:none}.ware-commands-intro-glow{display:none}}
    `}</style>
  </div>;
}

function CommandsPage() {
  const search = Route.useSearch();
  const railRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() =>
    categories.some(group => group.slug === search.category) ? search.category! : "all"
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const all = useMemo(() => {
    const seen = new Set<string>();
    return categories.flatMap(group => group.commands.map(command => ({
      ...command,
      category: group.name,
      categorySlug: group.slug,
    }))).filter(command => {
      const key = command.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(command =>
      (category === "all" || command.categorySlug === category) &&
      (!q || command.name.toLowerCase().includes(q) || command.description.toLowerCase().includes(q) || command.usage.toLowerCase().includes(q) || (command.aliases ?? []).some(alias => alias.toLowerCase().includes(q)))
    );
  }, [all, query, category]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      setCanScrollLeft(rail.scrollLeft > 8);
      setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 8);
    };
    const onWheel = (event: WheelEvent) => {
      if (rail.scrollWidth <= rail.clientWidth) return;
      const amount = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!amount) return;
      event.preventDefault();
      rail.scrollLeft += amount;
    };
    update();
    rail.addEventListener("wheel", onWheel, { passive: false });
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const moveRail = (direction: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction === "left" ? -560 : 560, behavior: "smooth" });
  };

  const copyCommand = async (usage: string, key: string) => {
    try {
      await navigator.clipboard.writeText(usage);
      setCopied(key);
      window.setTimeout(() => setCopied(current => current === key ? null : current), 1300);
    } catch {
      setCopied(null);
    }
  };

  return <div className="ware-commands-v4 min-h-screen bg-[#080808] text-white">
    <CommandsIntro />
    <Navbar />

    <main className="mx-auto max-w-[1460px] px-5 pb-24 pt-8 md:px-9">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/35 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Home</Link>

      <header className="mt-9 grid gap-6 border-b border-white/[.08] pb-9 lg:grid-cols-[1fr_520px] lg:items-end">
        <div>
          <h1 className="text-5xl font-bold tracking-[-.055em] sm:text-6xl">Commands</h1>
          <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/45">Browse Ware by category, alias, or usage.</p>
        </div>
        <div className="flex h-14 items-center gap-3 rounded-xl border border-white/[.10] bg-[#111111] px-4 focus-within:border-white/25">
          <Search className="h-4 w-4 text-white/32" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search commands..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/24" />
          {query ? <span className="text-[11px] text-white/35">{shown.length}</span> : null}
        </div>
      </header>

      <section className="mt-7">
        <div className="flex h-[74px] items-stretch overflow-hidden rounded-[14px] border border-white/[.09] bg-[#101010]">
          <button type="button" aria-label="Scroll categories left" onClick={() => moveRail("left")} disabled={!canScrollLeft} className="grid w-12 shrink-0 place-items-center border-r border-white/[.07] bg-[#0d0d0d] text-white/46 transition hover:bg-[#171717] hover:text-white disabled:opacity-20"><ChevronLeft className="h-4 w-4" /></button>
          <div ref={railRef} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex h-full w-max min-w-full items-stretch">
              <button type="button" onClick={() => setCategory("all")} className={`flex min-w-[150px] items-center gap-3 border-r border-white/[.07] px-5 text-left transition ${category === "all" ? "bg-[#303030] text-white" : "bg-transparent text-white/56 hover:bg-[#181818] hover:text-white"}`}>
                <Layers3 className="h-5 w-5 shrink-0 opacity-80" />
                <span className="text-[14px] font-medium">All</span>
                <span className="ml-auto rounded-md bg-white/[.08] px-2 py-1 text-[10px] text-white/50">{WARE_COMMAND_TOTAL}</span>
              </button>
              {categories.map(group => {
                const Icon = iconBySlug[group.slug] ?? Layers3;
                const selected = category === group.slug;
                return <button key={group.slug} type="button" onClick={() => setCategory(group.slug)} className={`flex min-w-[170px] items-center gap-3 border-r border-white/[.07] px-5 text-left transition ${selected ? "bg-[#303030] text-white" : "bg-transparent text-white/56 hover:bg-[#181818] hover:text-white"}`}>
                  <Icon className="h-5 w-5 shrink-0 opacity-80" />
                  <span className="max-w-[110px] truncate text-[14px] font-medium">{group.name}</span>
                  <span className="ml-auto rounded-md bg-white/[.08] px-2 py-1 text-[10px] text-white/46">{group.commands.length}</span>
                </button>;
              })}
            </div>
          </div>
          <button type="button" aria-label="Scroll categories right" onClick={() => moveRail("right")} disabled={!canScrollRight} className="grid w-12 shrink-0 place-items-center border-l border-white/[.07] bg-[#0d0d0d] text-white/46 transition hover:bg-[#171717] hover:text-white disabled:opacity-20"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((command, index) => {
          const args = getArguments(command.usage);
          const permission = command.permission || "None";
          const key = `${command.categorySlug}:${command.name}:${index}`;
          const isCopied = copied === key;
          return <article key={key} className="overflow-hidden rounded-[14px] border border-[#292929] bg-[#111111] transition duration-150 hover:-translate-y-px hover:border-[#3a3a3a] hover:bg-[#131313]">
            <div className="flex min-h-[112px] items-start justify-between gap-4 px-5 py-5">
              <div className="min-w-0">
                <div className="text-[17px] font-semibold tracking-[-.018em] text-white/95">{command.name}</div>
                <p className="mt-2 text-[13px] leading-6 text-white/48">{command.description}</p>
              </div>
              <button type="button" onClick={() => copyCommand(command.usage, key)} title={isCopied ? "Copied" : "Copy command"} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[.08] text-white/36 transition hover:border-white/18 hover:bg-white/[.04] hover:text-white">{isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
            </div>
            <div className="border-t border-[#292929] bg-[#0e0e0e] px-5 py-4">
              <div className="text-[11px] font-medium uppercase tracking-[.13em] text-white/34">Arguments</div>
              <div className="mt-2.5 flex min-h-6 flex-wrap gap-2">{args.length ? args.map((arg, argIndex) => <span key={`${arg}-${argIndex}`} className="rounded-md border border-white/[.07] bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-white/66">{arg}</span>) : <span className="text-[11px] text-white/34">none</span>}</div>
              <div className="mt-4 text-[11px] font-medium uppercase tracking-[.13em] text-white/34">Permissions</div>
              <div className="mt-2.5 min-h-6">{permission.toLowerCase() === "none" ? <span className="text-[11px] text-white/34">none</span> : <span className="inline-flex rounded-md border border-white/[.07] bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-white/66">{permission}</span>}</div>
            </div>
          </article>;
        })}
      </section>

      {!shown.length ? <div className="mt-8 rounded-xl border border-white/[.08] bg-[#111111] px-6 py-14 text-center text-sm text-white/40">No commands found.</div> : null}
    </main>
    <Footer />
  </div>;
}
