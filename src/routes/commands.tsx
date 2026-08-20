import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";
import { commandCategories } from "@/lib/commands";

const lastFmCategory = {
  slug: "lastfm",
  name: "Last.fm",
  description: "Connect Last.fm, show what you're listening to, and explore your music statistics.",
  commands: [
    { name: "lastfm", description: "Open Ware's Last.fm command overview.", usage: ",lastfm", example: ",lastfm", aliases: ["lfm"] },
    { name: "lastfm login", description: "Securely connect your Last.fm account to Ware.", usage: ",lastfm login", example: ",lastfm login" },
    { name: "lastfm logout", description: "Disconnect your Last.fm account from Ware.", usage: ",lastfm logout", example: ",lastfm logout" },
    { name: "lastfm now", description: "Show your current or most recently scrobbled track.", usage: ",lastfm now (user)", example: ",lastfm now", aliases: ["np"] },
    { name: "lastfm recent", description: "Show your latest Last.fm scrobbles.", usage: ",lastfm recent (user)", example: ",lastfm recent" },
    { name: "lastfm profile", description: "View a connected Last.fm profile and listening statistics.", usage: ",lastfm profile (user)", example: ",lastfm profile" },
    { name: "lastfm topartists", description: "Show your most-played artists on Last.fm.", usage: ",lastfm topartists (period)", example: ",lastfm topartists 7d" },
    { name: "lastfm topalbums", description: "Show your most-played albums on Last.fm.", usage: ",lastfm topalbums (period)", example: ",lastfm topalbums 7d" },
    { name: "lastfm toptracks", description: "Show your most-played tracks on Last.fm.", usage: ",lastfm toptracks (period)", example: ",lastfm toptracks 7d" },
    { name: "lastfm whoknows", description: "Rank server members by plays for an artist.", usage: ",lastfm whoknows (artist)", example: ",lastfm whoknows Drake", aliases: ["wk"] },
    { name: "lastfm scoreboard", description: "Rank connected Last.fm listeners in the server by scrobbles.", usage: ",lastfm scoreboard", example: ",lastfm scoreboard" },
    { name: "lastfm globalboard", description: "Show Ware's global Last.fm listener scoreboard.", usage: ",lastfm globalboard", example: ",lastfm globalboard" },
  ],
};

const categories = [...commandCategories, lastFmCategory];

export const Route = createFileRoute("/commands")({
  validateSearch: (search: Record<string, unknown>) => ({ category: typeof search.category === "string" ? search.category : undefined }),
  head: () => ({ meta: [{ title: "Commands — ware" }, { name: "description", content: "Browse Ware's complete command library." }] }),
  component: CommandsPage,
});

function CommandsPage() {
  const search = Route.useSearch();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() => categories.some(g => g.slug === search.category) ? search.category! : "all");
  const all = useMemo(() => categories.flatMap(g => g.commands.map(c => ({ ...c, category: g.name, categorySlug: g.slug }))), []);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(c => (category === "all" || c.categorySlug === category) && (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.usage.toLowerCase().includes(q) || (c.aliases ?? []).some(a => a.toLowerCase().includes(q))));
  }, [all, query, category]);

  return <div className="relative min-h-screen overflow-hidden bg-[#050505]"><Starfield/><Navbar/><main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-8"><Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white"><ArrowLeft className="h-4 w-4"/>Home</Link><section className="mt-8 rounded-[32px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012))] p-6 shadow-[0_40px_120px_-70px_rgba(255,255,255,.2)] md:p-10"><p className="text-[10px] uppercase tracking-[0.22em] text-white/30">ware command center</p><h1 className="mt-3 text-5xl font-bold tracking-[-0.055em] md:text-7xl">Commands</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/45">Search every Ware command, alias, and category from one clean command library.</p><div className="mt-10 rounded-[24px] border border-white/10 bg-black/30 p-3"><label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 focus-within:border-white/25"><Search className="h-4 w-4 text-white/35"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search commands..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"/></label></div><div className="mt-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><div className="flex min-w-max gap-2"><button onClick={()=>setCategory("all")} className={`rounded-2xl border px-4 py-2.5 text-xs font-semibold ${category==="all"?"border-white bg-white text-black":"border-white/10 bg-white/[0.025] text-white/55"}`}>All Commands</button>{categories.map(g=><button key={g.slug} onClick={()=>setCategory(g.slug)} className={`rounded-2xl border px-4 py-2.5 text-xs ${category===g.slug?(g.slug==="lastfm"?"border-[#ff3a45] bg-[#d9232e] text-white":"border-white bg-white text-black"):"border-white/10 bg-white/[0.025] text-white/55"}`}>{g.name}</button>)}</div></div></section><section className="mt-8"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{shown.map((c,i)=><article key={`${c.name}-${i}`} className={`group rounded-[22px] border p-5 transition-all duration-200 hover:-translate-y-1 ${c.categorySlug==="lastfm"?"border-[#d9232e]/20 bg-[#d9232e]/[0.035] hover:border-[#ff3a45]/40":"border-white/[0.08] bg-white/[0.022] hover:border-white/[0.17] hover:bg-white/[0.045]"}`}><div className="flex items-start justify-between gap-3"><span className="rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-1.5 text-sm font-semibold">,{c.name}</span><span className={`text-[9px] uppercase tracking-[0.14em] ${c.categorySlug==="lastfm"?"text-[#ff5a64]":"text-white/25"}`}>{c.category}</span></div><p className="mt-4 text-sm leading-6 text-white/60">{c.description}</p><div className="mt-4 border-t border-white/[0.06] pt-3 font-mono text-[11px] text-white/35">{c.usage}</div></article>)}</div></section></main><Footer/></div>;
}
