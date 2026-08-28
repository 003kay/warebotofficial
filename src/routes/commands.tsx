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
  Hash,
  BellRing,
  Gift,
  User,
  Image,
  ScrollText,
  Radio,
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
    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border transition ${selected ? "border-white/[.11] bg-white/[.08]" : "border-white/[.055] bg-white/[.025]"}`}>
      {brandLogo ? (
        <img src={brandLogo} alt="" className={`h-[17px] w-[17px] object-contain transition ${selected ? "opacity-100" : "opacity-70"}`} />
      ) : (
        <Icon className={`h-[17px] w-[17px] transition ${selected ? "text-white/90" : "text-white/55"}`} />
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
    <div className="min-h-screen bg-[#090a0a] text-white">
      <Navbar />

      <main className="mx-auto max-w-[1160px] px-4 pb-24 pt-4 sm:px-6 md:pt-6">
        <div className="flex min-h-[112px] items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-white/[.08] bg-[#171818] text-white/72">
              <Terminal className="h-5 w-5" />
            </div>
            <h1 className="text-[33px] font-semibold tracking-[-.045em] text-white sm:text-[36px]">Commands</h1>
          </div>

          <div className="flex min-w-0 items-end justify-end">
            {searchOpen ? (
              <div className="w-[270px] max-w-[52vw]">
                <div className="mb-1.5 text-right text-[12px] lowercase tracking-wide text-white/38">search</div>
                <div className="flex h-12 items-center gap-2.5 rounded-xl border border-white/[.11] bg-[#141515] px-3.5 focus-within:border-white/[.24]">
                  <Search className="h-[17px] w-[17px] shrink-0 text-white/42" />
                  <input
                    autoFocus
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === "Escape") {
                        setQuery("");
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Search commands..."
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-white/88 outline-none placeholder:text-white/28"
                  />
                  {query ? <span className="text-[11px] text-white/38">{shown.length}</span> : null}
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="mb-1.5 text-[12px] lowercase tracking-wide text-white/38">search</div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search commands"
                  className="grid h-12 w-12 place-items-center rounded-xl border border-white/[.10] bg-[#151616] text-white/68 transition hover:border-white/[.20] hover:bg-[#1d1e1e] hover:text-white"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-[18px] border border-white/[.075] bg-[#0d0e0e] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.018)]">
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => moveRail("left")}
            disabled={!canScrollLeft}
            className="grid h-12 w-10 shrink-0 place-items-center rounded-xl border border-transparent text-white/35 transition hover:border-white/[.06] hover:bg-[#171818] hover:text-white/75 disabled:opacity-15"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={railRef} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex h-[52px] w-max min-w-full items-center gap-1.5">
              {displayCategories.map(group => {
                const selected = category === group.slug;
                return (
                  <button
                    key={group.slug}
                    type="button"
                    onClick={() => {
                      setCategory(group.slug);
                      setQuery("");
                    }}
                    className={`flex h-12 min-w-[158px] items-center gap-2.5 rounded-[12px] border px-3.5 text-left transition ${selected ? "border-white/[.11] bg-[#242525] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.035)]" : "border-transparent bg-transparent text-white/58 hover:border-white/[.055] hover:bg-[#171818] hover:text-white/92"}`}
                  >
                    <CategoryIcon slug={group.slug} selected={selected} />
                    <span className="truncate text-[13.5px] font-medium tracking-[-.01em]">{group.name}</span>
                    <span className={`ml-auto rounded-full px-2 py-1 text-[10px] font-medium ${selected ? "bg-white/[.09] text-white/72" : "bg-white/[.045] text-white/38"}`}>
                      {group.commands.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            aria-label="Scroll categories right"
            onClick={() => moveRail("right")}
            disabled={!canScrollRight}
            className="grid h-12 w-10 shrink-0 place-items-center rounded-xl border border-transparent text-white/35 transition hover:border-white/[.06] hover:bg-[#171818] hover:text-white/75 disabled:opacity-15"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((command, index) => {
            const args = getArguments(command.usage);
            const permission = command.permission || "None";
            const key = `${activeCategory.slug}:${command.name}:${index}`;
            const isCopied = copied === key;

            return (
              <article key={key} className="min-h-[286px] overflow-hidden rounded-[22px] border border-[#2b2c2c] bg-[#101111] transition duration-150 hover:-translate-y-px hover:border-[#414242] hover:bg-[#131414]">
                <div className="flex min-h-[130px] items-start justify-between gap-4 px-6 py-6">
                  <div className="min-w-0 pr-1">
                    <div className="text-[19px] font-semibold tracking-[-.025em] text-white/96">{command.name}</div>
                    <p className="mt-2.5 text-[14px] leading-[1.65] text-white/54">{command.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCommand(command.usage, key)}
                    title={isCopied ? "Copied" : "Copy command"}
                    aria-label={isCopied ? "Copied command" : `Copy ${command.name} command`}
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-[11px] border transition duration-150 ${isCopied ? "border-white/[.20] bg-[#222323] text-white" : "border-white/[.14] bg-[#1a1b1b] text-white/68 hover:-translate-y-px hover:border-white/[.26] hover:bg-[#242525] hover:text-white"}`}
                  >
                    {isCopied ? <Check className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />}
                  </button>
                </div>

                <div className="min-h-[156px] border-t border-[#2a2b2b] bg-[#0e0f0f] px-6 py-5">
                  <div className="text-[12.5px] font-medium lowercase tracking-[.01em] text-white/58">arguments</div>
                  <div className="mt-3 flex min-h-8 flex-wrap gap-2">
                    {args.length ? args.map((arg, argIndex) => (
                      <span key={`${arg}-${argIndex}`} className="rounded-lg border border-white/[.055] bg-[#1c1d1d] px-3 py-1.5 text-[12px] italic text-white/76">{arg}</span>
                    )) : <span className="text-[12px] text-white/40">none</span>}
                  </div>

                  <div className="mt-4 text-[12.5px] font-medium lowercase tracking-[.01em] text-white/58">permissions</div>
                  <div className="mt-3 min-h-8">
                    {permission.toLowerCase() === "none"
                      ? <span className="text-[12px] text-white/40">none</span>
                      : <span className="inline-flex rounded-lg border border-white/[.055] bg-[#1c1d1d] px-3 py-1.5 text-[12px] text-white/76">{permission}</span>}
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
