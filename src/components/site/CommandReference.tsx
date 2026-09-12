import { useEffect, useMemo, useRef, useState } from "react";
import { canonicalCommandCategories, canonicalCommands } from "@/lib/canonicalCommands";

export function CommandReference({ initialCategory }: { initialCategory?: string }) {
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setCategory(initialCategory ?? "all");
  }, [initialCategory]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const results = useMemo(() => {
    const selected = canonicalCommandCategories.find((group) => group.slug === category);
    const pool = query.trim() || !selected ? canonicalCommands : selected.commands;
    const text = query.trim().toLowerCase().replace(/^,/, "");
    const matchingCategories = canonicalCommandCategories.filter((group) =>
      group.name.toLowerCase().includes(text),
    );
    return pool.filter(
      (command) =>
        matchingCategories.some((group) => group.commands.includes(command)) ||
        [
          command.name,
          command.description,
          command.usage,
          command.example,
          ...(command.aliases ?? []),
        ].some((value) => value?.toLowerCase().includes(text)),
    );
  }, [category, query]);
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`Copied ${text}`);
    } catch {
      setNotice("Couldn't copy. Select the command syntax to copy it manually.");
    }
  }
  const prefix = (value: string) => (value.startsWith(",") ? value : `,${value}`);
  return (
    <>
      <label className="pub-search">
        <span>Find a command by name, alias, or description · Ctrl / ⌘ K</span>
        <input
          ref={input}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try ban, tickets, or lastfm"
        />
      </label>
      <div className="pub-command-layout">
        <aside className="pub-categories" aria-label="Command categories">
          <button
            type="button"
            aria-pressed={category === "all" && !query}
            onClick={() => {
              setCategory("all");
              setQuery("");
            }}
          >
            All commands <small>{canonicalCommands.length}</small>
          </button>
          {canonicalCommandCategories.map((group) => (
            <button
              type="button"
              key={group.slug}
              aria-pressed={category === group.slug && !query}
              onClick={() => {
                setCategory(group.slug);
                setQuery("");
              }}
            >
              {group.name}
              <small>{group.commands.length}</small>
            </button>
          ))}
        </aside>
        <div>
          <div className="pub-results-heading">
            <h2>
              {query
                ? "Search results"
                : (canonicalCommandCategories.find((group) => group.slug === category)?.name ??
                  "All commands")}
            </h2>
            <p role="status">
              {results.length} {results.length === 1 ? "command" : "commands"}
            </p>
          </div>
          <div aria-live="polite" className="pub-copy-status">
            {notice}
          </div>
          {results.length ? (
            results.map((command) => (
              <article
                className="pub-command-row"
                id={`command-${command.name
                  .toLowerCase()
                  .trim()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-+|-+$/g, "")}`}
                key={command.name}
              >
                <header>
                  <h3>{prefix(command.name)}</h3>
                  <button
                    type="button"
                    aria-label={`Copy ${command.name} syntax`}
                    onClick={() => copy(prefix(command.usage || command.name))}
                  >
                    Copy syntax
                  </button>
                </header>
                <p>{command.description}</p>
                <dl>
                  <dt>Syntax</dt>
                  <dd>
                    <code>{prefix(command.usage || command.name)}</code>
                  </dd>
                  {command.example && (
                    <>
                      <dt>Example</dt>
                      <dd>
                        <code>{command.example}</code>
                      </dd>
                    </>
                  )}
                  {!!command.aliases?.length && (
                    <>
                      <dt>Aliases</dt>
                      <dd>{command.aliases.map(prefix).join(", ")}</dd>
                    </>
                  )}
                  {command.permission && (
                    <>
                      <dt>Permission</dt>
                      <dd>{command.permission}</dd>
                    </>
                  )}
                </dl>
              </article>
            ))
          ) : (
            <div className="pub-empty">
              <h3>No commands found.</h3>
              <p>Try a shorter name or another keyword.</p>
              <button type="button" className="pub-text-link" onClick={() => setQuery("")}>
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
