import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Search, Layers3, ShieldCheck, Gavel, Info, Heart, Music2,
  Ticket, Bot, Sparkles, Gamepad2, Wrench, Gift, Crown, User, Server, Image,
  ScrollText, WalletCards, Settings2, Radio, Volume2, Command as CommandIcon,
  Copy, Check, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";
import { commandCategories } from "@/lib/commands";
import { lastFmCategory } from "@/lib/lastfmCommands";

const categories = [...commandCategories, lastFmCategory];

// Counted directly from the current bot.py command inventory:
// 819 explicit command/group paths + 246 dynamically registered reference paths,
// with 25 overlapping paths = 1,040 unique command paths.
const WARE_COMMAND_TOTAL = 1040;

const iconBySlug: Record<string, typeof Layers3> = {
  home: Layers3,
  moderation: Gavel,
  "channels-roles": Settings2,
  voicemaster: Volume2,
  "config-logs": ScrollText,
  antinuke: ShieldCheck,
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
  const stripRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() =>
    categories.some(group => group.slug === search.category) ? search.category! : "all"
  );
  const [copied, setCopied] = useState<string | null>(null);

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

  // Use a native non-passive wheel listener. React's synthetic wheel handler can
  // be passive in Chromium, which is why preventDefault was not reliably moving the rail.
  useEffect(() => {
    const rail = stripRef.current;
    if (!rail) return;

    const onWheel = (event: WheelEvent) => {
      if (rail.scrollWidth <= rail.clientWidth) return;
      const amount = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!amount) return;
      event.preventDefault();
      rail.scrollBy({ left: amount, behavior: "auto" });
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, []);

  const scrollCategories = (edge: "start" | "end") => {
    const rail = stripRef.current;
    if (!rail) return;
    rail.scrollTo({
      left: edge === "start" ? 0 : rail.scrollWidth - rail.clientWidth,
      behavior: "smooth",
    });
  };

  const copyCommand = async (usage: string, key: string) => {
    try {
      await navigator.clipboard.writeText(usage);
      setCopied(key);
      window.setTimeout(() => setCopied(current => current === key ? null : current), 1400);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="commands-page relative min-h-screen overflow-hidden bg-[#050505]">
      <Starfield />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(110,126,255,.08),transparent_65%)]" />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-8">
        <Link to="/" className="command-back group inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Home
        </Link>

        <section className="command-hero mt-8 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.012))] p-6 shadow-[0_40px_120px_-70px_rgba(110,126,255,.28)] md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40">
                <CommandIcon className="h-3.5 w-3.5" /> ware command center
              </div>
              <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] md:text-7xl">Commands</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/45">Search Ware's full command system or jump straight into a category.</p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl border ${category === "lastfm" ? "border-[#d9232e]/30 bg-[#d9232e]/12 text-[#ff5a64]" : "border-white/10 bg-white/[0.04] text-white/65"}`}>
                <ActiveIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-white/35">Currently browsing</div>
                <div className="mt-0.5 text-sm font-semibold">
                  {activeCategory?.name ?? "All commands"}
                  <span className="ml-1 text-white/30">· {displayedCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-9 rounded-[24px] border border-white/10 bg-black/30 p-2.5 transition focus-within:border-white/20 focus-within:bg-black/40">
            <label className="group flex items-center gap-3 rounded-2xl px-3 py-3.5">
              <Search className="h-4 w-4 text-white/35 transition group-focus-within:scale-110 group-focus-within:text-white/70" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search commands, aliases, or usage..."
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              />
              {query ? <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/35">{shown.length} results</span> : null}
            </label>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => scrollCategories("start")}
                aria-label="Back to first category"
                title="First category"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:scale-95"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories("end")}
                aria-label="Go to last category"
                title="Last category"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:scale-95"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div
              ref={stripRef}
              className="command-category-strip w-full overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex w-max min-w-full gap-2">
                <button onClick={() => setCategory("all")} className={`command-category-button group ${category === "all" ? "is-active" : ""}`}>
                  <span className="command-category-icon"><Layers3 className="h-4 w-4" /></span>
                  <span>All</span>
                  <span className="command-count">{WARE_COMMAND_TOTAL.toLocaleString()}</span>
                </button>

                {categories.map(group => {
                  const Icon = iconBySlug[group.slug] ?? Layers3;
                  const selected = category === group.slug;
                  return (
                    <button
                      key={group.slug}
                      onClick={() => setCategory(group.slug)}
                      className={`command-category-button group ${selected ? "is-active" : ""} ${group.slug === "lastfm" ? "is-lastfm" : ""}`}
                    >
                      <span className="command-category-icon"><Icon className="h-4 w-4" /></span>
                      <span>{group.name}</span>
                      <span className="command-count">{group.commands.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {activeCategory ? (
          <div className={`command-category-intro mt-6 flex items-center gap-4 rounded-[22px] border px-5 py-4 ${category === "lastfm" ? "border-[#d9232e]/20 bg-[#d9232e]/[0.045]" : "border-white/[0.07] bg-white/[0.02]"}`}>
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${category === "lastfm" ? "border-[#d9232e]/25 bg-[#d9232e]/10 text-[#ff5a64]" : "border-white/10 bg-white/[0.04] text-white/65"}`}>
              <ActiveIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold">{activeCategory.name}</div>
              <div className="mt-1 text-sm text-white/38">{activeCategory.description}</div>
            </div>
          </div>
        ) : null}

        <section className="mt-7">
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((command, index) => {
              const Icon = iconBySlug[command.categorySlug] ?? CommandIcon;
              const isLastFm = command.categorySlug === "lastfm";
              const args = getArguments(command.usage);
              const permission = isLastFm && "permission" in command ? (command.permission || "None") : "See command help";
              const key = `${command.categorySlug}:${command.name}:${index}`;
              const isCopied = copied === key;

              return (
                <article key={key} className={`command-detail-card group ${isLastFm ? "is-lastfm" : ""}`}>
                  <div className="command-detail-top">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${isLastFm ? "border-[#d9232e]/25 bg-[#d9232e]/10 text-[#ff5a64]" : "border-white/10 bg-white/[0.04] text-white/55"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-[15px] font-semibold tracking-[-0.02em] text-white">{command.name}</div>
                        <p className="mt-2 text-sm leading-6 text-white/48">{command.description}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCommand(command.usage, key)}
                      aria-label={`Copy ${command.name} command`}
                      title={isCopied ? "Copied" : "Copy command"}
                      className="command-copy-button"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="command-detail-divider" />

                  <div className="command-detail-meta">
                    <div>
                      <div className="command-detail-label">Arguments</div>
                      <div className="mt-3 flex min-h-7 flex-wrap gap-2">
                        {args.length
                          ? args.map((arg, argIndex) => <span key={`${arg}-${argIndex}`} className="command-argument-chip">{arg}</span>)
                          : <span className="text-xs text-white/38">none</span>}
                      </div>
                    </div>

                    <div>
                      <div className="command-detail-label">Permissions</div>
                      <div className="mt-3">
                        <span className={`command-permission-chip ${permission === "None" ? "is-none" : ""}`}>{permission}</span>
                      </div>
                    </div>
                  </div>

                  <div className="command-usage-row">
                    <span className="font-mono text-[11px] text-white/36">{command.usage}</span>
                    <span className={`text-[9px] uppercase tracking-[0.14em] ${isLastFm ? "text-[#ff5a64]/75" : "text-white/22"}`}>{command.category}</span>
                  </div>
                </article>
              );
            })}
          </div>

          {!shown.length ? (
            <div className="mt-10 rounded-[28px] border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-white/20" />
              <div className="mt-4 font-semibold text-white/70">No commands found</div>
              <div className="mt-1 text-sm text-white/35">Try another search or category.</div>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}
