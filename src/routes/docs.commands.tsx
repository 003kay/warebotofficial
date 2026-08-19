import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { commandCategories } from "@/lib/commands";

const BOT_COMMAND_COUNT = 821;
const WARE_IMAGE = "/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png";

function commandAnchor(name: string) {
  return `command-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

export const Route = createFileRoute("/docs/commands")({
  head: () => ({
    meta: [
      { title: "Commands — ware docs" },
      { name: "description", content: "Browse all Ware commands and categories." },
    ],
  }),
  component: CommandsIndex,
});

function CommandsIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderLeaving, setLoaderLeaving] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLoaderLeaving(true), 480);
    const removeTimer = window.setTimeout(() => setLoaderVisible(false), 800);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  const allCommands = useMemo(
    () =>
      commandCategories.flatMap((group) =>
        group.commands.map((command) => ({
          ...command,
          category: group.name,
          categorySlug: group.slug,
        })),
      ),
    [],
  );

  const visibleCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCommands.filter((command) => {
      const categoryMatch = category === "all" || command.categorySlug === category;
      const queryMatch =
        !q ||
        command.name.toLowerCase().includes(q) ||
        command.description.toLowerCase().includes(q) ||
        command.usage.toLowerCase().includes(q) ||
        command.category.toLowerCase().includes(q) ||
        (command.aliases ?? []).some((alias) => alias.toLowerCase().includes(q));
      return categoryMatch && queryMatch;
    });
  }, [allCommands, category, query]);

  return (
    <>
      {loaderVisible && (
        <div
          className={`fixed inset-0 z-[120] grid place-items-center bg-[#050505] transition-all duration-300 ${
            loaderLeaving ? "pointer-events-none scale-[1.04] opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-[22px] border border-white/15 bg-white/[0.035] shadow-[0_0_80px_rgba(255,255,255,.08)]">
              <img src={WARE_IMAGE} alt="Ware" className="h-full w-full object-cover" />
              <div className="absolute inset-0 animate-pulse bg-white/[0.045]" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">commands</span>
          </div>
        </div>
      )}

      <DocsLayout active="commands" toc={[{ id: "all-commands", label: "All Commands" }]}>
        <p className="text-sm text-muted-foreground">Commands</p>
        <h1 className="mt-1 text-4xl font-bold tracking-[-0.045em] md:text-5xl">All Commands</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
          Every Ware command in one place. Search instantly or tap a category to filter the command library without leaving the page.
        </p>

        <div className="mt-7 flex flex-wrap gap-3 text-sm">
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-muted-foreground"><span className="font-semibold text-foreground">{BOT_COMMAND_COUNT}</span> bot commands</div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-muted-foreground"><span className="font-semibold text-foreground">{commandCategories.length}</span> categories</div>
        </div>

        <div className="mt-7 rounded-[22px] border border-white/10 bg-white/[0.025] p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="group flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-muted-foreground transition-all focus-within:border-white/20 focus-within:bg-white/[0.04]">
              <Search className="h-4 w-4 shrink-0 transition-colors group-focus-within:text-white" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands, aliases, categories..."
                className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/30"
                aria-label="Search commands"
              />
            </label>
            <Link to="/" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-xs font-medium transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                category === "all"
                  ? "border-white/20 bg-white text-black"
                  : "border-white/10 bg-white/[0.025] text-white/60 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              All Commands <span className={category === "all" ? "text-black/45" : "text-white/30"}>{allCommands.length}</span>
            </button>
            {commandCategories.map((group) => (
              <button
                key={group.slug}
                type="button"
                onClick={() => setCategory(group.slug)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs transition-all ${
                  category === group.slug
                    ? "border-white/20 bg-white text-black"
                    : "border-white/10 bg-white/[0.025] text-white/60 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {group.name}
                <span className={category === group.slug ? "text-black/45" : "text-white/30"}>{group.commands.length}</span>
              </button>
            ))}
          </div>
        </div>

        <section id="all-commands" className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.07] pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Command library</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {category === "all" ? "Everything" : commandCategories.find((group) => group.slug === category)?.name}
              </h2>
            </div>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs text-muted-foreground">{visibleCommands.length} shown</span>
          </div>

          {visibleCommands.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-5 py-12 text-center text-sm text-muted-foreground">No commands match “{query}”.</div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleCommands.map((command, index) => (
                <article
                  key={`${command.category}-${command.name}-${index}`}
                  id={commandAnchor(command.name)}
                  className="group scroll-mt-28 rounded-2xl border border-white/[0.08] bg-white/[0.022] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="max-w-full truncate rounded-lg border border-white/[0.11] bg-white/[0.07] px-2.5 py-1.5 text-sm font-semibold">,{command.name}</span>
                    <span className="shrink-0 rounded-full border border-white/[0.07] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-white/35">{command.category}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/65">{command.description}</p>
                  <div className="mt-4 border-t border-white/[0.06] pt-3 font-mono text-[11px] leading-5 text-white/40">{command.usage}</div>
                  {command.aliases && command.aliases.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {command.aliases.slice(0, 4).map((alias) => <span key={alias} className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 font-mono text-[10px] text-white/38">,{alias}</span>)}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </DocsLayout>
    </>
  );
}
