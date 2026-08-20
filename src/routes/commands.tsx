import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Starfield } from "@/components/Starfield";
import { commandCategories } from "@/lib/commands";

type LastFmCommand = {
  name: string;
  description: string;
  usage: string;
  example: string;
  aliases?: string[];
  permission?: string;
};

const lfm = (
  name: string,
  description: string,
  usage: string,
  permission = "None",
  aliases?: string[],
): LastFmCommand => ({ name, description, usage, example: usage, permission, aliases });

const lastFmCategory = {
  slug: "lastfm",
  name: "Last.fm",
  description: "Connect Last.fm, view scrobbles, compare music taste, and explore listening statistics.",
  commands: [
    lfm("lastfm", "Integrate your Last.fm account with Ware and view your scrobble stats.", ",lastfm"),
    lfm("lastfm mode", "Use a different embed for Now Playing or create your own.", ",lastfm mode (type)", "Tier 1 Only"),
    lfm("lastfm color", "Set the embed color for Last.fm commands.", ",lastfm color (hex)"),
    lfm("lastfm logout", "Remove your Last.fm account from Ware's internal system.", ",lastfm logout"),
    lfm("lastfm taste", "Compare your music taste with another member.", ",lastfm taste (member) (period)"),
    lfm("lastfm playsall", "Check how many plays you have for every song on an album.", ",lastfm playsall (member) (artist and album)"),
    lfm("lastfm update", "Update and validate your Last.fm library connection.", ",lastfm update (parameters)"),
    lfm("lastfm topartists", "View your most listened-to artists.", ",lastfm topartists (member) (period)"),
    lfm("lastfm playsalbum", "Check how many plays you have for an album.", ",lastfm playsalbum (member) (artist and album)"),
    lfm("lastfm toptracks", "View your most listened-to tracks.", ",lastfm toptracks (member) (period)"),
    lfm("lastfm favorites", "View yours or a member's liked tracks.", ",lastfm favorites (member)"),
    lfm("lastfm milestone", "See what track your given-number scrobble was.", ",lastfm milestone (number)"),
    lfm("lastfm streak", "View your current listening streak.", ",lastfm streak (member)"),
    lfm("lastfm playstrack", "Check how many plays you have for a specific track.", ",lastfm playstrack (member) (artist and track)"),
    lfm("lastfm count", "View your total Last.fm scrobbles.", ",lastfm count (member)"),
    lfm("lastfm topalbums", "View your most listened-to albums.", ",lastfm topalbums (member) (period)"),
    lfm("lastfm collage", "View a collage of your most listened-to albums.", ",lastfm collage (member) (rows x cols) (period)"),
    lfm("lastfm hide", "Hide users from appearing on whoknows commands.", ",lastfm hide (member)", "Manage Guild"),
    lfm("lastfm hide list", "View the list of hidden members.", ",lastfm hide list"),
    lfm("lastfm whois", "View Last.fm profile information.", ",lastfm whois (member)"),
    lfm("lastfm url", "Submit custom artwork for an album instead of the Last.fm artwork.", ",lastfm url (url) (album)"),
    lfm("lastfm lyrics", "Get lyrics for the current song playing.", ",lastfm lyrics (member)"),
    lfm("lastfm whoknows", "View the top listeners for an artist in a server.", ",lastfm whoknows (artist)", "None", ["wk"]),
    lfm("lastfm soundcloud", "Get a SoundCloud link for the current song playing.", ",lastfm soundcloud (member)"),
    lfm("lastfm playing", "See what song everyone is listening to in a server.", ",lastfm playing"),
    lfm("lastfm vote", "Vote for submitted album artwork to display on Now Playing.", ",lastfm vote (artist and album)"),
    lfm("lastfm itunes", "Get an iTunes link for the current song playing.", ",lastfm itunes (member)"),
    lfm("lastfm recommendation", "Recommend a random artist from your library.", ",lastfm recommendation (member)"),
    lfm("lastfm toptenalbums", "View your top ten albums for an artist.", ",lastfm toptenalbums (member) (artist)"),
    lfm("lastfm score", "View your Last.fm score and statistics.", ",lastfm score (member)"),
    lfm("lastfm customreactions", "Set personal upvote and downvote reactions for Now Playing.", ",lastfm customreactions (upvote) (downvote)", "Tier 1 Only"),
    lfm("lastfm spotify", "Get a Spotify link for the current song playing.", ",lastfm spotify (member)"),
    lfm("lastfm customcommand", "Set your own custom Now Playing command.", ",lastfm customcommand (substring)"),
    lfm("lastfm customcommand list", "View the list of custom Now Playing commands.", ",lastfm customcommand list", "Manage Guild"),
    lfm("lastfm customcommand reset", "Reset all custom Now Playing commands.", ",lastfm customcommand reset", "Manage Guild"),
    lfm("lastfm customcommand cleanup", "Clean up custom commands from absent members.", ",lastfm customcommand cleanup", "Administrator"),
    lfm("lastfm customcommand remove", "Remove a custom command for a member.", ",lastfm customcommand remove (member)", "Manage Guild"),
    lfm("lastfm customcommand public", "Toggle the public flag for a custom command.", ",lastfm customcommand public (substring)", "Manage Guild"),
    lfm("lastfm customcommand blacklist", "Blacklist users from using their own Now Playing command.", ",lastfm customcommand blacklist (member)", "Manage Guild"),
    lfm("lastfm customcommand blacklist list", "View blacklisted custom-command users for Now Playing.", ",lastfm customcommand blacklist list", "Manage Guild"),
    lfm("lastfm globalwhoknows", "View the top listeners for an artist globally.", ",lastfm globalwhoknows (artist)"),
    lfm("lastfm react", "Set server upvote and downvote reactions for Now Playing.", ",lastfm react (upvote) (downvote)", "Manage Guild"),
    lfm("lastfm globalboard", "View the Last.fm global scoreboard.", ",lastfm globalboard"),
    lfm("lastfm youtube", "Get a YouTube link for the current song playing.", ",lastfm youtube (member)"),
    lfm("lastfm globalwktrack", "View the top listeners for a track globally.", ",lastfm globalwktrack (artist)"),
    lfm("lastfm scoreboard", "View the Last.fm server scoreboard.", ",lastfm scoreboard"),
    lfm("lastfm now", "Show your current song playing from Last.fm.", ",lastfm now (member)", "None", ["np"]),
    lfm("lastfm mostcrowns", "View a list of members with the most crowns.", ",lastfm mostcrowns"),
    lfm("lastfm globalwkalbum", "View the top listeners for an album globally.", ",lastfm globalwkalbum (artist)"),
    lfm("lastfm wktrack", "View the top listeners for a specific song by an artist.", ",lastfm wktrack (track)"),
    lfm("lastfm recent", "View your recent tracks.", ",lastfm recent (member)"),
    lfm("lastfm crowns", "View a list of your crowns.", ",lastfm crowns (member)"),
    lfm("lastfm toptentracks", "View your top ten tracks for an artist.", ",lastfm toptentracks (member) (artist)"),
    lfm("lastfm overview", "See your statistics for an artist.", ",lastfm overview (member) (artistname)"),
    lfm("lastfm wkalbum", "View the top listeners for an album by an artist.", ",lastfm wkalbum (album)"),
    lfm("lastfm recentfor", "View your recent tracks for an artist.", ",lastfm recentfor (artist)"),
    lfm("lastfm plays", "Check how many plays you have for an artist.", ",lastfm plays (member) (artist)"),
    lfm("lastfm login", "Login and authenticate Ware to use your Last.fm account.", ",lastfm login"),
    lfm("nowplaying", "Show your current song playing from Last.fm.", ",nowplaying (member)", "None", ["np"]),
    lfm("itunes", "Find a song using the iTunes API.", ",itunes (song)"),
    lfm("spotifyalbum", "Find album results from the Spotify API.", ",spotifyalbum (album)"),
    lfm("spotifytrack", "Find track results from the Spotify API.", ",spotifytrack (track)"),
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

  return <div className="relative min-h-screen overflow-hidden bg-[#050505]"><Starfield/><Navbar/><main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-8"><Link to="/" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white"><ArrowLeft className="h-4 w-4"/>Home</Link><section className="mt-8 rounded-[32px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012))] p-6 shadow-[0_40px_120px_-70px_rgba(255,255,255,.2)] md:p-10"><p className="text-[10px] uppercase tracking-[0.22em] text-white/30">ware command center</p><h1 className="mt-3 text-5xl font-bold tracking-[-0.055em] md:text-7xl">Commands</h1><p className="mt-4 max-w-2xl text-base leading-7 text-white/45">Search every Ware command, alias, and category from one clean command library.</p><div className="mt-10 rounded-[24px] border border-white/10 bg-black/30 p-3"><label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 focus-within:border-white/25"><Search className="h-4 w-4 text-white/35"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search commands..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"/></label></div><div className="mt-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><div className="flex min-w-max gap-2"><button onClick={()=>setCategory("all")} className={`rounded-2xl border px-4 py-2.5 text-xs font-semibold ${category==="all"?"border-white bg-white text-black":"border-white/10 bg-white/[0.025] text-white/55"}`}>All Commands</button>{categories.map(g=><button key={g.slug} onClick={()=>setCategory(g.slug)} className={`rounded-2xl border px-4 py-2.5 text-xs ${category===g.slug?(g.slug==="lastfm"?"border-[#ff3a45] bg-[#d9232e] text-white":"border-white bg-white text-black"):"border-white/10 bg-white/[0.025] text-white/55"}`}>{g.name}</button>)}</div></div></section><section className="mt-8"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{shown.map((c,i)=><article key={`${c.name}-${i}`} className={`group rounded-[22px] border p-5 transition-all duration-200 hover:-translate-y-1 ${c.categorySlug==="lastfm"?"border-[#d9232e]/20 bg-[#d9232e]/[0.035] hover:border-[#ff3a45]/40":"border-white/[0.08] bg-white/[0.022] hover:border-white/[0.17] hover:bg-white/[0.045]"}`}><div className="flex items-start justify-between gap-3"><span className="rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-1.5 text-sm font-semibold">,{c.name}</span><span className={`text-[9px] uppercase tracking-[0.14em] ${c.categorySlug==="lastfm"?"text-[#ff5a64]":"text-white/25"}`}>{c.category}</span></div><p className="mt-4 text-sm leading-6 text-white/60">{c.description}</p><div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3"><span className="font-mono text-[11px] text-white/35">{c.usage}</span>{c.categorySlug==="lastfm" && "permission" in c && c.permission && c.permission!=="None" ? <span className="rounded-full border border-[#d9232e]/25 bg-[#d9232e]/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#ff7a82]">{c.permission}</span> : null}</div></article>)}</div></section></main><Footer/></div>;
}
