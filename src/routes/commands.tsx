import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Search, Layers3, ShieldCheck, Gavel, Info, Heart, Music2,
  Ticket, Bot, Sparkles, Gamepad2, Wrench, Gift, Crown, User, Server, Image,
  ScrollText, WalletCards, Settings2, Radio, Volume2, Command as CommandIcon,
  Copy, Check, ChevronLeft, ChevronRight, Bitcoin, ListChecks, Timer, Youtube,
  Twitch, Hash, MessageCircle, Gamepad, BellRing,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";
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

const WARE_COMMAND_TOTAL = 1008;

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
  twitch: Twitch,
  youtube: Youtube,
  logs: Hash,
  twitter: Hash,
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
      { title: "Commands — ware" },
      { name: "description", content: "Browse Ware's complete command library." },
    ],
  }),
  component: CommandsPage,
});

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

  const all = useMemo(
    () => categories.flatMap(group => group.commands.map(command => ({
      ...command,
      category: group.name,
      categorySlug: group.slug,
    }))),
    [],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(command =>
      (category === "all" || command.categorySlug === category) &&
      (!q ||
        command.name.toLowerCase().includes(q) ||
        command.description.toLowerCase().includes(q) ||
        command.usage.toLowerCase().includes(q) ||
        (command.aliases ?? []).some(alias => alias.toLowerCase().includes(q)))
    );
  }, [all, query, category]);

  const activeCategory = category === "all" ? null : categories.find(group => group.slug === category);
  const ActiveIcon = activeCategory ? (iconBySlug[activeCategory.slug] ?? Layers3) : CommandIcon;
  const displayedCount = query ? shown.length : category === "all" ? WARE_COMMAND_TOTAL : shown.length;

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const update = () => {
      setCanScrollLeft(rail.scrollLeft > 6);
      setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 6);
    };

    const onWheel = (event: WheelEvent) => {
      if (rail.scrollWidth <= rail.clientWidth) return;
      const amount = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!amount) return;
      event.preventDefault();
      rail.scrollBy({ left: amount * 1.2, behavior: "auto" });
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
    rail.scrollBy({
      left: direction === "left" ? -rail.clientWidth * 0.82 : rail.clientWidth * 0.82,
      behavior: "smooth",
    });
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#060707] text-white">
      <Starfield />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_50%_-15%,rgba(255,255,255,.07),transparent_58%)]" />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-[1500px] px-4 pb-28 pt-7 sm:px-6 lg:px-9">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="group inline-flex items-center gap-2 text-xs font-medium text-white/35 transition hover:text-white/85">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" /> Back to Ware
          </Link>
          <div className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/25 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,.7)]" />
            {WARE_COMMAND_TOTAL.toLocaleString()} command paths
          </div>
        </div>

        <section className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.23em] text-white/30">
              <CommandIcon className="h-3.5 w-3.5" /> Ware command center
            </div>
            <h1 className="mt-4 text-[clamp(3.6rem,8vw,7.4rem)] font-black leading-[.83] tracking-[-0.075em]">Commands</h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/38 md:text-base">
              Search the full Ware command system, browse by category, and copy any command in one click.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.025] p-5 backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.09] bg-white/[0.04] text-white/75">
                <ActiveIcon className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/25">Currently browsing</p>
                <p className="mt-1 truncate text-base font-semibold tracking-[-0.02em]">{activeCategory?.name ?? "All commands"}</p>
              </div>
              <div className="ml-auto rounded-full border border-white/[0.08] bg-black/25 px-3 py-1.5 font-mono text-[10px] text-white/35">
                {displayedCount.toLocaleString()}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-10 flex items-center gap-3 rounded-[22px] border border-white/[0.09] bg-black/30 px-5 py-4 shadow-[0_18px_55px_-42px_rgba(0,0,0,.95)] backdrop-blur-xl transition focus-within:border-white/[0.18] focus-within:bg-black/45">
          <Search className="h-4 w-4 shrink-0 text-white/26" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search commands, aliases, or usage..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white/90 outline-none placeholder:text-white/20"
          />
          {query ? <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 font-mono text-[9px] text-white/35">{shown.length} results</span> : null}
        </div>

        <section className="sticky top-3 z-30 mt-5">
          <div className="relative rounded-[22px] border border-white/[0.08] bg-[#090a0a]/94 px-2 py-2 shadow-[0_24px_80px_-45px_rgba(0,0,0,.95)] backdrop-blur-2xl">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => moveRail("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll categories left"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div ref={railRef} className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex w-max min-w-full items-center">
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    className={`group relative flex h-12 items-center gap-2.5 px-4 text-[11px] font-semibold transition ${category === "all" ? "text-white" : "text-white/38 hover:text-white/80"}`}
                  >
                    <Layers3 className="h-3.5 w-3.5" />
                    <span>All</span>
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] ${category === "all" ? "bg-white text-black" : "bg-white/[0.045] text-white/30"}`}>{WARE_COMMAND_TOTAL.toLocaleString()}</span>
                    {category === "all" ? <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-white" /> : null}
                  </button>

                  {categories.map(group => {
                    const Icon = iconBySlug[group.slug] ?? Layers3;
                    const selected = category === group.slug;
                    return (
                      <button
                        key={group.slug}
                        type="button"
                        onClick={() => setCategory(group.slug)}
                        className={`group relative flex h-12 items-center gap-2.5 px-4 text-[11px] font-semibold transition ${selected ? "text-white" : "text-white/38 hover:bg-white/[0.02] hover:text-white/80"}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="whitespace-nowrap">{group.name}</span>
                        <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] ${selected ? "bg-white text-black" : "bg-white/[0.045] text-white/28"}`}>{group.commands.length}</span>
                        {selected ? <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-white" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => moveRail("right")}
                disabled={!canScrollRight}
                aria-label="Scroll categories right"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/40 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em]">
                <ActiveIcon className="h-4 w-4 text-white/50" /> {activeCategory?.name ?? "All commands"}
              </div>
              <p className="mt-1.5 text-xs text-white/28">{activeCategory?.description ?? "Every command currently available across Ware."}</p>
            </div>
            <div className="hidden font-mono text-[10px] text-white/25 sm:block">{shown.length.toLocaleString()} visible</div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((command, index) => {
              const args = getArguments(command.usage);
              const permission = command.permission || "None";
              const key = `${command.categorySlug}:${command.name}:${index}`;
              const isCopied = copied === key;

              return (
                <article
                  key={key}
                  className="group relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-[linear-gradient(150deg,rgba(255,255,255,.032),rgba(255,255,255,.012))] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-[linear-gradient(150deg,rgba(255,255,255,.055),rgba(255,255,255,.018))] hover:shadow-[0_24px_80px_-46px_rgba(0,0,0,.95)]"
                >
                  <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition group-hover:opacity-100" />

                  <div className="p-5 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[17px] font-semibold tracking-[-0.035em] text-white/94">{command.name}</h3>
                          <span className="rounded-full border border-white/[0.06] bg-white/[0.025] px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-white/25">{command.category}</span>
                        </div>
                        <p className="mt-2.5 min-h-10 text-[11px] leading-5 text-white/36">{command.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyCommand(command.usage, key)}
                        title={isCopied ? "Copied" : "Copy command"}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/28 transition hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-white"
                      >
                        {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCommand(command.usage, key)}
                      className="mt-4 flex w-full items-center justify-between gap-3 rounded-[14px] border border-white/[0.065] bg-black/30 px-3.5 py-3 text-left transition hover:border-white/[0.12] hover:bg-black/45"
                    >
                      <code className="min-w-0 truncate font-mono text-[11px] text-white/62">{command.usage}</code>
                      <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-white/22">{isCopied ? "copied" : "copy"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 border-t border-white/[0.055]">
                    <div className="min-w-0 border-r border-white/[0.055] p-4">
                      <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/23">Arguments</div>
                      <div className="mt-2.5 flex min-h-6 flex-wrap gap-1.5">
                        {args.length ? args.map((arg, argIndex) => (
                          <span key={`${arg}-${argIndex}`} className="rounded-lg border border-white/[0.055] bg-white/[0.035] px-2 py-1 text-[9px] italic text-white/48">{arg}</span>
                        )) : <span className="text-[9px] text-white/27">none</span>}
                      </div>
                    </div>

                    <div className="min-w-0 p-4">
                      <div className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/23">Permissions</div>
                      <div className="mt-2.5 min-h-6">
                        {permission === "None" || permission === "none"
                          ? <span className="text-[9px] text-white/27">none</span>
                          : <span className="inline-flex max-w-full truncate rounded-lg border border-white/[0.055] bg-white/[0.035] px-2 py-1 text-[9px] text-white/48">{permission}</span>}
                      </div>
                    </div>
                  </div>

                  {command.example ? (
                    <div className="border-t border-white/[0.05] px-4 py-3 text-[9px] text-white/22">
                      <span className="block truncate font-mono">example: {command.example}</span>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          {!shown.length ? (
            <div className="mt-8 rounded-[26px] border border-white/[0.075] bg-white/[0.018] px-6 py-20 text-center">
              <Search className="mx-auto h-6 w-6 text-white/18" />
              <div className="mt-4 text-sm font-medium text-white/65">No commands found</div>
              <div className="mt-1.5 text-xs text-white/25">Try another search or category.</div>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}
