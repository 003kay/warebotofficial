import { ArrowRight, Gavel, MessageSquare, ShieldCheck, Terminal, Users, Wrench } from "lucide-react";
import { INVITE_URL } from "@/lib/links";
import { WARE_COMMAND_COUNT } from "@/lib/canonicalCommands";

const WARE_AVATAR = "/ware-logo.svg?v=4";

const categories = [
  { title: "Protection", description: "Anti-nuke, raid defense and security", icon: ShieldCheck, href: "/commands?category=antinuke" },
  { title: "Moderation", description: "Staff tools and server controls", icon: Gavel, href: "/commands?category=moderation" },
  { title: "Tickets", description: "Support panels, claims and transcripts", icon: MessageSquare, href: "/commands?category=tickets" },
  { title: "Community", description: "Economy, games, giveaways and levels", icon: Users, href: "/commands?category=utility" },
  { title: "Utility", description: "Tools, media, lookups and automation", icon: Wrench, href: "/commands?category=utility" },
] as const;

function DiscordLogo() {
  return <svg viewBox="0 0 127.14 96.36" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z"/></svg>;
}

export function Hero() {
  return <section className="relative z-10 mx-auto max-w-[1400px] px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20">
    <div className="mx-auto max-w-4xl text-center">
      <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-white/[.09] bg-white/[.035] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[.18em] text-white/45"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>Ware is online</div>
      <h1 className="text-balance text-5xl font-semibold tracking-[-.065em] text-white sm:text-6xl md:text-7xl lg:text-[88px]">One bot. Your whole server.</h1>
      <p className="mx-auto mt-6 max-w-2xl text-balance text-sm leading-7 text-white/46 sm:text-base">Moderation, security, tickets, automation, music, utilities and community features in one fast Discord bot with <span className="font-semibold text-white/75">{WARE_COMMAND_COUNT.toLocaleString()} command paths</span>.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"><a href={INVITE_URL} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90"><DiscordLogo/>Add to Discord<ArrowRight className="h-4 w-4"/></a><a href="/commands" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[.035] px-5 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[.07] hover:text-white"><Terminal className="h-4 w-4"/>Browse commands</a></div>
    </div>

    <div className="mx-auto mt-14 max-w-[1120px] overflow-hidden rounded-[30px] border border-white/[.09] bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,.055),transparent_35rem),#0b0c0c] p-2 shadow-[0_50px_150px_-80px_rgba(255,255,255,.3)] md:mt-20">
      <div className="rounded-[24px] border border-white/[.06] bg-black/25">
        <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white/20"/><span className="h-2 w-2 rounded-full bg-white/10"/><span className="h-2 w-2 rounded-full bg-white/5"/></div><div className="font-mono text-[10px] text-white/25">ware / command center</div></div>
        <div className="p-5 md:p-6"><div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/[.07] bg-white/[.025] p-4"><div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-black/35"><img src={WARE_AVATAR} alt="Ware" className="h-10 w-10 object-contain"/></div><div><div className="text-[15px] font-semibold">Ware</div><div className="mt-1 text-[10px] text-white/32">{WARE_COMMAND_COUNT.toLocaleString()} commands · 24/7 protection</div></div><span className="ml-auto rounded-full border border-emerald-400/20 bg-emerald-400/[.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-emerald-300/70">online</span></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">{categories.map(category => { const Icon = category.icon; return <a key={category.title} href={category.href} className="group flex min-h-[125px] flex-col rounded-2xl border border-white/[.065] bg-white/[.015] p-4 transition hover:-translate-y-1 hover:border-white/[.15] hover:bg-white/[.04]"><div className="grid h-9 w-9 place-items-center rounded-xl border border-white/[.08] bg-white/[.025] text-white/55"><Icon className="h-4 w-4"/></div><div className="mt-auto pt-4"><div className="flex items-center gap-1 text-sm font-semibold text-white/82">{category.title}<ArrowRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-60"/></div><p className="mt-1.5 text-[10px] leading-4 text-white/32">{category.description}</p></div></a>; })}</div>
          <a href="/commands" className="mt-3 flex items-center gap-3 rounded-2xl border border-white/[.065] bg-black/20 px-4 py-3.5 font-mono text-[11px] text-white/38 transition hover:border-white/[.14] hover:text-white/60"><Terminal className="h-4 w-4"/>$ ware commands --all <span className="ml-auto text-white/22">{WARE_COMMAND_COUNT}</span></a>
        </div>
      </div>
    </div>
  </section>;
}
