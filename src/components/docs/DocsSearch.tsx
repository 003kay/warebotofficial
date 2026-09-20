import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Command, FileText, Search } from "lucide-react";
import { canonicalCommandCategories as commandCategories } from "@/lib/canonicalCommands";
import { docSections } from "./doc-sections";

type Result =
  | { kind: "doc"; label: string; section: string; slug: string }
  | {
      kind: "command";
      label: string;
      description: string;
      category: string;
      slug: string;
      anchor: string;
      aliases: string[];
    };

function commandAnchor(name: string) {
  return `command-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

export function DocsSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allResults = useMemo<Result[]>(() => {
    const docs: Result[] = docSections.flatMap((section) =>
      section.items.map((item) => ({
        kind: "doc" as const,
        label: item.label,
        section: section.title,
        slug: item.slug,
      })),
    );

    const commands: Result[] = commandCategories.flatMap((category) =>
      category.commands.map((command) => ({
        kind: "command" as const,
        label: command.name,
        description: command.description,
        category: category.name,
        slug: `commands-${category.slug}`,
        anchor: commandAnchor(command.name),
        aliases: command.aliases ?? [],
      })),
    );

    return [...docs, ...commands];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return allResults
      .filter((result) =>
        result.kind === "doc"
          ? result.label.toLowerCase().includes(q) || result.section.toLowerCase().includes(q)
          : result.label.toLowerCase().includes(q) ||
            result.description.toLowerCase().includes(q) ||
            result.category.toLowerCase().includes(q) ||
            result.aliases.some((alias) => alias.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        const aName = a.label.toLowerCase();
        const bName = b.label.toLowerCase();
        if (aName === q && bName !== q) return -1;
        if (bName === q && aName !== q) return 1;
        if (aName.startsWith(q) && !bName.startsWith(q)) return -1;
        if (bName.startsWith(q) && !aName.startsWith(q)) return 1;
        return aName.localeCompare(bName);
      })
      .slice(0, 10);
  }, [query, allResults]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }

    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  async function go(result: Result) {
    setOpen(false);
    setQuery("");

    if (result.kind === "command") {
      await navigate({ to: "/docs/$slug", params: { slug: result.slug }, hash: result.anchor });
      return;
    }

    await navigate({ to: "/docs/$slug", params: { slug: result.slug } });
  }

  return (
    <div ref={containerRef} className="relative mx-auto min-w-0 max-w-2xl flex-1">
      <div className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,.025)] transition-all focus-within:border-white/20 focus-within:bg-white/[0.05] focus-within:shadow-[0_12px_40px_-22px_rgba(255,255,255,.18)]">
        <Search className="h-4 w-4 shrink-0 transition-colors group-focus-within:text-white" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((current) => Math.min(current + 1, results.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((current) => Math.max(current - 1, 0));
            } else if (event.key === "Enter" && results[active]) {
              event.preventDefault();
              void go(results[active]);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/70"
          placeholder="Search commands, guides, aliases..."
          aria-label="Search documentation and commands"
          autoComplete="off"
        />
        <kbd className="hidden shrink-0 rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-[9px] text-muted-foreground md:inline">
          CTRL K
        </kbd>
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-3 max-h-[430px] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a0b]/95 p-2 shadow-[0_30px_100px_-40px_rgba(0,0,0,.95)] backdrop-blur-2xl">
          <div className="mb-1 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
            Search results
          </div>
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              No results for “{query}”
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((result, index) => {
                const Icon = result.kind === "doc" ? FileText : Command;
                return (
                  <li key={`${result.kind}-${result.slug}-${result.label}-${index}`}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(index)}
                      onClick={() => void go(result)}
                      className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                        index === active
                          ? "border-white/10 bg-white/[0.07]"
                          : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-white">
                          {result.kind === "command" ? `,${result.label}` : result.label}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {result.kind === "doc" ? result.section : `${result.category} · ${result.description}`}
                        </span>
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-white/25 transition-all group-hover:text-white/70" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
