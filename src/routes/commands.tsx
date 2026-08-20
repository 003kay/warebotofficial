import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft, Search, Layers3, ShieldCheck, Gavel, Info, Heart, Music2,
  Ticket, Bot, Sparkles, Gamepad2, Wrench, Gift, Crown, User, Server, Image,
  ScrollText, WalletCards, Settings2, Radio, Volume2, Command as CommandIcon,
  Copy, Check, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useMemo, useRef, useState, type WheelEvent } from "react";
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

const lfm = (name: string, description: string, usage: string, permission = "None", aliases?: string[]): LastFmCommand => ({
  name, description, usage, example: usage, permission, aliases,
});

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
const WARE_COMMAND_TOTAL = 517;

const iconBySlug: Record<string, typeof Layers3> = {
  home: Layers3, moderation: Gavel, "channels-roles": Settings2, voicemaster: Volume2,
  "config-logs": ScrollText, antinuke: ShieldCheck, economy: WalletCards, fun: Sparkles,
  games: Gamepad2, utility: Wrench, tickets: Ticket, ai: Bot, giveaways: Gift, premium: Crown,
  leveling: Radio, user: User, server: Server, images: Image, roleplay: Heart, security: ShieldCheck,
  welcome: Info, roblox: Gamepad2, lastfm: Music2,
};

function getArguments(usage: string) {
  const matches = usage.match(/[([][^\])]+[\])]/g) ?? [];
  return matches.map(value => value.slice(1, -1).trim()).filter(Boolean);
}

export const Route = createFileRoute("/commands")({
  validateSearch: (search: Record<string, unknown>) => ({ category: typeof search.category === "string" ? search.category : undefined }),
  head: () => ({ meta: [{ title: "Commands — ware" }, { name: "description", content: "Browse Ware's complete command library." }] }),
  component: CommandsPage,
});

function CommandsPage() {
  const search = Route.useSearch();
  const stripRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(() => categories.some(g => g.slug === search.category) ? search.category! : "all");
  const [copied, setCopied] = useState<string | null>(null);

  const all = useMemo(() => categories.flatMap(g => g.commands.map(c => ({ ...c, category: g.name, categorySlug: g.slug }))), []);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(c => (category === "all" || c.categorySlug === category) && (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.usage.toLowerCase().includes(q) || (c.aliases ?? []).some(a => a.toLowerCase().includes(q))));
  }, [all, query, category]);

  const totalCount = Math.max(WARE_COMMAND_TOTAL, all.length);
  const activeCategory = category === "all" ? null : categories.find(g => g.slug === category);
  const ActiveIcon = activeCategory ? (iconBySlug[activeCategory.slug] ?? Layers3) : CommandIcon;
  const displayedCount = query ? shown.length : category === "all" ? totalCount : shown.length;

  const onCategoryWheel = (event: WheelEvent<HTMLDivElement>) => {
    const el = stripRef.current;
    if (!el || Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
    if (el.scrollWidth <= el.clientWidth) return;
    event.preventDefault();
    el.scrollLeft += event.deltaY;
  };

  const scrollCategories = (edge: "start" | "end") => {
    stripRef.current?.scrollTo({ left: edge === "start" ? 0 : stripRef.current.scrollWidth, behavior: "smooth" });
  };

  const copyCommand = async (usage: string, key: string) => {
    try {
      await navigator.clipboard.writeText(usage);
      setCopied(key);
      window.setTimeout(() => setCopied(current => current === key ? null : current), 1400);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="commands-page relative min-h-screen overflow-hidden bg-[#050505]">
      <Starfield />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(110,126,255,.08),transparent_65%)]" />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-8 md:px-8">
        <Link to="/" className="command-back group inline-flex items-center gap-2 text-sm text-white/40 transition hover:text-white">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Home
        </Link>

        <section className="command-hero mt-8 overflow-hidden rounded-[34px] border border-white/[0.08] bg-[linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.012))] p-6 shadow-[0_40px_120px_-70px_rgba(110,126,255,.28)] md:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/40">
                <CommandIcon className="h-3.5 w-3.5" /> ware command center
              </div>
              <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] md:text-7xl">Commands</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/45">Search Ware's full command system or jump straight into a category.</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-4 py-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl border ${category === "lastfm" ? "border-[#d9232e]/30 bg-[#d9232e]/12 text-[#ff5a64]" : "border-white/10 bg-white/[0.04] text-white/65"}`}>
                <ActiveIcon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs text-white/35">Currently browsing</div>
                <div className="mt-0.5 text-sm font-semibold">{activeCategory?.name ?? "All commands"} <span className="ml-1 text-white/30">· {displayedCount}</span></div>
              </div>
            </div>
          </div>

          <div className="mt-9 rounded-[24px] border border-white/10 bg-black/30 p-2.5 transition focus-within:border-white/20 focus-within:bg-black/40">
            <label className="group flex items-center gap-3 rounded-2xl px-3 py-3.5">
              <Search className="h-4 w-4 text-white/35 transition group-focus-within:scale-110 group-focus-within:text-white/70" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search commands, aliases, or usage..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25" />
              {query ? <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/35">{shown.length} results</span> : null}
            </label>
          </div>

          <div className="relative mt-5 flex items-center gap-2">
            <button type="button" onClick={() => scrollCategories("start")} aria-label="Scroll categories to start" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:scale-95">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div ref={stripRef} onWheel={onCategoryWheel} className="command-category-strip min-w-0 flex-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max gap-2">
                <button onClick={() => setCategory("all")} className={`command-category-button group ${category === "all" ? "is-active" : ""}`}>
                  <span className="command-category-icon"><Layers3 className="h-4 w-4" /></span>
                  <span>All</span><span className="command-count">{totalCount}</span>
                </button>
                {categories.map(g => {
                  const Icon = iconBySlug[g.slug] ?? Layers3;
                  const selected = category === g.slug;
                  return (
                    <button key={g.slug} onClick={() => setCategory(g.slug)} className={`command-category-button group ${selected ? "is-active" : ""} ${g.slug === "lastfm" ? "is-lastfm" : ""}`}>
                      <span className="command-category-icon"><Icon className="h-4 w-4" /></span>
                      <span>{g.name}</span><span className="command-count">{g.commands.length}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button type="button" onClick={() => scrollCategories("end")} aria-label="Scroll categories to end" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:scale-95">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        {activeCategory ? (
          <div className={`command-category-intro mt-6 flex items-center gap-4 rounded-[22px] border px-5 py-4 ${category === "lastfm" ? "border-[#d9232e]/20 bg-[#d9232e]/[0.045]" : "border-white/[0.07] bg-white/[0.02]"}`}>
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${category === "lastfm" ? "border-[#d9232e]/25 bg-[#d9232e]/10 text-[#ff5a64]" : "border-white/10 bg-white/[0.04] text-white/65"}`}><ActiveIcon className="h-5 w-5" /></div>
            <div className="min-w-0"><div className="font-semibold">{activeCategory.name}</div><div className="mt-1 text-sm text-white/38">{activeCategory.description}</div></div>
          </div>
        ) : null}

        <section className="mt-7">
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((c, i) => {
              const Icon = iconBySlug[c.categorySlug] ?? CommandIcon;
              const isLastFm = c.categorySlug === "lastfm";
              const args = getArguments(c.usage);
              const permission = isLastFm && "permission" in c ? (c.permission || "None") : "See command help";
              const key = `${c.categorySlug}:${c.name}:${i}`;
              const isCopied = copied === key;
              return (
                <article key={key} className={`command-detail-card group ${isLastFm ? "is-lastfm" : ""}`}>
                  <div className="command-detail-top">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${isLastFm ? "border-[#d9232e]/25 bg-[#d9232e]/10 text-[#ff5a64]" : "border-white/10 bg-white/[0.04] text-white/55"}`}><Icon className="h-4 w-4" /></div>
                      <div className="min-w-0">
                        <div className="font-mono text-[15px] font-semibold tracking-[-0.02em] text-white">{c.name}</div>
                        <p className="mt-2 text-sm leading-6 text-white/48">{c.description}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => copyCommand(c.usage, key)} aria-label={`Copy ${c.name} command`} title={isCopied ? "Copied" : "Copy command"} className="command-copy-button">
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="command-detail-divider" />

                  <div className="command-detail-meta">
                    <div>
                      <div className="command-detail-label">Arguments</div>
                      <div className="mt-3 flex min-h-7 flex-wrap gap-2">
                        {args.length ? args.map((arg, index) => <span key={`${arg}-${index}`} className="command-argument-chip">{arg}</span>) : <span className="text-xs text-white/38">none</span>}
                      </div>
                    </div>
                    <div>
                      <div className="command-detail-label">Permissions</div>
                      <div className="mt-3"><span className={`command-permission-chip ${permission === "None" ? "is-none" : ""}`}>{permission}</span></div>
                    </div>
                  </div>

                  <div className="command-usage-row">
                    <span className="font-mono text-[11px] text-white/36">{c.usage}</span>
                    <span className={`text-[9px] uppercase tracking-[0.14em] ${isLastFm ? "text-[#ff5a64]/75" : "text-white/22"}`}>{c.category}</span>
                  </div>
                </article>
              );
            })}
          </div>
          {!shown.length ? <div className="mt-10 rounded-[28px] border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center"><Search className="mx-auto h-7 w-7 text-white/20"/><div className="mt-4 font-semibold text-white/70">No commands found</div><div className="mt-1 text-sm text-white/35">Try another search or category.</div></div> : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
