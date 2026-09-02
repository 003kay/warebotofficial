import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Bot,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Copy,
  Gamepad2,
  Gavel,
  Hash,
  Heart,
  Info,
  Layers3,
  Mic2,
  Music2,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Terminal,
  TicketCheck,
  WalletCards,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  canonicalCommandCategories,
  canonicalCommands,
  WARE_COMMAND_COUNT,
  type WareCommandCategory,
} from "@/lib/canonicalCommands";

export const Route = createFileRoute("/commands")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Commands" },
      {
        name: "description",
        content: `Browse all ${WARE_COMMAND_COUNT.toLocaleString()} Ware commands.`,
      },
    ],
  }),
  component: CommandsPage,
});

function CategoryIcon({ group }: { group?: WareCommandCategory }) {
  const name = (group?.name ?? "all").toLowerCase();
  const className = "h-[18px] w-[18px]";

  if (!group) return <Layers3 className={className} />;
  if (name.includes("moder")) return <Gavel className={className} />;
  if (name.includes("channel") || name.includes("role")) return <Hash className={className} />;
  if (name.includes("voice")) return <Mic2 className={className} />;
  if (name.includes("config") || name.includes("log")) return <Settings2 className={className} />;
  if (name.includes("nuke") || name.includes("security") || name.includes("anti")) return <ShieldCheck className={className} />;
  if (name.includes("econom")) return <WalletCards className={className} />;
  if (name.includes("fun")) return <Sparkles className={className} />;
  if (name.includes("game")) return <Gamepad2 className={className} />;
  if (name.includes("util")) return <Wrench className={className} />;
  if (name.includes("music") || name.includes("last")) return <Music2 className={className} />;
  if (name.includes("ticket")) return <TicketCheck className={className} />;
  if (name.includes("notify") || name.includes("social")) return <Bell className={className} />;
  if (name.includes("info")) return <Info className={className} />;
  if (name.includes("roleplay")) return <Heart className={className} />;
  if (name.includes("server") || name.includes("home")) return <Server className={className} />;
  if (name.includes("bot") || name.includes("ai")) return <Bot className={className} />;
  return <Terminal className={className} />;
}

function commandArguments(command: (typeof canonicalCommands)[number]) {
  const usage = command.usage.trim();
  const name = command.name.trim();
  if (!usage || usage.toLowerCase() === name.toLowerCase()) return "none";

  let value = usage;
  if (usage.toLowerCase().startsWith(name.toLowerCase())) {
    value = usage.slice(name.length).trim();
  }

  if (!value) return "none";
  return value
    .replace(/^[-–—,:\s]+/, "")
    .replace(/^\((.*)\)$/, "$1")
    .trim() || "none";
}

function CommandsPage() {
  const search = Route.useSearch();
  const railRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState(() =>
    canonicalCommandCategories.some((group) => group.slug === search.category)
      ? search.category!
      : "all",
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const categoryByCommand = useMemo(() => {
    const map = new Map<string, WareCommandCategory>();
    for (const group of canonicalCommandCategories) {
      for (const command of group.commands) map.set(command.name.toLowerCase(), group);
    }
    return map;
  }, []);

  const commandMatches = (command: (typeof canonicalCommands)[number], rawQuery: string) => {
    const q = rawQuery.trim().toLowerCase();
    if (!q) return true;
    const group = categoryByCommand.get(command.name.toLowerCase());
    return (
      command.name.toLowerCase().includes(q) ||
      command.description.toLowerCase().includes(q) ||
      command.usage.toLowerCase().includes(q) ||
      (command.example ?? "").toLowerCase().includes(q) ||
      (command.aliases ?? []).some((alias) => alias.toLowerCase().includes(q)) ||
      (group?.name ?? "").toLowerCase().includes(q)
    );
  };

  const shown = useMemo(() => {
    return canonicalCommands.filter((command) => {
      const group = categoryByCommand.get(command.name.toLowerCase());
      const categoryMatches = category === "all" || group?.slug === category;
      return categoryMatches && commandMatches(command, query);
    });
  }, [category, categoryByCommand, query]);

  const modalResults = useMemo(() => {
    if (!query.trim()) return [];
    return canonicalCommands.filter((command) => commandMatches(command, query)).slice(0, 8);
  }, [categoryByCommand, query]);

  const activeCategory = useMemo(
    () => canonicalCommandCategories.find((group) => group.slug === category),
    [category],
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const updateScrollState = () => {
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      setCanScrollLeft(rail.scrollLeft > 6);
      setCanScrollRight(rail.scrollLeft < max - 6);
    };

    const onWheel = (event: WheelEvent) => {
      const max = Math.max(0, rail.scrollWidth - rail.clientWidth);
      if (max <= 0) return;
      const delta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!delta) return;

      const movingRight = delta > 0;
      const canMove = movingRight ? rail.scrollLeft < max - 1 : rail.scrollLeft > 1;
      if (!canMove) return;

      event.preventDefault();
      rail.scrollLeft = Math.max(0, Math.min(max, rail.scrollLeft + delta));
      updateScrollState();
    };

    updateScrollState();
    rail.addEventListener("wheel", onWheel, { passive: false });
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollState) : null;
    observer?.observe(rail);

    return () => {
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement;
      const isTyping =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        (active instanceof HTMLElement && active.isContentEditable);

      if (event.key === "Escape" && searchOpen) {
        event.preventDefault();
        setSearchOpen(false);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (event.key === "/" && !isTyping && !searchOpen) {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, [searchOpen]);

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(320, Math.min(620, rail.clientWidth * 0.75)),
      behavior: "smooth",
    });
  };

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1200);
    } catch {
      setCopied(null);
    }
  };

  const chooseSearchResult = (name: string) => {
    setQuery(name);
    setCategory("all");
    setSearchOpen(false);
    window.setTimeout(() => {
      document.getElementById("command-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080909] text-white">
      <Navbar />

      <main className="mx-auto max-w-[1500px] px-5 pb-28 pt-9 sm:px-8 lg:px-12 xl:px-14">
        <header className="flex items-center justify-between gap-6 pb-10 pt-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/[.08] bg-[#111313] text-white/62 sm:h-14 sm:w-14">
              <Terminal className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[38px] font-semibold tracking-[-.055em] text-white sm:text-[48px]">Commands</h1>
              <p className="mt-1 hidden text-[12px] text-white/28 sm:block">
                {WARE_COMMAND_COUNT.toLocaleString()} commands available
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/[.09] bg-[#111313] text-white/52 transition duration-200 hover:border-white/[.18] hover:bg-white/[.05] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 sm:h-14 sm:w-14"
            aria-label="Search commands"
            title="Search commands"
          >
            <Search className="h-[21px] w-[21px]" />
          </button>
        </header>

        <section className="relative mb-9">
          <div className="flex h-[76px] overflow-hidden rounded-[18px] border border-white/[.075] bg-[#0f1111]">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
              className="grid w-11 shrink-0 place-items-center border-r border-white/[.055] bg-[#0d0f0f] text-white/38 transition hover:bg-white/[.035] hover:text-white disabled:cursor-default disabled:opacity-20 sm:w-12"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              ref={railRef}
              className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex h-full w-max items-stretch">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  className={`flex min-w-[170px] items-center gap-3 border-r border-white/[.045] px-5 text-left transition ${
                    category === "all" ? "bg-white/[.055] text-white" : "text-white/48 hover:bg-white/[.025] hover:text-white/80"
                  }`}
                >
                  <CategoryIcon />
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-[13px] font-semibold">All commands</span>
                    <span className="mt-1 block font-mono text-[10px] text-white/28">{WARE_COMMAND_COUNT.toLocaleString()}</span>
                  </span>
                </button>

                {canonicalCommandCategories.map((group) => (
                  <button
                    key={group.slug}
                    type="button"
                    onClick={() => setCategory(group.slug)}
                    className={`flex min-w-[164px] items-center gap-3 border-r border-white/[.045] px-5 text-left transition ${
                      category === group.slug ? "bg-white/[.055] text-white" : "text-white/48 hover:bg-white/[.025] hover:text-white/80"
                    }`}
                  >
                    <CategoryIcon group={group} />
                    <span className="min-w-0">
                      <span className="block max-w-[118px] truncate text-[13px] font-semibold">{group.name}</span>
                      <span className="mt-1 block font-mono text-[10px] text-white/28">{group.commands.length}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => scrollRail(1)}
              disabled={!canScrollRight}
              aria-label="Scroll categories right"
              className="grid w-11 shrink-0 place-items-center border-l border-white/[.055] bg-[#0d0f0f] text-white/38 transition hover:bg-white/[.035] hover:text-white disabled:cursor-default disabled:opacity-20 sm:w-12"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section id="command-results" className="scroll-mt-28">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/[.06] pb-5">
            <div>
              <h2 className="text-[16px] font-semibold tracking-[-.02em] text-white/88">
                {activeCategory?.name ?? "All commands"}
              </h2>
              <p className="mt-1 text-[11px] text-white/28">
                {shown.length.toLocaleString()} {shown.length === 1 ? "command" : "commands"}
                {query ? <span> matching “{query}”</span> : null}
              </p>
            </div>
            {query || category !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="rounded-xl border border-white/[.07] px-3 py-2 text-[10px] text-white/38 transition hover:bg-white/[.04] hover:text-white/72"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((command) => {
              const key = command.name.toLowerCase();
              const copyValue = `,${command.usage}`;
              const args = commandArguments(command);
              const permission = command.permission?.trim() || "none";

              return (
                <article
                  key={key}
                  className="group flex min-h-[340px] flex-col overflow-hidden rounded-[26px] border border-white/[.09] bg-[#101212] transition duration-200 hover:border-white/[.15] hover:bg-[#111414]"
                >
                  <div className="flex min-h-[150px] items-start justify-between gap-5 px-7 pb-6 pt-7">
                    <div className="min-w-0">
                      <h3 className="truncate text-[19px] font-semibold tracking-[-.025em] text-white sm:text-[20px]">
                        ,{command.name}
                      </h3>
                      <p className="mt-4 max-w-[92%] text-[13px] leading-[1.6] text-white/56 sm:text-[14px]">
                        {command.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(copyValue, key)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/38 transition hover:bg-white/[.055] hover:text-white/78"
                      title={copied === key ? "Copied" : "Copy usage"}
                      aria-label={copied === key ? "Copied" : `Copy ${command.name} usage`}
                    >
                      {copied === key ? <Check className="h-[18px] w-[18px]" /> : <Copy className="h-[18px] w-[18px]" />}
                    </button>
                  </div>

                  <div className="mt-auto border-t border-white/[.065] px-7 py-6">
                    <div>
                      <div className="text-[13px] font-medium text-slate-300/75">arguments</div>
                      <div className="mt-4">
                        {args === "none" ? (
                          <span className="text-[12px] font-medium text-white/62">none</span>
                        ) : (
                          <span className="inline-flex max-w-full rounded-[10px] bg-white/[.055] px-3 py-2 font-mono text-[12px] italic text-white/72">
                            <span className="truncate">{args}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-[13px] font-medium text-slate-300/75">permissions</div>
                      <div className="mt-4">
                        {permission.toLowerCase() === "none" ? (
                          <span className="text-[12px] font-medium text-white/62">none</span>
                        ) : (
                          <span className="inline-flex max-w-full rounded-[10px] bg-white/[.055] px-3 py-2 text-[12px] font-semibold text-white/82">
                            <span className="truncate">{permission}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {!shown.length ? (
            <div className="mt-5 rounded-[24px] border border-white/[.08] bg-[#101212] px-6 py-20 text-center">
              <CircleEllipsis className="mx-auto h-6 w-6 text-white/20" />
              <div className="mt-4 text-[13px] font-medium text-white/60">No commands found</div>
              <div className="mt-2 text-[11px] text-white/28">Try another command, alias, syntax, or category.</div>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />

      {searchOpen ? (
        <div
          className="ware-search-backdrop fixed inset-0 z-[220] overflow-y-auto bg-black/84 px-4 py-[12vh] backdrop-blur-[10px]"
          role="dialog"
          aria-modal="true"
          aria-label="Search Ware commands"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSearchOpen(false);
          }}
        >
          <div className="ware-search-panel mx-auto w-full max-w-[760px]">
            <div className="overflow-hidden rounded-[26px] border border-white/[.12] bg-[#111313] shadow-[0_45px_150px_rgba(0,0,0,.78)]">
              <div className="flex min-h-[84px] items-center gap-4 px-5 sm:px-6">
                <Search className="h-5 w-5 shrink-0 text-white/60" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search commands or categories..."
                  className="ware-search-input min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[16px] font-medium text-white outline-none shadow-none ring-0 placeholder:text-white/32 focus:border-0 focus:outline-none focus:ring-0"
                  aria-label="Search commands or categories"
                  autoComplete="off"
                  spellCheck={false}
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded-lg px-2 py-1 text-[10px] text-white/30 transition hover:bg-white/[.05] hover:text-white/70"
                  >
                    Clear
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[.07] bg-white/[.025] text-white/38 transition hover:border-white/[.14] hover:bg-white/[.06] hover:text-white"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {query.trim() ? (
                <div className="border-t border-white/[.065] p-2.5">
                  <div className="px-3 pb-2 pt-1 text-[9px] font-semibold uppercase tracking-[.15em] text-white/22">
                    {modalResults.length ? "Top matches" : "No matches"}
                  </div>
                  {modalResults.length ? (
                    <div className="grid gap-1">
                      {modalResults.map((command) => {
                        const group = categoryByCommand.get(command.name.toLowerCase());
                        return (
                          <button
                            key={command.name}
                            type="button"
                            onClick={() => chooseSearchResult(command.name)}
                            className="group/result flex w-full items-center gap-4 rounded-[15px] px-3 py-3 text-left transition hover:bg-white/[.045]"
                          >
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.06] bg-black/20 font-mono text-[11px] text-white/50">
                              ,_
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-2">
                                <span className="truncate font-mono text-[12px] font-semibold text-white/82">,{command.name}</span>
                                <span className="shrink-0 text-[8px] uppercase tracking-[.12em] text-white/20">{group?.name ?? "Ware"}</span>
                              </span>
                              <span className="mt-1 block truncate text-[10px] text-white/28">{command.description}</span>
                            </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-white/16 transition group-hover/result:translate-x-0.5 group-hover/result:text-white/45" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-3 pb-6 pt-3 text-[12px] text-white/30">No Ware commands match “{query}”.</div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex items-center justify-between px-2 text-[9px] text-white/20">
              <span>Search all {WARE_COMMAND_COUNT.toLocaleString()} commands</span>
              <span className="font-mono">ESC to close</span>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .ware-search-input,
        .ware-search-input:focus,
        .ware-search-input:focus-visible,
        .ware-search-input:active {
          outline: none !important;
          border: 0 !important;
          box-shadow: none !important;
          ring: 0 !important;
          -webkit-appearance: none !important;
          appearance: none !important;
        }
        @keyframes wareSearchBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes wareSearchPanelIn {
          from { opacity: 0; transform: translateY(-10px) scale(.985); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .ware-search-backdrop { animation: wareSearchBackdropIn 180ms ease-out both; }
        .ware-search-panel { animation: wareSearchPanelIn 260ms cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .ware-search-backdrop, .ware-search-panel { animation: none; }
        }
      `}</style>
    </div>
  );
}
