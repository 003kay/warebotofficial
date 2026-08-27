import { ArrowRight, Bot, Gavel, Headphones, MessageSquare, ShieldCheck, Terminal, Users, Music2, Wrench } from "lucide-react";
import { INVITE_URL } from "@/lib/links";

const WARE_AVATAR = "/ware-logo.svg?v=4";
const COMMAND_COUNT = 822;

function DiscordLogo() {
  return <svg viewBox="0 0 127.14 96.36" aria-hidden="true" className="h-4 w-4 fill-current"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0 105.89 105.89 0 0 0 19.39 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" /></svg>;
}

const categories = [
  { title: "Protection", description: "Anti-nuke, anti-raid, logging & security", icon: ShieldCheck, href: "/commands?category=antinuke" },
  { title: "Moderation", description: "Warns, bans, filters, roles & staff tools", icon: Gavel, href: "/commands?category=moderation" },
  { title: "Tickets", description: "Panels, support flows, embeds & transcripts", icon: MessageSquare, href: "/commands?category=tickets" },
  { title: "Community", description: "Giveaways, economy, voice, levels & utility", icon: Users, href: "/commands?category=utility" },
  { title: "Last.fm", description: "Now playing, scrobbles, stats & listener boards", icon: Music2, href: "/commands?category=lastfm", lastfm: true },
  { title: "Utility", description: "Everyday tools, lookups, embeds & automation", icon: Wrench, href: "/commands?category=utility" },
] as const;

const miniFeatures = [
  { icon: ShieldCheck, label: "Protection" },
  { icon: Headphones, label: "Voice" },
  { icon: Music2, label: "Last.fm" },
  { icon: Bot, label: "Automation" },
] as const;

export function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-10 md:px-10 md:pb-32 md:pt-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[980px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[150px]" />
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[.96fr_1.04fr] lg:gap-16 xl:gap-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[.16em] text-white/38">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.7)]" /> Ware is online
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[.94] tracking-[-.065em] text-white sm:text-6xl md:text-7xl xl:text-[86px]">Run your server<br /><span className="text-white/46">without the clutter.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/46 md:text-lg">One focused Discord system for protection, moderation, tickets, voice, Last.fm, automation and everyday server management.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={INVITE_URL} target="_blank" rel="noreferrer" className="premium-button group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"><DiscordLogo />Invite Ware<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
            <a href="/commands" className="glass-button group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium">Browse {COMMAND_COUNT} commands<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
            {miniFeatures.map(item => <div key={item.label} className="group flex items-center gap-2 rounded-xl border border-white/[0.07] bg-[#0a0c0c] px-3 py-2.5 text-xs text-white/62"><item.icon className="h-3.5 w-3.5 text-white/75" />{item.label}</div>)}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-full bg-white/[0.035] blur-[90px]" />
          <div className="hero-console overflow-hidden rounded-[30px] border border-white/[0.11] bg-[#080909] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex items-center gap-3"><div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-white/20" /><span className="h-2 w-2 rounded-full bg-white/12" /><span className="h-2 w-2 rounded-full bg-white/7" /></div><span className="font-mono text-[10px] text-white/32">ware / command center</span></div>
              <span className="font-mono text-[9px] text-emerald-300/70">LIVE</span>
            </div>

            <div className="p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0c0e0e] p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/30"><img src={WARE_AVATAR} alt="Ware" className="h-9 w-9 object-contain" /></div>
                <div><div className="text-sm font-semibold">ware is online</div><div className="mt-0.5 text-xs text-white/36">Ready to manage your server.</div></div>
                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,.6)]" />
              </div>

              <div className="mb-3 flex items-center justify-between px-1"><div className="text-[10px] uppercase tracking-[0.18em] text-white/32">Command categories</div><a href="/commands" className="group inline-flex items-center gap-1 text-[10px] text-white/42 hover:text-white/80">Browse all<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" /></a></div>
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map(category => <a key={category.title} href={category.href} className={`group flex min-h-[112px] flex-col rounded-2xl border p-4 transition ${category.lastfm ? "border-[#d9232e]/20 bg-[#d9232e]/[0.035] hover:border-[#ff4651]/35" : "border-white/[0.075] bg-[#0b0d0d] hover:border-white/[0.16] hover:bg-[#111313]"}`}><div className={`grid h-9 w-9 place-items-center rounded-xl border ${category.lastfm ? "border-[#d9232e]/25 bg-[#d9232e]/10 text-[#ff5a64]" : "border-white/10 bg-white/[0.035] text-white/72"}`}><category.icon className="h-4 w-4" /></div><div className="mt-auto pt-4"><div className="flex items-center gap-1.5 text-sm font-medium text-white/92">{category.title}<ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-60" /></div><div className="mt-1 text-[11px] leading-4 text-white/35">{category.description}</div></div></a>)}
              </div>
              <a href="/commands" className="group mt-3 flex items-center gap-3 rounded-2xl border border-white/[0.075] bg-black/30 px-4 py-3.5 hover:border-white/[0.14] hover:bg-white/[0.025]"><Terminal className="h-4 w-4 text-white/52" /><span className="font-mono text-xs text-white/38">Explore the full command library</span><ArrowRight className="ml-auto h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-1" /></a>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/[0.07] border-t border-white/[0.07]">
              {[["99.99%", "uptime"], [String(COMMAND_COUNT), "commands"], ["24/7", "protection"]].map(([value, label]) => <div key={label} className="px-3 py-4 text-center"><div className="text-sm font-semibold">{value}</div><div className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-white/32">{label}</div></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
