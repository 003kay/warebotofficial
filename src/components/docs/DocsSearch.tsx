import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { commandCategories } from "@/lib/commands";
import { docSections } from "./doc-sections";

type Result =
  | { kind: "doc"; label: string; section: string; slug: string }
  | { kind: "command"; label: string; description: string; category: string; slug: string };

export function DocsSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allResults = useMemo<Result[]>(() => {
    const docs: Result[] = docSections.flatMap((s) =>
      s.items.map((i) => ({ kind: "doc" as const, label: i.label, section: s.title, slug: i.slug })),
    );
    const cmds: Result[] = commandCategories.flatMap((c) =>
      c.commands.map((cmd) => ({
        kind: "command" as const,
        label: cmd.name,
        description: cmd.description,
        category: c.name,
        slug: `commands-${c.slug}`,
      })),
    );
    return [...docs, ...cmds];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allResults
      .filter((r) => {
        if (r.kind === "doc") return r.label.toLowerCase().includes(q) || r.section.toLowerCase().includes(q);
        return r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
      })
      .slice(0, 8);
  }, [query, allResults]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  function go(r: Result) {
    setOpen(false);
    setQuery("");
    navigate({ to: "/docs/$slug", params: { slug: r.slug } });
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0 max-w-xl mx-auto">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground focus-within:border-white/20">
        <Search className="h-4 w-4 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && results[active]) {
              e.preventDefault();
              go(results[active]);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Search docs and commands..."
          aria-label="Search documentation"
        />
        <kbd className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
          Ctrl K
        </kbd>
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-background/95 p-2 shadow-2xl backdrop-blur z-50">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">No results for "{query}"</div>
          ) : (
            <ul className="space-y-1">
              {results.map((r, i) => (
                <li key={`${r.kind}-${r.slug}-${r.label}-${i}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left ${
                      i === active ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="mt-0.5 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                      {r.kind === "doc" ? "Doc" : "Cmd"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">
                        {r.kind === "command" ? `,${r.label}` : r.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {r.kind === "doc" ? r.section : `${r.category} — ${r.description}`}
                      </span>
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
