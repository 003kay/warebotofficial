import { createFileRoute } from "@tanstack/react-router";
import { Check, CircleEllipsis, Copy, Search, Terminal } from "lucide-react";
import { CommandCategories } from "@/components/CommandCategories";
import { useEffect, useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  canonicalCommandCategories,
  canonicalCommands,
  WARE_COMMAND_COUNT,
  type WareCommandCategory,
  resolveCommandCategory,
} from "@/lib/canonicalCommands";

export const Route = createFileRoute("/commands")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Commands" },
      {
        name: "description",
        content: `Browse all ${WARE_COMMAND_COUNT.toLocaleString()} Stained commands.`,
      },
    ],
  }),
  component: CommandsPage,
});

function commandArguments(command: (typeof canonicalCommands)[number]) {
  const usage = command.usage.trim();
  const name = command.name.trim();
  if (!usage || usage.toLowerCase() === name.toLowerCase()) return [];

  let value = usage;
  if (usage.toLowerCase().startsWith(name.toLowerCase())) {
    value = usage.slice(name.length).trim();
  }

  value = value.replace(/^[-–—,:\s]+/, "").trim();
  if (!value) return [];

  const grouped = value.match(/<[^>]+>|\[[^\]]+\]|\([^)]+\)|\{[^}]+\}/g);
  if (grouped?.length) {
    return grouped
      .map((token) =>
        token
          .replace(/^[<([{]\s*/, "")
          .replace(/\s*[>\])}]$/, "")
          .trim(),
      )
      .filter(Boolean);
  }

  return value
    .split(/\s*,\s*|\s+\|\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function formatPermission(permission?: string) {
  const value = permission?.trim();
  if (!value || value.toLowerCase() === "none") return "none";
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function CommandsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const category = resolveCommandCategory(search.category);
  const selectCategory = (slug: string) => {
    setQuery("");
    void navigate({ search: { category: slug }, resetScroll: false });
  };
  const [copied, setCopied] = useState<string | null>(null);

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
      const categoryMatches = query.trim() ? true : group?.slug === category;
      return categoryMatches && commandMatches(command, query);
    });
  }, [category, categoryByCommand, query]);

  const activeCategory = useMemo(
    () => canonicalCommandCategories.find((group) => group.slug === category),
    [category],
  );

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

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1200);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080909] text-white">
      <Navbar />

      <main className="mx-auto max-w-[1280px] px-5 pb-28 pt-9 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between gap-6 pb-10 pt-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/[.08] bg-[#111313] text-white/62 sm:h-14 sm:w-14">
              <Terminal className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[38px] font-semibold tracking-[-.055em] text-white sm:text-[48px]">
                Commands
              </h1>
              <p className="mt-1 text-[12px] text-white/45">
                {WARE_COMMAND_COUNT.toLocaleString()} commands available
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] font-medium lowercase tracking-wide text-white/38">
              search
            </span>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/[.09] bg-[#111313] text-[#bdd8ef]/75 transition duration-200 hover:border-white/[.18] hover:bg-white/[.05] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15 sm:h-14 sm:w-14"
              aria-label="Search commands"
              title="Search commands"
            >
              <Search className="h-[22px] w-[22px]" />
            </button>
          </div>
        </header>

        <CommandCategories
          categories={canonicalCommandCategories}
          value={category}
          onChange={selectCategory}
        />

        <section id="command-results" className="scroll-mt-28">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/[.06] pb-5">
            <div>
              <h2 className="text-[17px] font-semibold tracking-[-.025em] text-white/90">
                {query ? "Search results" : (activeCategory?.name ?? "Commands")}
              </h2>
              <p className="mt-1.5 text-[12px] text-white/45">
                {shown.length.toLocaleString()} {shown.length === 1 ? "command" : "commands"}
                {query ? (
                  <span> matching “{query}”</span>
                ) : (
                  <span className="hidden sm:inline"> · {activeCategory?.description}</span>
                )}
              </p>
            </div>
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                }}
                className="rounded-xl border border-white/[.07] px-3 py-2 text-[10px] text-white/38 transition hover:bg-white/[.04] hover:text-white/72"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((command) => {
              const key = command.name.toLowerCase();
              const copyValue = `,${command.usage}`;
              const args = commandArguments(command);
              const permission = formatPermission(command.permission);

              return (
                <article
                  key={key}
                  className="group flex min-h-[348px] flex-col overflow-hidden rounded-[28px] border border-white/[.095] bg-[#101212] transition duration-200 hover:-translate-y-0.5 hover:border-white/[.16] hover:bg-[#111414]"
                >
                  <div className="flex min-h-[150px] items-start justify-between gap-5 px-7 pb-6 pt-7">
                    <div className="min-w-0">
                      <h3 className="truncate text-[20px] font-semibold tracking-[-.028em] text-white sm:text-[21px]">
                        {command.name}
                      </h3>
                      <p className="mt-4 max-w-[94%] text-[13px] leading-[1.65] text-white/56 sm:text-[13.5px]">
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
                      {copied === key ? (
                        <Check className="h-[18px] w-[18px]" />
                      ) : (
                        <Copy className="h-[18px] w-[18px]" />
                      )}
                    </button>
                  </div>

                  <div className="mt-auto min-h-[198px] border-t border-white/[.065] px-7 pb-7 pt-6">
                    <div>
                      <div className="text-[13px] font-medium text-[#bdd8ef]/80">arguments</div>
                      <div className="mt-4 flex min-h-[34px] flex-wrap items-start gap-2">
                        {!args.length ? (
                          <span className="pt-1 text-[12px] font-medium text-white/68">none</span>
                        ) : (
                          args.map((arg, index) => (
                            <span
                              key={`${key}-arg-${index}`}
                              className="inline-flex max-w-full rounded-[10px] bg-white/[.06] px-3 py-2 text-[12px] italic text-white/78"
                            >
                              <span className="truncate">{arg}</span>
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-[13px] font-medium text-[#bdd8ef]/80">permissions</div>
                      <div className="mt-4 min-h-[34px]">
                        {permission === "none" ? (
                          <span className="pt-1 text-[12px] font-medium text-white/68">none</span>
                        ) : (
                          <span className="inline-flex max-w-full rounded-[10px] bg-white/[.06] px-3 py-2 text-[12px] font-semibold text-white/88">
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
              <div className="mt-2 text-[11px] text-white/28">
                Try another command, alias, syntax, or category.
              </div>
            </div>
          ) : null}
        </section>
      </main>

      <Footer />

      {searchOpen ? (
        <div
          className="ware-search-backdrop fixed inset-0 z-[220] bg-black/90 px-5 pt-[16vh] backdrop-blur-[5px]"
          role="dialog"
          aria-modal="true"
          aria-label="Search Stained commands"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSearchOpen(false);
          }}
        >
          <div className="ware-search-panel mx-auto w-full max-w-[680px]">
            <div className="flex min-h-[86px] items-center gap-5 rounded-[22px] border border-white/[.08] bg-[#171818] px-6 shadow-[0_45px_150px_rgba(0,0,0,.82)] sm:px-7">
              <Search className="h-6 w-6 shrink-0 text-[#d5e7f2]/90" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    setSearchOpen(false);
                    window.setTimeout(
                      () =>
                        document
                          .getElementById("command-results")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                      50,
                    );
                  }
                }}
                placeholder="Search commands or categories..."
                className="ware-search-input min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-[17px] font-medium text-white outline-none shadow-none ring-0 placeholder:text-white/34 focus:border-0 focus:outline-none focus:ring-0 sm:text-[18px]"
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
