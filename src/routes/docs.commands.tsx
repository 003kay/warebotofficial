import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Search, Terminal } from "lucide-react";
import { useMemo, useState } from "react";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { canonicalCommandCategories, canonicalCommands, WARE_COMMAND_COUNT } from "@/lib/canonicalCommands";

export const Route = createFileRoute("/docs/commands")({
  head: () => ({ meta: [{ title: "Commands — stained docs" }, { name: "description", content: `Complete documentation for all ${WARE_COMMAND_COUNT} Stained command paths.` }] }),
  component: CommandsDocs,
});

function CommandsDocs() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [copied, setCopied] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return canonicalCommands.filter(command => {
      const group = canonicalCommandCategories.find(item => item.commands.some(entry => entry.name.toLowerCase() === command.name.toLowerCase()));
      return (category === "all" || group?.slug === category) && (!q || command.name.toLowerCase().includes(q) || command.description.toLowerCase().includes(q) || command.usage.toLowerCase().includes(q) || (command.aliases ?? []).some(alias => alias.toLowerCase().includes(q)));
    });
  }, [category, query]);

  async function copy(text: string, key: string) {
    try { await navigator.clipboard.writeText(text); setCopied(key); window.setTimeout(() => setCopied(current => current === key ? null : current), 1200); } catch { setCopied(null); }
  }

  return <DocsLayout active="commands" toc={[{ id: "command-library", label: "Command library" }, { id: "social-notifications", label: "Social notifications" }]}>
    <section className="relative overflow-hidden rounded-[26px] border border-white/[.08] bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,.06),transparent_28rem),#0d0e0e] p-6 md:p-8">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-white/40"><Terminal className="h-3.5 w-3.5"/>Command reference</div>
      <h1 className="mt-5 text-4xl font-semibold tracking-[-.05em] md:text-6xl">Stained command docs</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/48">The current Stained script exposes <span className="font-semibold text-white/80">{WARE_COMMAND_COUNT.toLocaleString()} unique prefix command paths</span>. This reference is synced to the same command source used by the public command browser, so totals and search results stay aligned.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/[.07] bg-black/20 p-4"><div className="font-mono text-2xl font-semibold">{WARE_COMMAND_COUNT}</div><div className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/28">command paths</div></div><div className="rounded-2xl border border-white/[.07] bg-black/20 p-4"><div className="font-mono text-2xl font-semibold">{canonicalCommandCategories.length}</div><div className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/28">categories</div></div><div className="rounded-2xl border border-white/[.07] bg-black/20 p-4"><div className="font-mono text-2xl font-semibold">,</div><div className="mt-1 text-[10px] uppercase tracking-[.14em] text-white/28">default prefix</div></div></div>
    </section>

    <section id="social-notifications" className="mt-8 scroll-mt-24 rounded-[24px] border border-white/[.07] bg-white/[.02] p-5 md:p-6"><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/30">Integrations</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">Social notifications</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/44">Stained currently supports notification tooling for TikTok, Instagram, YouTube, Twitter/X, Twitch and Kick where those command paths exist in the bot. Subreddit, standalone SoundCloud notifications and Pinterest notifications are not part of the current command set. <code className="rounded bg-white/[.05] px-1.5 py-0.5 font-mono text-[11px] text-white/60">lastfm soundcloud</code> remains available as a Last.fm lookup.</p><div className="mt-4 flex flex-wrap gap-2">{["TikTok","Instagram","YouTube","Twitter / X","Twitch","Kick"].map(name => <span key={name} className="rounded-xl border border-white/[.08] bg-black/20 px-3 py-2 text-xs text-white/55">{name}</span>)}</div></section>

    <section id="command-library" className="mt-8 scroll-mt-24">
      <div className="flex flex-col gap-4 border-b border-white/[.07] pb-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-white/30">Reference</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">Command library</h2><p className="mt-1 text-xs text-white/32">Search name, alias, syntax or description.</p></div><label className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-white/[.09] bg-black/25 px-4 py-3.5 focus-within:border-white/20"><Search className="h-4 w-4 text-white/30"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search commands..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/22"/><span className="font-mono text-[10px] text-white/25">{visible.length}</span></label></div>

      <div className="mt-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><div className="flex w-max gap-2"><button onClick={() => setCategory("all")} className={`rounded-xl border px-3.5 py-2 text-xs transition ${category === "all" ? "border-white/20 bg-white text-black" : "border-white/[.07] bg-white/[.025] text-white/45 hover:text-white"}`}>All <span className="ml-1 opacity-60">{WARE_COMMAND_COUNT}</span></button>{canonicalCommandCategories.map(group => <button key={group.slug} onClick={() => setCategory(group.slug)} className={`rounded-xl border px-3.5 py-2 text-xs transition ${category === group.slug ? "border-white/20 bg-white text-black" : "border-white/[.07] bg-white/[.025] text-white/45 hover:text-white"}`}>{group.name} <span className="ml-1 opacity-60">{group.commands.length}</span></button>)}</div></div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">{visible.map(command => { const group = canonicalCommandCategories.find(item => item.commands.some(entry => entry.name.toLowerCase() === command.name.toLowerCase())); return <article key={command.name} className="rounded-2xl border border-white/[.075] bg-[#0d0e0e] p-5 transition hover:border-white/[.15]"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="font-mono text-[15px] font-semibold text-white">,{command.name}</div><div className="mt-1 text-[9px] font-semibold uppercase tracking-[.14em] text-white/25">{group?.name ?? "Stained"}</div></div><button onClick={() => copy(`,${command.usage}`, command.name)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[.07] text-white/35 hover:border-white/20 hover:text-white" aria-label={`Copy ${command.name} usage`}>{copied === command.name ? <Check className="h-3.5 w-3.5"/> : <Copy className="h-3.5 w-3.5"/>}</button></div><p className="mt-4 text-[13px] leading-6 text-white/50">{command.description}</p><div className="mt-4 space-y-2 rounded-xl border border-white/[.06] bg-black/25 p-3 font-mono text-[11px]"><div><span className="mr-2 text-white/24">Syntax</span><span className="text-white/62">,{command.usage}</span></div>{command.example ? <div><span className="mr-2 text-white/24">Example</span><span className="text-white/62">,{command.example}</span></div> : null}</div>{command.aliases?.length ? <div className="mt-3"><span className="text-[10px] uppercase tracking-[.12em] text-white/24">Aliases</span><div className="mt-2 flex flex-wrap gap-1.5">{command.aliases.map(alias => <span key={alias} className="rounded-md border border-white/[.06] px-2 py-1 font-mono text-[10px] text-white/38">,{alias}</span>)}</div></div> : null}{command.permission ? <div className="mt-3 text-[10px] text-white/26">Permission <span className="ml-1 text-white/48">{command.permission}</span></div> : null}</article>; })}</div>
      {!visible.length ? <div className="mt-5 rounded-2xl border border-white/[.07] bg-white/[.02] px-6 py-14 text-center text-sm text-white/38">No commands match those filters.</div> : null}
    </section>
  </DocsLayout>;
}

