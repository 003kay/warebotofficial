import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Search, Layers3, ShieldCheck, Gavel, Info, Heart, Music2,
  Ticket, Bot, Sparkles, Gamepad2, Wrench, Gift, Crown, User, Server, Image,
  ScrollText, WalletCards, Settings2, Radio, Volume2, Command as CommandIcon,
  Copy, Check, ChevronLeft, ChevronRight, Bitcoin, ListChecks, Timer, Youtube,
  Twitch, Cloud, Hash, MessageCircle, Gamepad, BellRing,
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

const latestBotCommands: CategoryEntry[] = [
  {
    slug: "latest",
    name: "Latest",
    description: "Newest command paths synced from the current bot.py build.",
    commands: [
      { name: "restrictcommand", description: "Restrict a command so only members with a selected role can use it.", usage: ",restrictcommand (command) (role)", example: ",restrictcommand image Owner", aliases: ["rc"], permission: "Manage Guild" },
      { name: "boosterrole", description: "Create or manage a personal booster role.", usage: ",boosterrole (color) (second color) (name)", example: ",boosterrole ff0000 000001 cute", aliases: ["br"] },
      { name: "boosterrole create", description: "Create your personal booster role.", usage: ",boosterrole create", example: ",br create" },
      { name: "boosterrole remove", description: "Delete your personal booster role.", usage: ",boosterrole remove", example: ",br remove", aliases: ["delete"] },
      { name: "steal-sticker", description: "Steal stickers from a Discord message link and add them to this server.", usage: ",steal-sticker (message link)", example: ",steal-sticker https://discord.com/channels/123/456/789", aliases: ["stealsticker", "stickersteal"], permission: "Manage Expressions" },
      { name: "security setup", description: "Install and repair Ware's complete security configuration.", usage: ",security setup", example: ",security setup", permission: "Manage Guild" },
      { name: "security panic", description: "Immediately place the server into Ware's emergency protection mode.", usage: ",security panic", example: ",security panic", permission: "Manage Guild" },
      { name: "security recover", description: "Recover the server from security panic mode.", usage: ",security recover", example: ",security recover", aliases: ["unpanic"], permission: "Manage Guild" },
      { name: "security quarantine", description: "Quarantine a member using Ware security controls.", usage: ",security quarantine (member)", example: ",security quarantine @user", aliases: ["isolate"], permission: "Manage Guild" },
      { name: "security release", description: "Release a member from Ware security quarantine.", usage: ",security release (member)", example: ",security release @user", aliases: ["unquarantine"], permission: "Manage Guild" },
      { name: "security joingate", description: "Configure Join Gate security protections.", usage: ",security joingate", example: ",security joingate", aliases: ["gate"], permission: "Manage Guild" },
      { name: "security heat", description: "Configure Ware's security heat system.", usage: ",security heat", example: ",security heat", permission: "Manage Guild" },
      { name: "security raid", description: "Configure Ware's raid protection controls.", usage: ",security raid", example: ",security raid", permission: "Manage Guild" },
      { name: "security backup", description: "Create or manage Ware security backups.", usage: ",security backup", example: ",security backup", permission: "Manage Guild" },
      { name: "security score", description: "Audit the server's current security configuration.", usage: ",security score", example: ",security score", aliases: ["audit"], permission: "Manage Guild" },
      { name: "customize", description: "Customize Ware's server-facing bot profile.", usage: ",customize", example: ",customize", permission: "Manage Guild" },
      { name: "customize avatar", description: "Change Ware's server avatar customization.", usage: ",customize avatar", example: ",customize avatar", permission: "Manage Guild" },
      { name: "customize banner", description: "Change Ware's server banner customization.", usage: ",customize banner", example: ",customize banner", permission: "Manage Guild" },
      { name: "customize bio", description: "Change Ware's server bio customization.", usage: ",customize bio", example: ",customize bio", permission: "Manage Guild" },
      { name: "scam", description: "Configure Ware's anti-scam protection.", usage: ",scam", example: ",scam", aliases: ["antiscam"], permission: "Manage Guild" },
      { name: "scam on", description: "Enable anti-scam protection.", usage: ",scam on", example: ",scam on", aliases: ["enable"], permission: "Manage Guild" },
      { name: "scam off", description: "Disable anti-scam protection.", usage: ",scam off", example: ",scam off", aliases: ["disable"], permission: "Manage Guild" },
      { name: "scam whitelist add", description: "Add an entry to the anti-scam whitelist.", usage: ",scam whitelist add (value)", example: ",scam whitelist add example.com", permission: "Manage Guild" },
      { name: "scam whitelist remove", description: "Remove an entry from the anti-scam whitelist.", usage: ",scam whitelist remove (value)", example: ",scam whitelist remove example.com", aliases: ["rm"], permission: "Manage Guild" },
      { name: "selfrole", description: "Create and manage self-assignable role panels.", usage: ",selfrole", example: ",selfrole", aliases: ["selfroles", "sr"], permission: "Manage Roles" },
      { name: "selfrole create", description: "Create a new self-role panel.", usage: ",selfrole create", example: ",selfrole create", permission: "Manage Roles" },
      { name: "selfrole add", description: "Add a role to a self-role panel.", usage: ",selfrole add (role)", example: ",selfrole add Member", permission: "Manage Roles" },
      { name: "selfrole remove", description: "Remove a role from a self-role panel.", usage: ",selfrole remove (role)", example: ",selfrole remove Member", aliases: ["rm"], permission: "Manage Roles" },
      { name: "selfrole send", description: "Send the configured self-role panel.", usage: ",selfrole send", example: ",selfrole send", aliases: ["panel", "post"], permission: "Manage Roles" },
      { name: "ticket unclaim", description: "Unclaim a claimed support ticket.", usage: ",ticket unclaim", example: ",ticket unclaim", aliases: ["ucl"] },
      { name: "ticket reopen", description: "Reopen a closed support ticket.", usage: ",ticket reopen", example: ",ticket reopen" },
      { name: "ticket delete", description: "Delete the current support ticket.", usage: ",ticket delete", example: ",ticket delete" },
      { name: "ticket info", description: "View information about the current support ticket.", usage: ",ticket info", example: ",ticket info" },
      { name: "fm", description: "Show the compact Last.fm now-playing card.", usage: ",fm", example: ",fm" },
    ],
  },
];

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
  latestBotCommands,
  [...commandCategories, lastFmCategory] as unknown as CategoryEntry[],
  referenceCommandCategories as unknown as CategoryEntry[],
);

const WARE_COMMAND_TOTAL = 822;

const iconBySlug: Record<string, typeof Layers3> = {
  latest: Sparkles,
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
    () => {
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
    },
    [],
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (category === "latest") {
      const latest = latestBotCommands[0].commands.map(command => ({ ...command, category: "Latest", categorySlug: "latest" }));
      return latest.filter(command => !q || command.name.toLowerCase().includes(q) || command.description.toLowerCase().includes(q) || command.usage.toLowerCase().includes(q) || (command.aliases ?? []).some(alias => alias.toLowerCase().includes(q)));
    }
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

    const updateScrollState = () => {
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

    updateScrollState();
    rail.addEventListener("wheel", onWheel, { passive: false });
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const moveRail = (direction: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction === "left" ? -Math.max(420, rail.clientWidth * 0.78) : Math.max(420, rail.clientWidth * 0.78),
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
    <div className="relative min-h-screen overflow-hidden bg-[#070808] text-white">
      <Starfield />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,.06),transparent_58%)]" />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-[1480px] px-5 pb-24 pt-8 md:px-9">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="group inline-flex items-center gap-2 text-sm text-white/38 transition hover:text-white">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Home
          </Link>
          <div className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 font-mono text-[10px] text-white/35">
            {WARE_COMMAND_TOTAL.toLocaleString()} command paths
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012))] p-5 shadow-[0_40px_120px_-75px_rgba(255,255,255,.18)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] uppercase tracking-[0.19em] text-white/32">
                <CommandIcon className="h-3.5 w-3.5" /> command library
              </div>
              <h1 className="mt-4 text-5xl font-bold tracking-[-0.065em] md:text-7xl">Commands</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/38">Find what you need fast. Browse the full Ware command system by category, alias, or usage.</p>
            </div>

            <div className="flex min-w-[210px] items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3.5 shadow-inner">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white/65">
                <ActiveIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-[0.15em] text-white/25">Browsing</div>
                <div className="mt-1 text-sm font-medium">{activeCategory?.name ?? "All Commands"}</div>
                <div className="mt-0.5 font-mono text-[10px] text-white/28">{displayedCount.toLocaleString()} commands</div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3 rounded-[18px] border border-white/[0.08] bg-black/25 px-4 py-4 transition focus-within:border-white/[0.18] focus-within:bg-black/35">
            <Search className="h-4 w-4 text-white/30" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search commands, aliases, or usage..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"
            />
            {query ? <span className="rounded-lg bg-white/[0.05] px-2 py-1 font-mono text-[9px] text-white/35">{shown.length} results</span> : null}
          </div>
        </section>

        <section className="sticky top-3 z-30 mt-5">
          <div className="relative overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#0a0b0b]/92 p-2 shadow-[0_24px_70px_-42px_rgba(0,0,0,.9)] backdrop-blur-2xl">
            <div className={`pointer-events-none absolute inset-y-0 left-14 z-10 w-16 bg-gradient-to-r from-[#0a0b0b] to-transparent transition-opacity ${canScrollLeft ? "opacity-100" : "opacity-0"}`} />
            <div className={`pointer-events-none absolute inset-y-0 right-14 z-10 w-16 bg-gradient-to-l from-[#0a0b0b] to-transparent transition-opacity ${canScrollRight ? "opacity-100" : "opacity-0"}`} />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveRail("left")}
                disabled={!canScrollLeft}
                className="relative z-20 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/55 transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white disabled:cursor-default disabled:opacity-25"
                aria-label="Scroll categories left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div
                ref={railRef}
                className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                <div className="flex w-max min-w-full items-center gap-2 py-0.5">
                  <button
                    type="button"
                    onClick={() => setCategory("all")}
                    className={`group relative flex min-w-[112px] items-center gap-3 rounded-[17px] border px-3.5 py-2.5 text-left transition-all duration-200 ${category === "all" ? "border-white/[0.22] bg-white text-black shadow-[0_10px_30px_-18px_rgba(255,255,255,.65)]" : "border-white/[0.07] bg-white/[0.022] text-white/55 hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.055] hover:text-white"}`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border ${category === "all" ? "border-black/10 bg-black/[0.07]" : "border-white/[0.08] bg-white/[0.035]"}`}>
                      <Layers3 className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold">All</span>
                      <span className={`mt-0.5 block font-mono text-[9px] ${category === "all" ? "text-black/45" : "text-white/28"}`}>{WARE_COMMAND_TOTAL.toLocaleString()}</span>
                    </span>
                  </button>

                  {categories.map(group => {
                    const Icon = iconBySlug[group.slug] ?? Layers3;
                    const selected = category === group.slug;
                    return (
                      <button
                        key={group.slug}
                        type="button"
                        onClick={() => setCategory(group.slug)}
                        className={`group relative flex min-w-[126px] items-center gap-3 rounded-[17px] border px-3.5 py-2.5 text-left transition-all duration-200 ${selected ? "border-white/[0.18] bg-white/[0.10] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_12px_30px_-24px_rgba(255,255,255,.35)]" : "border-white/[0.065] bg-white/[0.018] text-white/48 hover:-translate-y-0.5 hover:border-white/[0.13] hover:bg-white/[0.05] hover:text-white/82"}`}
                      >
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition ${selected ? "border-white/[0.13] bg-white/[0.08] text-white" : "border-white/[0.07] bg-white/[0.025] text-white/45 group-hover:text-white/75"}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block max-w-[110px] truncate text-[11px] font-semibold">{group.name}</span>
                          <span className="mt-0.5 block font-mono text-[9px] text-white/28">{group.commands.length} cmds</span>
                        </span>
                        {selected ? <span className="absolute inset-x-5 -bottom-[9px] h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" /> : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => moveRail("right")}
                disabled={!canScrollRight}
                className="relative z-20 grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-white/55 transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white disabled:cursor-default disabled:opacity-25"
                aria-label="Scroll categories right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {activeCategory ? (
          <div className="mt-6 flex items-center justify-between gap-4 rounded-[20px] border border-white/[0.06] bg-white/[0.018] px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.075] bg-white/[0.025] text-white/55"><ActiveIcon className="h-4 w-4" /></div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{activeCategory.name}</div>
                <div className="mt-0.5 truncate text-xs text-white/30">{activeCategory.description}</div>
              </div>
            </div>
            <div className="shrink-0 rounded-lg bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] text-white/30">{shown.length} commands</div>
          </div>
        ) : null}

        <section className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((command, index) => {
              const args = getArguments(command.usage);
              const permission = command.permission || "None";
              const key = `${command.categorySlug}:${command.name}:${index}`;
              const isCopied = copied === key;

              return (
                <article key={key} className="group overflow-hidden rounded-[18px] border border-white/[0.095] bg-[#0d0f0f]/96 transition duration-200 hover:border-white/[0.16] hover:bg-[#101212]">
                  <div className="flex min-h-[92px] items-start justify-between gap-4 px-5 py-5">
                    <div className="min-w-0">
                      <div className="text-[16px] font-semibold tracking-[-0.02em] text-white/95">{command.name}</div>
                      <p className="mt-2 text-[12px] leading-[1.55] text-white/45">{command.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyCommand(command.usage, key)}
                      title={isCopied ? "Copied" : "Copy command"}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/38 transition hover:bg-white/[0.055] hover:text-white"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="border-t border-white/[0.07] px-5 py-4">
                    <div className="text-[11px] font-medium lowercase text-white/48">arguments</div>
                    <div className="mt-2.5 flex min-h-6 flex-wrap gap-2">
                      {args.length ? args.map((arg, argIndex) => (
                        <span key={`${arg}-${argIndex}`} className="rounded-md bg-white/[0.065] px-2.5 py-1 text-[10px] italic text-white/68">{arg}</span>
                      )) : <span className="text-[10px] text-white/42">none</span>}
                    </div>

                    <div className="mt-4 text-[11px] font-medium lowercase text-white/48">permissions</div>
                    <div className="mt-2.5 min-h-6">
                      {permission === "None" || permission === "none"
                        ? <span className="text-[10px] text-white/42">none</span>
                        : <span className="inline-flex rounded-md bg-white/[0.065] px-2.5 py-1 text-[10px] text-white/70">{permission}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {!shown.length ? (
            <div className="mt-8 rounded-[24px] border border-white/[0.075] bg-white/[0.02] px-6 py-16 text-center">
              <Search className="mx-auto h-6 w-6 text-white/20" />
              <div className="mt-4 text-sm font-medium text-white/65">No commands found</div>
              <div className="mt-1 text-xs text-white/28">Try another search or category.</div>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}
