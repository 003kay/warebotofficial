import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Layers3,
  Search,
  Terminal,
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#070808] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-[-320px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-white/[.025] blur-[140px]" />
        <div className="absolute right-[-260px] top-[340px] h-[520px] w-[520px] rounded-full bg-white/[.018] blur-[130px]" />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-[1500px] px-5 pb-28 pt-10 sm:px-8 lg:px-12 xl:px-14">
        <header className="grid gap-10 border-b border-white/[.065] pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,540px)] lg:items-end">
          <div className="max-w-[760px]">
            <div className="mb-6 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[.24em] text-white/28">
              <Terminal className="h-3.5 w-3.5" />
              Ware command library
            </div>
            <h1 className="text-[52px] font-semibold leading-[.95] tracking-[-.06em] text-white sm:text-[72px] lg:text-[78px]">
              Commands
            </h1>
            <p className="mt-6 max-w-2xl text-[14px] leading-7 text-white/42 sm:text-[15px]">
              Browse all {WARE_COMMAND_COUNT.toLocaleString()} command paths. Filter by category or search by command, alias, syntax, and feature.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group flex h-[66px] w-full items-center gap-4 rounded-[20px] border border-white/[.09] bg-[#0d0f0f]/95 px-5 text-left shadow-[0_18px_70px_-42px_rgba(255,255,255,.24)] transition duration-300 hover:-translate-y-0.5 hover:border-white/[.18] hover:bg-[#101212] focus:outline-none focus-visible:border-white/30"
            aria-label="Open command search"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-white/[.025] text-white/38 transition group-hover:text-white/75">
              <Search className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-medium text-white/72">
                {query ? query : `Search ${WARE_COMMAND_COUNT.toLocaleString()} commands`}
              </span>
              <span className="mt-0.5 block text-[10px] text-white/26">Commands, aliases, syntax, or categories</span>
            </span>
            <span className="hidden items-center gap-1 rounded-lg border border-white/[.075] bg-black/30 px-2 py-1 font-mono text-[9px] text-white/30 sm:flex">
              <span>⌘</span><span>K</span>
            </span>
          </button>
        </header>

        <section className="mt-9">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.16em] text-white/28">Browse by category</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollRail(-1)}
                disabled={!canScrollLeft}
                aria-label="Scroll categories left"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[.07] bg-white/[.02] text-white/42 transition hover:border-white/[.14] hover:bg-white/[.05] hover:text-white disabled:cursor-default disabled:opacity-20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(1)}
                disabled={!canScrollRight}
                aria-label="Scroll categories right"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/[.07] bg-white/[.02] text-white/42 transition hover:border-white/[.14] hover:bg-white/[.05] hover:text-white disabled:cursor-default disabled:opacity-20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-white/[.07] bg-[#0b0d0d]/92 p-2 shadow-[0_18px_70px_-54px_rgba(255,255,255,.22)]">
            <div
              ref={railRef}
              className="overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex w-max items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  className={`flex h-[52px] items-center gap-3 rounded-[14px] border px-4 transition duration-200 ${
                    category === "all"
                      ? "border-white/[.13] bg-white/[.075] text-white"
                      : "border-transparent text-white/48 hover:border-white/[.06] hover:bg-white/[.035] hover:text-white/80"
                  }`}
                >
                  <Layers3 className="h-4 w-4" />
                  <span className="text-[12px] font-semibold">All commands</span>
                  <span className="rounded-md bg-black/25 px-2 py-1 font-mono text-[9px] text-white/35">{WARE_COMMAND_COUNT.toLocaleString()}</span>
                </button>

                {canonicalCommandCategories.map((group) => (
                  <button
                    key={group.slug}
                    type="button"
                    onClick={() => setCategory(group.slug)}
                    className={`flex h-[52px] items-center gap-3 rounded-[14px] border px-4 transition duration-200 ${
                      category === group.slug
                        ? "border-white/[.13] bg-white/[.075] text-white"
                        : "border-transparent text-white/48 hover:border-white/[.06] hover:bg-white/[.035] hover:text-white/80"
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                    <span className="whitespace-nowrap text-[12px] font-semibold">{group.name}</span>
                    <span className="rounded-md bg-black/25 px-2 py-1 font-mono text-[9px] text-white/35">{group.commands.length}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="command-results" className="scroll-mt-28 pt-10">
          <div className="flex flex-col gap-3 border-b border-white/[.06] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-[18px] font-semibold tracking-[-.03em] text-white/90">
                {activeCategory?.name ?? "All commands"}
              </h2>
              <p className="mt-1.5 text-[11px] text-white/30">
                <span className="font-medium text-white/55">{shown.length.toLocaleString()}</span> results
                {query ? <span> for “{query}”</span> : null}
              </p>
            </div>
            {query || category !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                }}
                className="self-start rounded-xl border border-white/[.07] bg-white/[.02] px-3 py-2 text-[10px] font-medium text-white/38 transition hover:border-white/[.14] hover:bg-white/[.05] hover:text-white/75 sm:self-auto"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((command) => {
              const key = command.name.toLowerCase();
              const group = categoryByCommand.get(key);
              const copyValue = `,${command.usage}`;

              return (
                <article
                  key={key}
                  className="group relative flex min-h-[246px] flex-col overflow-hidden rounded-[22px] border border-white/[.07] bg-[#0c0e0e] shadow-[0_22px_75px_-62px_rgba(255,255,255,.32)] transition duration-300 hover:-translate-y-1 hover:border-white/[.14] hover:bg-[#0f1111] hover:shadow-[0_28px_90px_-58px_rgba(255,255,255,.18)]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[.12] to-transparent opacity-0 transition group-hover:opacity-100" />

                  <div className="flex items-start justify-between gap-4 px-5 pb-4 pt-5">
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[16px] font-semibold tracking-[-.025em] text-white/96">,{command.name}</div>
                      <div className="mt-2 inline-flex rounded-lg border border-white/[.055] bg-white/[.025] px-2 py-1 text-[8px] font-semibold uppercase tracking-[.15em] text-white/30">
                        {group?.name ?? "Ware"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => copy(copyValue, key)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.065] bg-black/20 text-white/28 transition hover:border-white/[.16] hover:bg-white/[.05] hover:text-white/80"
                      title={copied === key ? "Copied" : "Copy usage"}
                      aria-label={copied === key ? "Copied" : `Copy ${command.name} usage`}
                    >
                      {copied === key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <p className="px-5 text-[12px] leading-[1.7] text-white/44">{command.description}</p>

                  <div className="mt-auto border-t border-white/[.055] bg-black/20 px-5 py-4 font-mono text-[10px] leading-[1.85]">
                    <div className="flex min-w-0 items-baseline gap-3">
                      <span className="w-[43px] shrink-0 text-[8px] uppercase tracking-[.12em] text-white/18">syntax</span>
                      <span className="truncate text-white/48">,{command.usage}</span>
                    </div>
                    {command.example ? (
                      <div className="mt-1 flex min-w-0 items-baseline gap-3">
                        <span className="w-[43px] shrink-0 text-[8px] uppercase tracking-[.12em] text-white/18">example</span>
                        <span className="truncate text-white/36">,{command.example}</span>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {!shown.length ? (
            <div className="mt-5 rounded-[22px] border border-white/[.07] bg-[#0c0e0e] px-6 py-20 text-center">
              <Search className="mx-auto h-5 w-5 text-white/20" />
              <div className="mt-4 text-[13px] font-medium text-white/60">No commands found</div>
              <div className="mt-2 text-[11px] text-white/28">Try another command, alias, syntax, or category.</div>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />

      {searchOpen ? (
        <div
          className="ware-search-backdrop fixed inset-0 z-[220] overflow-y-auto bg-black/82 px-4 py-[12vh] backdrop-blur-[9px]"
          role="dialog"
          aria-modal="true"
          aria-label="Search Ware commands"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSearchOpen(false);
          }}
        >
          <div className="ware-search-panel mx-auto w-full max-w-[720px]">
            <div className="overflow-hidden rounded-[24px] border border-white/[.11] bg-[#101212]/[.99] shadow-[0_44px_150px_rgba(0,0,0,.75)]">
              <div className="flex h-[78px] items-center gap-4 px-5 sm:px-6">
                <Search className="h-5 w-5 shrink-0 text-white/62" />
                <input
                  ref={searchInputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search commands or categories..."
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] font-medium text-white outline-none ring-0 placeholder:text-white/34 focus:border-0 focus:outline-none focus:ring-0"
                  aria-label="Search commands or categories"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded-lg px-2 py-1 text-[10px] text-white/32 transition hover:bg-white/[.05] hover:text-white/70"
                  >
                    Clear
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-white/[.025] text-white/35 transition hover:border-white/[.14] hover:bg-white/[.06] hover:text-white"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {query.trim() ? (
                <div className="border-t border-white/[.06] p-2.5">
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
                            className="group/result flex w-full items-center gap-4 rounded-[14px] px-3 py-3 text-left transition hover:bg-white/[.045]"
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
