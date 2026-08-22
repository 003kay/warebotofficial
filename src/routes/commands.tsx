import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Search,
  Layers3,
  ShieldCheck,
  Gavel,
  Info,
  Heart,
  Music2,
  Ticket,
  Bot,
  Sparkles,
  Gamepad2,
  Wrench,
  Gift,
  Crown,
  User,
  Server,
  Image,
  ScrollText,
  WalletCards,
  Settings2,
  Radio,
  Volume2,
  Command as CommandIcon,
  Copy,
  Check,
  Bitcoin,
  ListChecks,
  Timer,
  Youtube,
  Twitch,
  Cloud,
  Hash,
  MessageCircle,
  Gamepad,
  BellRing,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
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
  const routeSearch = Route.useSearch();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() =>
    categories.some(group => group.slug === routeSearch.category) ? routeSearch.category! : "all",
  );
  const [copied, setCopied] = useState<string | null>(null);

  const allCommands = useMemo(
    () =>
      categories.flatMap(group =>
        group.commands.map(command => ({
          ...command,
          category: group.name,
          categorySlug: group.slug,
        })),
      ),
    [],
  );

  const shown = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return allCommands.filter(command => {
      const inCategory = category === "all" || command.categorySlug === category;
      const matches =
        !normalized ||
        command.name.toLowerCase().includes(normalized) ||
        command.description.toLowerCase().includes(normalized) ||
        command.usage.toLowerCase().includes(normalized) ||
        (command.aliases ?? []).some(alias => alias.toLowerCase().includes(normalized));
      return inCategory && matches;
    });
  }, [allCommands, category, query]);

  const activeCategory = category === "all" ? null : categories.find(group => group.slug === category);
  const ActiveIcon = activeCategory ? iconBySlug[activeCategory.slug] ?? Layers3 : Layers3;

  const copyCommand = async (usage: string, key: string) => {
    try {
      await navigator.clipboard.writeText(usage);
      setCopied(key);
      window.setTimeout(() => setCopied(current => (current === key ? null : current)), 1400);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070808] text-white">
      <Starfield />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-8%,rgba(255,255,255,.055),transparent_36%),radial-gradient(circle_at_90%_35%,rgba(255,255,255,.025),transparent_28%)]" />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-[1540px] px-4 pb-28 pt-7 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-white/38 transition hover:bg-white/[0.035] hover:text-white/90"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Ware
          </Link>
          <div className="hidden items-center gap-2 rounded-xl border border-white/[0.065] bg-white/[0.02] px-3 py-2 text-[11px] text-white/35 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_12px_rgba(52,211,153,.45)]" />
            Command index online
          </div>
        </div>

        <section className="relative mt-5 overflow-hidden rounded-[30px] border border-white/[0.075] bg-[#0b0c0c]/78 px-5 py-7 shadow-[0_45px_130px_-80px_rgba(255,255,255,.16)] backdrop-blur-2xl sm:px-7 sm:py-9 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full border border-white/[0.035]" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full border border-white/[0.04]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.075] bg-white/[0.025] px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                <CommandIcon className="h-3.5 w-3.5" />
                Ware command center
              </div>
              <h1 className="mt-5 text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[.86] tracking-[-0.075em] text-white">
                Find the command.
                <span className="block text-white/35">Run the server.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm leading-6 text-white/40 sm:text-[15px]">
                Search Ware's full command system, filter by category, and copy the exact syntax without digging through menus.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:w-[330px]">
              <StatBlock label="Commands" value={WARE_COMMAND_TOTAL.toLocaleString()} />
              <StatBlock label="Categories" value={String(categories.length)} />
              <StatBlock label="Visible" value={String(shown.length)} />
            </div>
          </div>

          <div className="relative mt-8 flex items-center gap-3 rounded-[18px] border border-white/[0.09] bg-black/35 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition focus-within:border-white/[0.18] focus-within:bg-black/45">
            <Search className="h-4 w-4 shrink-0 text-white/30" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search commands, aliases, descriptions, or syntax..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/22"
            />
            <div className="hidden items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-[9px] text-white/28 sm:flex">
              <Search className="h-3 w-3" />
              {shown.length} results
            </div>
          </div>
        </section>

        <div className="mt-5 lg:hidden">
          <label className="flex items-center gap-2 rounded-2xl border border-white/[0.075] bg-[#0b0c0c]/90 px-4 py-3 backdrop-blur-xl">
            <SlidersHorizontal className="h-4 w-4 text-white/40" />
            <select
              value={category}
              onChange={event => setCategory(event.target.value)}
              className="min-w-0 flex-1 appearance-none bg-transparent text-sm text-white/80 outline-none"
            >
              <option value="all">All commands</option>
              {categories.map(group => (
                <option key={group.slug} value={group.slug}>
                  {group.name} · {group.commands.length}
                </option>
              ))}
            </select>
            <ChevronRight className="h-4 w-4 rotate-90 text-white/30" />
          </label>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-5 overflow-hidden rounded-[24px] border border-white/[0.075] bg-[#0b0c0c]/90 p-2 shadow-[0_28px_80px_-55px_rgba(0,0,0,.95)] backdrop-blur-2xl">
              <div className="px-3 pb-2 pt-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">
                Categories
              </div>
              <div className="max-h-[calc(100vh-7rem)] space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,.12)_transparent]">
                <CategoryButton
                  selected={category === "all"}
                  icon={Layers3}
                  label="All commands"
                  count={WARE_COMMAND_TOTAL}
                  onClick={() => setCategory("all")}
                />
                {categories.map(group => (
                  <CategoryButton
                    key={group.slug}
                    selected={category === group.slug}
                    icon={iconBySlug[group.slug] ?? Layers3}
                    label={group.name}
                    count={group.commands.length}
                    onClick={() => setCategory(group.slug)}
                  />
                ))}
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 rounded-[20px] border border-white/[0.055] bg-white/[0.012] px-4 py-4 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.075] bg-white/[0.03] text-white/55">
                  <ActiveIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-white/90">
                    {activeCategory?.name ?? "All commands"}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-white/28">
                    {activeCategory?.description ?? "Every command available across Ware's command system."}
                  </p>
                </div>
              </div>
              <span className="rounded-lg border border-white/[0.055] bg-white/[0.025] px-2.5 py-1.5 text-[10px] text-white/34">
                {shown.length} shown
              </span>
            </div>

            <div className="grid gap-3 xl:grid-cols-2">
              {shown.map((command, index) => {
                const args = getArguments(command.usage);
                const permission = command.permission || "None";
                const key = `${command.categorySlug}:${command.name}:${index}`;
                const isCopied = copied === key;
                const CardIcon = iconBySlug[command.categorySlug] ?? CommandIcon;

                return (
                  <article
                    key={key}
                    className="group relative overflow-hidden rounded-[20px] border border-white/[0.075] bg-[#0c0e0e]/92 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.15] hover:bg-[#101212] hover:shadow-[0_26px_70px_-48px_rgba(255,255,255,.20)]"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-start gap-3.5">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-white/38 transition duration-300 group-hover:border-white/[0.12] group-hover:bg-white/[0.055] group-hover:text-white/75">
                          <CardIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[16px] font-semibold tracking-[-0.025em] text-white/94">
                              {command.name}
                            </h3>
                            <span className="rounded-md border border-white/[0.055] bg-white/[0.02] px-1.5 py-0.5 text-[9px] text-white/26">
                              {command.category}
                            </span>
                          </div>
                          <p className="mt-2 max-w-xl text-[12px] leading-[1.6] text-white/40 transition group-hover:text-white/52">
                            {command.description}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyCommand(command.usage, key)}
                        title={isCopied ? "Copied" : "Copy command"}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[0.065] bg-white/[0.025] text-white/34 transition hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white active:scale-95"
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyCommand(command.usage, key)}
                      className="mt-5 flex w-full items-center justify-between gap-3 rounded-xl border border-white/[0.065] bg-black/30 px-3.5 py-3 text-left transition hover:border-white/[0.11] hover:bg-black/45"
                    >
                      <code className="min-w-0 truncate font-mono text-[11px] text-white/55">{command.usage}</code>
                      <span className="shrink-0 text-[9px] font-medium uppercase tracking-[0.12em] text-white/22">
                        {isCopied ? "Copied" : "Copy"}
                      </span>
                    </button>

                    <div className="mt-4 grid gap-4 border-t border-white/[0.055] pt-4 sm:grid-cols-2">
                      <MetaBlock label="Arguments">
                        {args.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {args.map((arg, argIndex) => (
                              <span
                                key={`${arg}-${argIndex}`}
                                className="rounded-md border border-white/[0.055] bg-white/[0.035] px-2 py-1 text-[10px] italic text-white/50"
                              >
                                {arg}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-white/28">none</span>
                        )}
                      </MetaBlock>

                      <MetaBlock label="Permissions">
                        {permission.toLowerCase() === "none" ? (
                          <span className="text-[10px] text-white/28">none</span>
                        ) : (
                          <span className="inline-flex rounded-md border border-white/[0.055] bg-white/[0.035] px-2 py-1 text-[10px] text-white/52">
                            {permission}
                          </span>
                        )}
                      </MetaBlock>
                    </div>
                  </article>
                );
              })}
            </div>

            {!shown.length ? (
              <div className="rounded-[24px] border border-white/[0.075] bg-[#0b0c0c]/85 px-6 py-20 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                  <Search className="h-5 w-5 text-white/24" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white/75">No commands found</h3>
                <p className="mt-1 text-sm text-white/30">Try a different search or category.</p>
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.065] bg-black/25 px-3 py-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.02)]">
      <div className="text-lg font-semibold tracking-[-0.035em] text-white/88 sm:text-xl">{value}</div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.13em] text-white/24">{label}</div>
    </div>
  );
}

function CategoryButton({
  selected,
  icon: Icon,
  label,
  count,
  onClick,
}: {
  selected: boolean;
  icon: typeof Layers3;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        selected
          ? "bg-white text-black shadow-[0_8px_28px_-18px_rgba(255,255,255,.55)]"
          : "text-white/48 hover:bg-white/[0.045] hover:text-white/82"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${
          selected
            ? "border-black/10 bg-black/[0.06] text-black/70"
            : "border-white/[0.06] bg-white/[0.02] text-white/34 group-hover:border-white/[0.10] group-hover:text-white/65"
        }`}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{label}</span>
      <span className={`text-[10px] ${selected ? "text-black/42" : "text-white/22"}`}>{count}</span>
    </button>
  );
}

function MetaBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[9px] font-medium uppercase tracking-[0.12em] text-white/22">{label}</div>
      {children}
    </div>
  );
}
