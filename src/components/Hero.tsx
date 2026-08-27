import { ArrowRight, Gavel, MessageSquare, ShieldCheck, Terminal, Users, Wrench } from "lucide-react";
import { INVITE_URL } from "@/lib/links";

const WARE_AVATAR = "/ware-logo.svg?v=4";
const COMMAND_COUNT = 836;

function DiscordLogo() {
  return <svg viewBox="0 0 127.14 96.36" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" /></svg>;
}

function LastFmLogo() {
  return <svg viewBox="0 0 24 24" aria-label="Last.fm" className="h-4 w-4 fill-current"><path d="M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z" /></svg>;
}

const categories = [
  { title: "Protection", description: "Anti-nuke, raid defense & security", icon: ShieldCheck, href: "/commands?category=antinuke" },
  { title: "Moderation", description: "Powerful staff and server controls", icon: Gavel, href: "/commands?category=moderation" },
  { title: "Tickets", description: "Support panels, flows & transcripts", icon: MessageSquare, href: "/commands?category=tickets" },
  { title: "Community", description: "Economy, giveaways, levels & more", icon: Users, href: "/commands?category=utility" },
  { title: "Last.fm", description: "Scrobbles, music stats & profiles", href: "/commands?category=lastfm", accent: true, lastfm: true },
  { title: "Utility", description: "Tools, embeds, lookups & automation", icon: Wrench, href: "/commands?category=utility" },
] as const;

export function Hero() {
  return <section className="ware-hero relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-10 md:px-10 md:pb-20 md:pt-14">
    <style>{`
      @keyframes wareSilverShine { 0% { background-position: 180% 50%; } 100% { background-position: -80% 50%; } }
      @keyframes wareCommandFloat { 0%,100% { transform: translate3d(0,10px,0); } 50% { transform: translate3d(0,-18px,0); } }
      .ware-silver-shine { color: transparent; background-image: linear-gradient(105deg,#808388 0%,#c8cbd0 28%,#f3f4f5 46%,#b4b7bc 64%,#72757a 82%,#d5d7da 100%); background-size:240% 100%; background-position:180% 50%; -webkit-background-clip:text; background-clip:text; animation:wareSilverShine 4.6s cubic-bezier(.4,0,.2,1) infinite; }
      .ware-command-center-float { animation: wareCommandFloat 7.2s cubic-bezier(.45,0,.55,1) infinite !important; will-change: transform; transform: translateZ(0); }
      @media(prefers-reduced-motion:reduce){.ware-silver-shine{animation:none!important}}
    `}</style>
    <div className="hero-orb hero-orb-a"/><div className="hero-orb hero-orb-b"/><div className="hero-beam"/>
    <div className="relative z-10 max-w-[900px] text-left animate-[soft-rise_.7s_ease_both]">
      <h1 className="max-w-[850px] text-[3.05rem] font-bold leading-[1.06] tracking-[-.055em] text-white sm:text-[3.8rem] md:text-[4.55rem] xl:text-[5.05rem]">Ware is Discord&apos;s<br/><span className="ware-silver-shine">all-in-one server app.</span></h1>
      <p className="mt-8 max-w-[720px] text-[17px] leading-[1.85] text-white/68 md:text-[18px]">Built for communities that want serious control without stacking a dozen bots. Manage protection, moderation, tickets, music, utilities, automation, and everyday server tools from one place.</p>
      <div className="mt-9 flex flex-wrap gap-3"><a href={INVITE_URL} target="_blank" rel="noreferrer" className="premium-button group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"><DiscordLogo/>Add to Discord<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/></a><a href="/commands" className="glass-button group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium">Explore commands<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/></a></div>
    </div>

    <div className="ware-command-center-float relative mx-auto mt-16 w-full max-w-[1120px] md:mt-20"><div className="pointer-events-none absolute -inset-16 -z-10 rounded-full bg-white/[.025] blur-[100px]"/><div className="hero-console relative overflow-hidden rounded-[32px] border border-white/[.12] bg-black/75 p-2 shadow-[0_55px_150px_-70px_rgba(255,255,255,.22)] backdrop-blur-2xl"><div className="hero-console-sheen"/><div className="overflow-hidden rounded-[25px] border border-white/[.07] bg-[#080909]/95">
      <div className="border-b border-white/[.07] px-5 py-4"><div className="flex items-center gap-3"><div className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-white/20"/><i className="h-2 w-2 rounded-full bg-white/12"/><i className="h-2 w-2 rounded-full bg-white/7"/></div><span className="font-mono text-[10px] text-white/30">ware / command center</span></div></div>
      <div className="p-4 sm:p-5 md:p-6"><div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/[.08] bg-gradient-to-r from-white/[.05] to-white/[.018] p-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/40"><img src={WARE_AVATAR} alt="Ware" className="h-10 w-10 object-contain"/></div><div className="text-[15px] font-semibold tracking-[-.02em] text-white">Ware</div></div>
      <div className="mb-3 flex items-center justify-between px-1"><span className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/35">Command modules</span><a href="/commands" className="text-[11px] font-medium text-white/42 transition hover:text-white">View all →</a></div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{categories.map(c=>{const Icon="icon" in c?c.icon:null;return <a key={c.title} href={c.href} className={`group relative flex min-h-[122px] flex-col overflow-hidden rounded-2xl border p-4 transition duration-300 hover:-translate-y-1 ${"accent" in c&&c.accent?"border-[#d9232e]/25 bg-[#d9232e]/[.035] hover:border-[#ff4651]/40":"border-white/[.07] bg-white/[.018] hover:border-white/[.16] hover:bg-white/[.045]"}`}><div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.07),transparent_55%)]"/><div className={`relative grid h-9 w-9 place-items-center rounded-xl border ${"accent" in c&&c.accent?"border-[#d9232e]/30 bg-[#d9232e]/12 text-[#ff4b55]":"border-white/10 bg-white/[.035] text-white/70"}`}>{"lastfm" in c&&c.lastfm?<LastFmLogo/>:Icon?<Icon className="h-4 w-4"/>:null}</div><div className="relative mt-auto pt-4"><div className="flex items-center gap-1 text-[15px] font-semibold tracking-[-.02em] text-white/90">{c.title}<ArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-70"/></div><div className="mt-1.5 text-[11px] leading-4 text-white/38">{c.description}</div></div></a>})}</div>
      <a href="/commands" className="group mt-3 flex items-center gap-3 rounded-2xl border border-white/[.07] bg-black/35 px-4 py-3.5 transition duration-300 hover:border-white/[.15] hover:bg-white/[.035]"><Terminal className="h-4 w-4 text-white/45"/><span className="font-mono text-[11px] text-white/40">$ ware commands --all</span><span className="animate-cursor h-4 w-px bg-white/50"/><ArrowRight className="ml-auto h-3.5 w-3.5 text-white/25 transition group-hover:translate-x-1"/></a></div>
      <div className="grid grid-cols-3 divide-x divide-white/[.07] border-t border-white/[.07]">{[["99.99%","uptime"],[String(COMMAND_COUNT),"commands"],["24/7","protection"]].map(([v,l])=><div key={l} className="px-3 py-4 text-center"><div className="text-[15px] font-semibold text-white">{v}</div><div className="mt-1 text-[9px] uppercase tracking-[.12em] text-white/30">{l}</div></div>)}</div>
    </div></div></div>
  </section>;
}
