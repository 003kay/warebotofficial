import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Layers3,
  Search,
  Terminal,
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

const WARE_LOGO = "/ware-logo.svg?v=4";

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

function CommandsIntro() {
  const [phase, setPhase] = useState<"enter" | "leave" | "done">("enter");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("done");
      return;
    }

    const leaveTimer = window.setTimeout(() => setPhase("leave"), 760);
    const doneTimer = window.setTimeout(() => setPhase("done"), 1260);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[250] grid place-items-center bg-[#050505] transition-all duration-500 ease-out ${
        phase === "leave" ? "scale-[1.015] opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <div
        className={`relative grid h-[86px] w-[86px] place-items-center transition-all duration-500 ease-out ${
          phase === "leave"
            ? "scale-75 blur-[7px] opacity-0"
            : "animate-[wareCommandIntro_.55s_cubic-bezier(.2,.8,.2,1)_both]"
        }`}
      >
        <img src={WARE_LOGO} alt="" className="h-full w-full object-contain" />
      </div>
      <style>{`
        @keyframes wareCommandIntro {
          0% { transform: scale(.58); filter: blur(11px); opacity: .08; }
          68% { transform: scale(1.06); filter: blur(0); opacity: 1; }
          100% { transform: scale(1); filter: blur(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function CommandCount({ value }: { value: number }) {
  return <span className="font-mono text-[10px] text-white/25">{value.toLocaleString()}</span>;
}

function CommandsPage() {
  const search = Route.useSearch();
  const railRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
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

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return canonicalCommands.filter((command) => {
      const group = categoryByCommand.get(command.name.toLowerCase());
      const categoryMatches = category === "all" || group?.slug === category;
      const textMatches =
        !q ||
        command.name.toLowerCase().includes(q) ||
        command.description.toLowerCase().includes(q) ||
        command.usage.toLowerCase().includes(q) ||
        (command.example ?? "").toLowerCase().includes(q) ||
        (command.aliases ?? []).some((alias) => alias.toLowerCase().includes(q));
      return categoryMatches && textMatches;
    });
  }, [category, categoryByCommand, query]);

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
    if (rail.firstElementChild instanceof HTMLElement) observer?.observe(rail.firstElementChild);

    return () => {
      rail.removeEventListener("wheel", onWheel);
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      observer?.disconnect();
    };
  }, []);

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * Math.max(360, Math.min(620, rail.clientWidth * 0.72)),
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

  const categoryButton = (selected: boolean) =>
    `flex h-[78px] shrink-0 items-center gap-3 px-4 text-left transition-colors duration-150 ${
      selected
        ? "bg-white/[.035] text-white"
        : "text-white/48 hover:bg-white/[.025] hover:text-white/78"
    }`;

  return (
    <div className="relative min-h-screen bg-[#080909] text-white">
      <CommandsIntro />
      <Navbar />

      <main className="mx-auto max-w-[1510px] px-5 pb-24 pt-6 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-6 border-b border-white/[.065] pb-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.22em] text-white/28">
              <Terminal className="h-3.5 w-3.5" /> Ware command library
            </div>
            <h1 className="text-[44px] font-semibold tracking-[-.055em] text-white sm:text-[58px]">Commands</h1>
            <p className="mt-4 max-w-xl text-[13px] leading-6 text-white/38">
              {WARE_COMMAND_COUNT.toLocaleString()} command paths. Search by command, alias, syntax, or feature.
            </p>
          </div>

          <label className="flex h-[58px] w-full items-center gap-3 rounded-2xl border border-white/[.08] bg-[#101111] px-5 transition focus-within:border-white/[.2] md:w-[480px]">
            <Search className="h-4 w-4 shrink-0 text-white/28" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${WARE_COMMAND_COUNT.toLocaleString()} commands...`}
              className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/22"
              aria-label="Search commands"
            />
            {query ? <span className="font-mono text-[10px] text-white/28">{shown.length}</span> : null}
          </label>
        </header>

        <section className="sticky top-0 z-30 -mx-5 mt-10 bg-[#080909]/94 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="flex h-[94px] items-stretch overflow-hidden rounded-2xl border border-white/[.065] bg-[#0d0e0e]">
            <button
              type="button"
              onClick={() => scrollRail(-1)}
              disabled={!canScrollLeft}
              aria-label="Scroll categories left"
              className="grid w-12 shrink-0 place-items-center border-r border-white/[.045] text-white/42 transition hover:bg-white/[.025] hover:text-white disabled:cursor-default disabled:opacity-20"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div
              ref={railRef}
              className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="flex h-full w-max items-stretch">
                <button type="button" onClick={() => setCategory("all")} className={categoryButton(category === "all")}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-white/[.025]">
                    <Layers3 className="h-4 w-4" />
                  </span>
                  <span className="min-w-[112px]">
                    <span className="block truncate text-[13px] font-medium">All commands</span>
                    <span className="mt-1 block"><CommandCount value={WARE_COMMAND_COUNT} /></span>
                  </span>
                </button>

                {canonicalCommandCategories.map((group) => (
                  <button
                    key={group.slug}
                    type="button"
                    onClick={() => setCategory(group.slug)}
                    className={categoryButton(category === group.slug)}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/[.07] bg-white/[.025]">
                      <Terminal className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-[112px]">
                      <span className="block max-w-[126px] truncate text-[13px] font-medium">{group.name}</span>
                      <span className="mt-1 block"><CommandCount value={group.commands.length} /></span>
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
              className="grid w-12 shrink-0 place-items-center border-l border-white/[.045] text-white/42 transition hover:bg-white/[.025] hover:text-white disabled:cursor-default disabled:opacity-20"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <div className="mt-7 flex items-center justify-between border-b border-white/[.06] pb-5">
          <div className="text-[12px] text-white/36">
            <span className="font-medium text-white/64">{shown.length.toLocaleString()}</span> commands
          </div>
          {query || category !== "all" ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="rounded-lg px-3 py-1.5 text-[11px] text-white/38 transition hover:bg-white/[.05] hover:text-white/75"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((command) => {
            const key = command.name.toLowerCase();
            const group = categoryByCommand.get(key);
            const copyValue = `,${command.usage}`;

            return (
              <article
                key={key}
                className="group min-h-[238px] overflow-hidden rounded-2xl border border-white/[.07] bg-[#0f1010] transition duration-150 hover:border-white/[.13] hover:bg-[#111212]"
              >
                <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
                  <div className="min-w-0">
                    <div className="truncate font-mono text-[15px] font-semibold text-white/94">,{command.name}</div>
                    <div className="mt-2 text-[9px] font-medium uppercase tracking-[.14em] text-white/25">{group?.name ?? "Ware"}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(copyValue, key)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[.065] text-white/30 transition hover:border-white/[.17] hover:bg-white/[.04] hover:text-white/75"
                    title={copied === key ? "Copied" : "Copy usage"}
                  >
                    {copied === key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                <p className="min-h-[82px] px-5 text-[12px] leading-[1.6] text-white/45">{command.description}</p>

                <div className="mt-4 border-t border-white/[.055] bg-black/20 px-5 py-4 font-mono text-[10px] leading-[1.9] text-white/45">
                  <div className="truncate"><span className="mr-2 text-white/20">syntax</span>,{command.usage}</div>
                  {command.example ? (
                    <div className="truncate"><span className="mr-2 text-white/20">example</span>,{command.example}</div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>

        {!shown.length ? (
          <div className="mt-7 rounded-2xl border border-white/[.07] bg-[#0f1010] px-6 py-16 text-center text-[13px] text-white/36">
            No commands match those filters.
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
