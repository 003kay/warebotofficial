import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Copy, Layers3, Search, Terminal } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { canonicalCommandCategories, canonicalCommands, WARE_COMMAND_COUNT, type WareCommandCategory } from "@/lib/canonicalCommands";

export const Route = createFileRoute("/commands")({
  validateSearch: (search: Record<string, unknown>) => ({ category: typeof search.category === "string" ? search.category : undefined }),
  head: () => ({ meta: [{ title: "Commands — ware" }, { name: "description", content: `Browse all ${WARE_COMMAND_COUNT} Ware commands.` }] }),
  component: CommandsPage,
});

function CommandCount({ value }: { value: number }) {
  return <span className="font-mono text-[11px] text-white/35">{value.toLocaleString()}</span>;
}

function CommandsPage() {
  const search = Route.useSearch();
  const railRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() => canonicalCommandCategories.some(group => group.slug === search.category) ? search.category! : "all");
  const [copied, setCopied] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return canonicalCommands.filter(command => {
      const group = canonicalCommandCategories.find(item => item.commands.some(entry => entry.name.toLowerCase() === command.name.toLowerCase()));
      const categoryMatches = category === "all" || group?.slug === category;
      const textMatches = !q || command.name.toLowerCase().includes(q) || command.description.toLowerCase().includes(q) || command.usage.toLowerCase().includes(q) || (command.aliases ?? []).some(alias => alias.toLowerCase().includes(q));
      return categoryMatches && textMatches;
    });
  }, [category, query]);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(current => current === key ? null : current), 1200);
    } catch { setCopied(null); }
  };

  const scrollRail = (direction: -1 | 1) => railRef.current?.scrollBy({ left: direction * 520, behavior: "smooth" });
  const selectedClass = (selected: boolean) => `flex min-w-[160px] shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${selected ? "border-white/20 bg-white/[.09] text-white" : "border-white/[.07] bg-[#111212] text-white/55 hover:border-white/[.14] hover:bg-white/[.05] hover:text-white"}`;

  return (
    <div className="min-h-screen bg-[#080909] text-white">
      <Navbar />
      <main className="mx-auto max-w-[1320px] px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[30px] border border-white/[.08] bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,.06),transparent_34rem),#0d0e0e] p-6 md:p-9">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-white/45"><Terminal className="h-3.5 w-3.5" /> Command library</div>
              <h1 className="text-4xl font-semibold tracking-[-.05em] sm:text-5xl">All Ware commands</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">{WARE_COMMAND_COUNT.toLocaleString()} live command paths, synced to the current Ware bot script. Search by command, alias, description, or usage.</p>
            </div>
            <Link to="/docs/commands" className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[.05] px-4 text-xs font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[.09] hover:text-white">Open command docs</Link>
          </div>
          <label className="mt-7 flex max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 focus-within:border-white/25">
            <Search className="h-4 w-4 text-white/35" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search 929 commands..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/25" />
            <span className="font-mono text-[10px] text-white/30">{shown.length}</span>
          </label>
        </section>

        <section className="sticky top-0 z-30 -mx-4 mt-5 bg-[#080909]/95 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center gap-2 rounded-2xl border border-white/[.07] bg-[#0e0f0f] p-2">
            <button onClick={() => scrollRail(-1)} className="grid h-14 w-9 shrink-0 place-items-center rounded-xl border border-white/[.07] text-white/40 hover:text-white" aria-label="Scroll categories left"><ChevronLeft className="h-4 w-4" /></button>
            <div ref={railRef} className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max gap-2">
                <button onClick={() => setCategory("all")} className={selectedClass(category === "all")}><Layers3 className="h-4 w-4" /><span><span className="block text-sm font-medium">All commands</span><CommandCount value={WARE_COMMAND_COUNT} /></span></button>
                {canonicalCommandCategories.map((group: WareCommandCategory) => <button key={group.slug} onClick={() => setCategory(group.slug)} className={selectedClass(category === group.slug)}><Terminal className="h-4 w-4" /><span><span className="block max-w-[140px] truncate text-sm font-medium">{group.name}</span><CommandCount value={group.commands.length} /></span></button>)}
              </div>
            </div>
            <button onClick={() => scrollRail(1)} className="grid h-14 w-9 shrink-0 place-items-center rounded-xl border border-white/[.07] text-white/40 hover:text-white" aria-label="Scroll categories right"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between border-b border-white/[.07] pb-4"><div><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/30">Results</div><div className="mt-1 text-sm text-white/55">{shown.length.toLocaleString()} commands shown</div></div>{query || category !== "all" ? <button onClick={() => { setQuery(""); setCategory("all"); }} className="rounded-lg px-3 py-2 text-xs text-white/40 hover:bg-white/[.05] hover:text-white">Clear filters</button> : null}</div>

        <section className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map(command => {
            const key = command.name;
            const group = canonicalCommandCategories.find(item => item.commands.some(entry => entry.name.toLowerCase() === command.name.toLowerCase()));
            return <article key={key} className="rounded-2xl border border-white/[.075] bg-[#101111] p-5 transition hover:-translate-y-0.5 hover:border-white/[.16] hover:bg-[#141515]">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="truncate font-mono text-[15px] font-semibold text-white">,{command.name}</div><div className="mt-1 text-[10px] uppercase tracking-[.12em] text-white/28">{group?.name ?? "Ware"}</div></div><button onClick={() => copy(`,${command.usage}`, key)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[.07] text-white/35 hover:border-white/20 hover:text-white" title="Copy usage">{copied === key ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</button></div>
              <p className="mt-4 min-h-[44px] text-[13px] leading-5 text-white/52">{command.description}</p>
              <div className="mt-4 rounded-xl border border-white/[.06] bg-black/25 p-3 font-mono text-[11px] leading-5 text-white/55"><span className="text-white/25">syntax </span>,{command.usage}{command.example ? <><br /><span className="text-white/25">example </span>,{command.example}</> : null}</div>
              {command.aliases?.length ? <div className="mt-3 flex flex-wrap gap-1.5">{command.aliases.slice(0, 5).map(alias => <span key={alias} className="rounded-md border border-white/[.06] px-2 py-1 font-mono text-[10px] text-white/35">,{alias}</span>)}</div> : null}
              {command.permission ? <div className="mt-3 text-[10px] text-white/28">Permission: <span className="text-white/48">{command.permission}</span></div> : null}
            </article>;
          })}
        </section>
        {!shown.length ? <div className="mt-8 rounded-2xl border border-white/[.08] bg-[#101111] px-6 py-16 text-center text-sm text-white/40">No commands match those filters.</div> : null}
      </main>
      <Footer />
    </div>
  );
}
