import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Layers3,
  Server,
  Gavel,
  Info,
  Heart,
  Wrench,
  Settings2,
  Volume2,
  ShieldCheck,
  WalletCards,
  Sparkles,
  Gamepad2,
  Ticket,
  Crown,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Bitcoin,
  ListChecks,
  Timer,
  BellRing,
  Gift,
  User,
  Image,
  ScrollText,
  Radio,
  X,
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

function dedupeCommands(commands: CommandEntry[]) {
  const seen = new Set<string>();
  return commands.filter(command => {
    const key = command.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const sourceCategories = mergeCategories(
  [...commandCategories, lastFmCategory] as unknown as CategoryEntry[],
  referenceCommandCategories as unknown as CategoryEntry[],
);
const sourceBySlug = new Map(sourceCategories.map(category => [category.slug, category]));
const sourceCommands = dedupeCommands(sourceCategories.flatMap(category => category.commands));

function collect(...slugs: string[]) {
  return dedupeCommands(slugs.flatMap(slug => sourceBySlug.get(slug)?.commands ?? []));
}

const prefixCommands = sourceCommands.filter(command => command.name.toLowerCase().startsWith("prefix"));
const serverCommands = dedupeCommands([...prefixCommands, ...collect("home", "server")]);
const informationMatchers = [
  "avatar", "banner", "badges", "who", "whois", "joined", "roles", "serveravatar",
  "membercount", "newest", "oldest", "channelinfo", "roleinfo", "inviteinfo", "emojiinfo",
  "stickerinfo", "snowflake", "weather", "color", "calculator", "perms", "serverinfo",
];
const informationCommands = dedupeCommands([
  ...collect("user"),
  ...(sourceBySlug.get("utility")?.commands ?? []).filter(command =>
    informationMatchers.some(term => command.name.toLowerCase().includes(term)),
  ),
]);
const miscellaneousCommands = sourceBySlug.get("miscellaneous")?.commands ?? collect("utility");

const featuredCategories: CategoryEntry[] = [
  { slug: "server", name: "Server", description: "Core server commands and information.", commands: serverCommands },
  { slug: "moderation", name: "Moderation", description: "Staff and moderation controls.", commands: collect("moderation") },
  { slug: "information", name: "Information", description: "Member and server information tools.", commands: informationCommands },
  { slug: "roleplay", name: "Roleplay", description: "Roleplay actions and reactions.", commands: collect("roleplay") },
  { slug: "lastfm", name: "Last.fm", description: "Scrobbles, listening stats, and music profiles.", commands: collect("lastfm") },
  { slug: "miscellaneous", name: "Miscellaneous", description: "Embeds and miscellaneous server tools.", commands: miscellaneousCommands },
];
const featuredSourceSlugs = new Set(["home", "server", "user", "moderation", "roleplay", "lastfm", "miscellaneous"]);
const displayCategories = [
  ...featuredCategories,
  ...sourceCategories.filter(category => !featuredSourceSlugs.has(category.slug)),
];

const iconBySlug: Record<string, typeof Layers3> = {
  server: Server,
  moderation: Gavel,
  information: Info,
  roleplay: Heart,
  miscellaneous: Wrench,
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
  premium: Crown,
  crypto: Bitcoin,
  snipe: Layers3,
  counters: ListChecks,
  timers: Timer,
  logs: ScrollText,
  "bump-reminder": BellRing,
  giveaways: Gift,
  leveling: Radio,
  user: User,
  images: Image,
  security: ShieldCheck,
  welcome: Info,
  ai: Sparkles,
};

const brandLogoBySlug: Record<string, string> = {
  spotify: "https://cdn.simpleicons.org/spotify/bdbdbd",
  lastfm: "https://cdn.simpleicons.org/lastdotfm/bdbdbd",
  kick: "https://cdn.simpleicons.org/kick/bdbdbd",
  twitch: "https://cdn.simpleicons.org/twitch/bdbdbd",
  youtube: "https://cdn.simpleicons.org/youtube/bdbdbd",
  twitter: "https://cdn.simpleicons.org/x/bdbdbd",
  reddit: "https://cdn.simpleicons.org/reddit/bdbdbd",
  soundcloud: "https://cdn.simpleicons.org/soundcloud/bdbdbd",
  roblox: "https://cdn.simpleicons.org/roblox/bdbdbd",
  fortnite: "https://cdn.simpleicons.org/fortnite/bdbdbd",
};

function CategoryIcon({ slug, selected }: { slug: string; selected: boolean }) {
  const brandLogo = brandLogoBySlug[slug];
  const Icon = iconBySlug[slug] ?? Layers3;
  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${selected ? "border-white/15 bg-white/[.08]" : "border-white/[.06] bg-white/[.025]"}`}>
      {brandLogo ? (
        <img src={brandLogo} alt="" className={`h-[18px] w-[18px] object-contain ${selected ? "opacity-100" : "opacity-65"}`} />
      ) : (
        <Icon className={`h-[18px] w-[18px] ${selected ? "text-white/90" : "text-white/52"}`} />
      )}
    </span>
  );
}

function getArguments(usage: string) {
  const matches = usage.match(/[([][^\])]+[\])]/g) ?? [];
  return matches.map(value => value.slice(1, -1).trim()).filter(Boolean);
}

function normalizeCategory(value?: string) {
  if (!value || value === "all" || value === "home" || value === "server") return "server";
  if (value === "user") return "information";
  return displayCategories.some(category => category.slug === value) ? value : "server";
}

function commandCategoryName(commandName: string) {
  const name = commandName.toLowerCase();
  const match = displayCategories.find(group => group.commands.some(command => command.name.toLowerCase() === name));
  return match?.name ?? "Command";
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

function CommandsPage() {
  const search = Route.useSearch();
  const railRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(() => normalizeCategory(search.category));
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const activeCategory = displayCategories.find(item => item.slug === category) ?? displayCategories[0];

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? sourceCommands : activeCategory.commands;
    if (!q) return pool;
    return pool.filter(command =>
      command.name.toLowerCase().includes(q) ||
      command.description.toLowerCase().includes(q) ||
      command.usage.toLowerCase().includes(q) ||
      (command.aliases ?? []).some(alias => alias.toLowerCase().includes(q)),
    );
  }, [activeCategory, query]);

  const commandSuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return sourceCommands
      .filter(command =>
        command.name.toLowerCase().includes(q) ||
        (command.aliases ?? []).some(alias => alias.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aRank = aName === q ? 0 : aName.startsWith(q) ? 1 : 2;
        const bRank = bName === q ? 0 : bName.startsWith(q) ? 1 : 2;
        return aRank - bRank || aName.localeCompare(bName);
      })
      .slice(0, 8);
  }, [query]);

  const categorySuggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return displayCategories.filter(group => group.name.toLowerCase().includes(q)).slice(0, 3);
  }, [query]);

  useEffect(() => {
    if (!searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, [searchOpen]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => {
      setCanScrollLeft(rail.scrollLeft > 6);
      setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 6);
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
    railRef.current?.scrollBy({ left: direction === "left" ? -520 : 520, behavior: "smooth" });
  };

  const chooseCommand = (command: CommandEntry) => {
    setQuery(command.name);
    setSearchOpen(false);
  };

  const chooseCategory = (group: CategoryEntry) => {
    setCategory(group.slug);
    setQuery("");
    setSearchOpen(false);
  };

  const copyCommand = async (usage: string, key: string) => {
    try {
      await navigator.clipboard.writeText(usage);
      setCopied(key);
      window.setTimeout(() => setCopied(current => current === key ? null : current), 1200);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080909] text-white">
      <Navbar />

      {searchOpen ? (
        <div
          className="fixed inset-0 z-[220] flex items-start justify-center bg-black/78 px-4 pt-[16vh] backdrop-blur-[10px]"
          onMouseDown={event => { if (event.currentTarget === event.target) setSearchOpen(false); }}
        >
          <div className="w-full max-w-[720px] overflow-hidden rounded-[28px] border border-white/[.11] bg-[#111212] shadow-[0_36px_120px_rgba(0,0,0,.72)]">
            <div className="flex items-center gap-4 px-5 py-5 sm:px-6">
              <Search className="h-6 w-6 shrink-0 text-white/74" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => {
                  if (event.key === "Escape") setSearchOpen(false);
                  if (event.key === "Enter" && commandSuggestions[0]) chooseCommand(commandSuggestions[0]);
                }}
                placeholder="Search commands or categories..."
                className="min-w-0 flex-1 bg-transparent text-[18px] font-medium text-white outline-none placeholder:text-white/34 sm:text-[20px]"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className="grid h-9 w-9 place-items-center rounded-xl text-white/42 transition hover:bg-white/[.06] hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            {query ? (
              <div className="max-h-[48vh] overflow-y-auto border-t border-white/[.07] p-2 sm:p-3">
                {categorySuggestions.length ? (
                  <div className="mb-2">
                    <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[.16em] text-white/28">Categories</div>
                    {categorySuggestions.map(group => (
                      <button key={group.slug} type="button" onClick={() => chooseCategory(group)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[.055]">
                        <CategoryIcon slug={group.slug} selected={false} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-semibold text-white/90">{group.name}</div>
                          <div className="mt-0.5 text-[11px] text-white/36">{group.commands.length} commands</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/25" />
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[.16em] text-white/28">Commands</div>
                {commandSuggestions.length ? commandSuggestions.map(command => (
                  <button key={command.name} type="button" onClick={() => chooseCommand(command)} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-white/[.055]">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-black/25"><Terminal className="h-4 w-4 text-white/56" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-white/92">{command.name}</span>
                        <span className="rounded-md bg-white/[.055] px-1.5 py-0.5 text-[9px] text-white/38">{commandCategoryName(command.name)}</span>
                      </div>
                      <div className="mt-1 truncate text-[11px] text-white/38">{command.description}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/22" />
                  </button>
                )) : (
                  <div className="px-4 py-8 text-center text-[13px] text-white/38">No commands found for “{query}”</div>
                )}
              </div>
            ) : (
              <div className="border-t border-white/[.07] px-6 py-4 text-[12px] text-white/30">Start typing to find a command instantly.</div>
            )}
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-[1180px] px-4 pb-24 pt-5 sm:px-6 md:pt-7">
        <section className="flex min-h-[118px] items-center justify-between gap-5 border-b border-white/[.06] pb-5">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-white/[.08] bg-[#151616] text-white/68"><Terminal className="h-5 w-5" /></div>
            <div>
              <h1 className="text-[34px] font-semibold tracking-[-.045em] text-white sm:text-[38px]">Commands</h1>
              <p className="mt-1 text-[12px] text-white/36 sm:text-[13px]">Browse Ware by category, alias, or usage.</p>
            </div>
          </div>

          <div className="text-right">
            <div className="mb-1.5 text-[11px] lowercase tracking-wide text-white/34">search</div>
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search commands" className="grid h-12 w-12 place-items-center rounded-2xl border border-white/[.09] bg-[#141515] text-white/62 transition hover:border-white/[.18] hover:bg-[#1b1c1c] hover:text-white">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </section>

        {query ? (
          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/[.07] bg-[#111212] px-4 py-3">
            <div className="min-w-0 text-[13px] text-white/55">Showing results for <span className="font-semibold text-white/88">“{query}”</span> <span className="ml-2 text-white/30">{shown.length} matches</span></div>
            <button type="button" onClick={() => setQuery("")} className="shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] text-white/42 transition hover:bg-white/[.05] hover:text-white">Clear</button>
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-2.5">
          <button type="button" aria-label="Scroll categories left" onClick={() => moveRail("left")} disabled={!canScrollLeft} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/[.07] bg-[#111212] text-white/34 transition hover:border-white/[.14] hover:bg-[#181919] hover:text-white/78 disabled:opacity-15"><ChevronLeft className="h-4 w-4" /></button>

          <div ref={railRef} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex h-[64px] w-max min-w-full items-center gap-2">
              {displayCategories.map(group => {
                const selected = category === group.slug;
                return (
                  <button key={group.slug} type="button" onClick={() => { setCategory(group.slug); setQuery(""); }} className={`relative flex h-[54px] min-w-[158px] items-center gap-2.5 rounded-2xl border px-3 text-left transition ${selected ? "border-white/[.14] bg-[#232424] text-white" : "border-white/[.055] bg-[#101111] text-white/54 hover:border-white/[.10] hover:bg-[#171818] hover:text-white/88"}`}>
                    <CategoryIcon slug={group.slug} selected={selected} />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{group.name}</span>
                    <span className={`rounded-lg px-1.5 py-1 text-[9px] ${selected ? "bg-white/[.09] text-white/72" : "bg-black/25 text-white/34"}`}>{group.commands.length}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" aria-label="Scroll categories right" onClick={() => moveRail("right")} disabled={!canScrollRight} className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/[.07] bg-[#111212] text-white/34 transition hover:border-white/[.14] hover:bg-[#181919] hover:text-white/78 disabled:opacity-15"><ChevronRight className="h-4 w-4" /></button>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((command, index) => {
            const args = getArguments(command.usage);
            const permission = command.permission || "None";
            const key = `${activeCategory.slug}:${command.name}:${index}`;
            const isCopied = copied === key;
            return (
              <article key={key} className="group min-h-[276px] overflow-hidden rounded-[20px] border border-white/[.08] bg-[#101111] shadow-[inset_0_1px_0_rgba(255,255,255,.018)] transition duration-200 hover:-translate-y-0.5 hover:border-white/[.15] hover:bg-[#121313]">
                <div className="flex min-h-[126px] items-start justify-between gap-4 px-5 py-5">
                  <div className="min-w-0 pr-1">
                    <div className="text-[20px] font-semibold tracking-[-.025em] text-white/96">{command.name}</div>
                    <p className="mt-2.5 text-[14px] leading-[1.6] text-white/50">{command.description}</p>
                  </div>
                  <button type="button" onClick={() => copyCommand(command.usage, key)} title={isCopied ? "Copied" : "Copy command"} aria-label={isCopied ? "Copied command" : `Copy ${command.name} command`} className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition ${isCopied ? "border-white/[.22] bg-[#242525] text-white" : "border-white/[.13] bg-[#1a1b1b] text-white/62 hover:border-white/[.25] hover:bg-[#242525] hover:text-white"}`}>
                    {isCopied ? <Check className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />}
                  </button>
                </div>

                <div className="min-h-[150px] border-t border-white/[.07] bg-[#0d0e0e] px-5 py-4.5">
                  <div className="text-[11px] font-medium uppercase tracking-[.12em] text-white/28">Arguments</div>
                  <div className="mt-2.5 flex min-h-8 flex-wrap gap-2">
                    {args.length ? args.map((arg, argIndex) => <span key={`${arg}-${argIndex}`} className="rounded-lg border border-white/[.055] bg-[#1a1b1b] px-2.5 py-1.5 text-[11px] italic text-white/68">{arg}</span>) : <span className="text-[11px] text-white/32">none</span>}
                  </div>
                  <div className="mt-4 text-[11px] font-medium uppercase tracking-[.12em] text-white/28">Permissions</div>
                  <div className="mt-2.5 min-h-8">
                    {permission.toLowerCase() === "none" ? <span className="text-[11px] text-white/32">none</span> : <span className="inline-flex rounded-lg border border-white/[.055] bg-[#1a1b1b] px-2.5 py-1.5 text-[11px] text-white/68">{permission}</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!shown.length ? (
          <div className="mt-8 rounded-[20px] border border-white/[.08] bg-[#111212] px-6 py-16 text-center">
            <Search className="mx-auto h-5 w-5 text-white/25" />
            <div className="mt-4 text-sm font-medium text-white/65">No commands found</div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
