import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Layers3,
  Server,
  Gavel,
  Info,
  Heart,
  Music2,
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

const WARE_LOGO = "/ware-logo.svg?v=4";

const iconBySlug: Record<string, typeof Layers3> = {
  server: Server,
  moderation: Gavel,
  information: Info,
  roleplay: Heart,
  lastfm: Music2,
  miscellaneous: Wrench,
  "channels-roles": Settings2,
  voicemaster: Volume2,
  "config-logs": Settings2,
  antinuke: ShieldCheck,
  antiraid: ShieldCheck,
  economy: WalletCards,
  fun: Sparkles,
  games: Gamepad2,
  utility: Wrench,
  tickets: Ticket,
  premium: Crown,
};

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

function CommandsIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1420);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="ware-command-enter fixed inset-0 z-[500] grid place-items-center bg-black" aria-hidden>
      <img src={WARE_LOGO} alt="" className="ware-command-enter-logo h-[116px] w-[116px] object-contain" />
      <style>{`
        .ware-command-enter {
          pointer-events: none;
          animation: wareCommandOverlay 1.36s linear both;
          will-change: opacity;
        }
        .ware-command-enter-logo {
          animation: wareCommandPopBack 1.36s cubic-bezier(.2,.78,.2,1) both;
          will-change: transform, opacity, filter;
        }
        @keyframes wareCommandPopBack {
          0% { transform: scale(.68); opacity: 0; filter: blur(10px); }
          18% { transform: scale(1.10); opacity: 1; filter: blur(0); }
          40% { transform: scale(1); opacity: 1; filter: blur(0); }
          56% { transform: scale(.98); opacity: 1; filter: blur(0); }
          100% { transform: scale(.78); opacity: 0; filter: blur(9px); }
        }
        @keyframes wareCommandOverlay {
          0%, 62% { opacity: 1; }
          100% { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ware-command-enter { animation-duration: .45s; }
          .ware-command-enter-logo { animation: none; opacity: 1; transform: scale(1); filter: none; }
        }
      `}</style>
    </div>
  );
}

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
      <CommandsIntro />
      <Navbar />

      <main className="mx-auto max-w-[1120px] px-4 pb-24 pt-4 sm:px-6 md:pt-6">
        <div className="flex min-h-[108px] items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full border border-white/[.08] bg-[#171818] text-white/68">
              <Terminal className="h-5 w-5" />
            </div>
            <h1 className="text-[31px] font-semibold tracking-[-.045em] text-white sm:text-[34px]">Commands</h1>
          </div>

          <div className="flex min-w-0 items-end justify-end">
            {searchOpen ? (
              <div className="w-[245px] max-w-[48vw]">
                <div className="mb-1.5 text-right text-[11px] lowercase tracking-wide text-white/35">search</div>
                <div className="flex h-11 items-center gap-2.5 rounded-xl border border-white/[.10] bg-[#141515] px-3.5 focus-within:border-white/[.22]">
                  <Search className="h-4 w-4 shrink-0 text-white/38" />
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
                    className="min-w-0 flex-1 bg-transparent text-[13px] text-white/85 outline-none placeholder:text-white/25"
                  />
                  {query ? <span className="text-[10px] text-white/35">{shown.length}</span> : null}
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="mb-1.5 text-[11px] lowercase tracking-wide text-white/35">search</div>
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search commands"
                  className="grid h-12 w-12 place-items-center rounded-xl border border-white/[.09] bg-[#151616] text-white/62 transition hover:border-white/[.18] hover:bg-[#1b1c1c] hover:text-white"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex h-[59px] items-stretch overflow-hidden rounded-[16px] border border-white/[.085] bg-[#121313]">
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => moveRail("left")}
            disabled={!canScrollLeft}
            className="grid w-11 shrink-0 place-items-center border-r border-white/[.065] bg-[#101111] text-white/36 transition hover:bg-[#1a1b1b] hover:text-white/72 disabled:opacity-20"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div ref={railRef} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex h-full w-max min-w-full items-stretch">
              {displayCategories.map(group => {
                const Icon = iconBySlug[group.slug] ?? Layers3;
                const selected = category === group.slug;
                return (
                  <button
                    key={group.slug}
                    type="button"
                    onClick={() => {
                      setCategory(group.slug);
                      setQuery("");
                    }}
                    className={`flex min-w-[154px] items-center gap-2.5 border-r border-white/[.06] px-4 text-left transition ${selected ? "bg-[#232424] text-white" : "bg-transparent text-white/58 hover:bg-[#191a1a] hover:text-white/90"}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0 opacity-80" />
                    <span className="truncate text-[13px] font-medium">{group.name}</span>
                    <span className={`ml-auto rounded-md px-2 py-1 text-[10px] ${selected ? "bg-[#343535] text-white/72" : "bg-[#202121] text-white/42"}`}>
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
            className="grid w-11 shrink-0 place-items-center border-l border-white/[.065] bg-[#101111] text-white/36 transition hover:bg-[#1a1b1b] hover:text-white/72 disabled:opacity-20"
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
              <article key={key} className="min-h-[268px] overflow-hidden rounded-[22px] border border-[#2a2b2b] bg-[#101111] transition-colors duration-150 hover:border-[#3b3c3c] hover:bg-[#121313]">
                <div className="flex min-h-[120px] items-start justify-between gap-4 px-6 py-5.5">
                  <div className="min-w-0">
                    <div className="text-[17px] font-semibold tracking-[-.02em] text-white/95">{command.name}</div>
                    <p className="mt-2.5 text-[13px] leading-5.5 text-white/48">{command.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCommand(command.usage, key)}
                    title={isCopied ? "Copied" : "Copy command"}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[.07] bg-[#141515] text-white/36 transition hover:border-white/[.16] hover:bg-[#1d1e1e] hover:text-white"
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="min-h-[148px] border-t border-[#292a2a] bg-[#0e0f0f] px-6 py-5">
                  <div className="text-[11px] font-medium lowercase tracking-[.01em] text-white/52">arguments</div>
                  <div className="mt-3 flex min-h-7 flex-wrap gap-2">
                    {args.length ? args.map((arg, argIndex) => (
                      <span key={`${arg}-${argIndex}`} className="rounded-lg bg-[#1c1d1d] px-3 py-1.5 text-[11px] italic text-white/72">{arg}</span>
                    )) : <span className="text-[11px] text-white/35">none</span>}
                  </div>

                  <div className="mt-4 text-[11px] font-medium lowercase tracking-[.01em] text-white/52">permissions</div>
                  <div className="mt-3 min-h-7">
                    {permission.toLowerCase() === "none"
                      ? <span className="text-[11px] text-white/35">none</span>
                      : <span className="inline-flex rounded-lg bg-[#1c1d1d] px-3 py-1.5 text-[11px] text-white/72">{permission}</span>}
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
