import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { commandCategories } from "@/lib/commands";
import { docSections } from "./doc-sections";

type Result =
  | {
      kind: "doc";
      label: string;
      section: string;
      slug: string;
    }
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
  return `command-${name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
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
      .filter((result) => {
        if (result.kind === "doc") {
          return (
            result.label.toLowerCase().includes(q) ||
            result.section.toLowerCase().includes(q)
          );
        }

        return (
          result.label.toLowerCase().includes(q) ||
          result.description.toLowerCase().includes(q) ||
          result.category.toLowerCase().includes(q) ||
          result.aliases.some((alias) =>
            alias.toLowerCase().includes(q),
          )
        );
      })
      .sort((a, b) => {
        const aName = a.label.toLowerCase();
        const bName = b.label.toLowerCase();

        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        const aExact = aName === q;
        const bExact = bName === q;

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        return aName.localeCompare(bName);
      })
      .slice(0, 10);
  }, [query, allResults]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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
      await navigate({
        to: "/docs/$slug",
        params: {
          slug: result.slug,
        },
        hash: result.anchor,
      });

      return;
    }

    await navigate({
      to: "/docs/$slug",
      params: {
        slug: result.slug,
      },
    });
  }

  return (
    <div
      ref={containerRef}
      className="relative mx-auto min-w-0 max-w-xl flex-1"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground focus-within:border-white/20">
        <Search className="h-4 w-4 shrink-0" />

        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) {
              setOpen(true);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();

              setActive((current) =>
                Math.min(current + 1, results.length - 1),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();

              setActive((current) => Math.max(current - 1, 0));
            } else if (
              event.key === "Enter" &&
              results[active]
            ) {
              event.preventDefault();
              void go(results[active]);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Search commands..."
          aria-label="Search documentation and commands"
          autoComplete="off"
        />

        <kbd className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
          Ctrl K
        </kbd>
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-background/95 p-2 shadow-2xl backdrop-blur">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No commands found for "{query}"
            </div>
          ) : (
            <ul className="space-y-1">
              {results.map((result, index) => (
                <li
                  key={`${result.kind}-${result.slug}-${result.label}-${index}`}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onClick={() => void go(result)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      index === active
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    }`}
                  >
                    <span className="mt-0.5 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                      {result.kind === "doc" ? "Doc" : "Cmd"}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {result.kind === "command"
                          ? `,${result.label}`
                          : result.label}
                      </span>

                      <span className="block truncate text-xs text-muted-foreground">
                        {result.kind === "doc"
                          ? result.section
                          : `${result.category} — ${result.description}`}
                      </span>

                      {result.kind === "command" &&
                        result.aliases.length > 0 && (
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground/70">
                            Aliases:{" "}
                            {result.aliases
                              .map((alias) => `,${alias}`)
                              .join(", ")}
                          </span>
                        )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
