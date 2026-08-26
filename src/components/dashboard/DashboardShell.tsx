import {
  Activity, ChevronDown, ChevronLeft, FileText, Headphones, Home, LayoutPanelTop,
  LifeBuoy, LockKeyhole, MessageSquareText, PanelsTopLeft, Radio, ScrollText,
  Settings2, ShieldCheck, Sparkles, Ticket, UsersRound, WandSparkles, Webhook,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getManagedGuildsFn } from "@/lib/dashboard.functions";
import { SUPPORT_URL } from "@/lib/links";

type GuildInfo = { id: string; name: string; iconUrl: string | null };
type DashboardShellProps = { guild: GuildInfo; guildId: string; active: string; children: ReactNode };
type NavItemProps = { active?: boolean; icon?: typeof Home; customIcon?: ReactNode; children: ReactNode; href: string; description?: string };

const ACTIVE_LABELS: Record<string, string> = {
  home: "Overview", settings: "Settings", security: "Security Center", joinGate: "Join Gate", permissions: "Permissions",
  embeds: "Embed Builder", panels: "Ticket Panels", designer: "Ticket Designer", history: "Ticket History", messages: "Messages",
  voicemaster: "VoiceMaster", customCommands: "Custom Commands", automations: "Automations", logging: "Logging", webhooks: "Webhooks", lastfm: "Last.fm",
};
const ACTIVE_DESCRIPTIONS: Record<string, string> = {
  home: "Live server health, activity and Ware telemetry", settings: "Core server configuration",
  security: "Protection, AutoMod and server defense", joinGate: "Member entry rules and screening", permissions: "Staff dashboard access",
  embeds: "Build polished Discord messages", panels: "Saved ticket panel configurations", designer: "Create and publish ticket experiences",
  history: "Ticket transcripts and closes", messages: "Welcome and leave messages", voicemaster: "Temporary voice channel controls",
  customCommands: "Server-specific responses", automations: "Rules and repeatable workflows", logging: "Event logs and destinations",
  webhooks: "Outgoing integrations", lastfm: "Music identity and listening tools",
};

function GuildAvatar({ guild, size = "lg" }: { guild: GuildInfo; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-10 w-10 rounded-xl" : "h-7 w-7 rounded-lg";
  return guild.iconUrl
    ? <img src={guild.iconUrl} alt="" className={`${cls} object-cover ring-1 ring-white/[.08]`} />
    : <div className={`${cls} grid place-items-center bg-white/[.06] text-[10px] font-semibold text-white/65 ring-1 ring-white/[.08]`}>{guild.name.slice(0, 2).toUpperCase()}</div>;
}

function LastFmMark({ active }: { active: boolean }) {
  return <span className={`text-[12px] font-black italic tracking-[-.08em] transition ${active ? "text-[#ff4651]" : "text-[#d43b43]/65 group-hover:text-[#ff4651]"}`}>fm</span>;
}

function NavItem({ active, icon: Icon, customIcon, children, href, description }: NavItemProps) {
  return <a href={href} className={`group relative flex min-h-[44px] items-center gap-3 rounded-[12px] px-3 transition-all duration-200 ${active ? "bg-white/[.075] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.055)]" : "text-white/39 hover:bg-white/[.035] hover:text-white/76"}`}>
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[9px] transition ${active ? "bg-white/[.07]" : "bg-transparent group-hover:bg-white/[.035]"}`}>
      {customIcon ?? (Icon ? <Icon className={`h-[14px] w-[14px] ${active ? "text-white/82" : "text-white/34 group-hover:text-white/64"}`} strokeWidth={1.8} /> : null)}
    </span>
    <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-medium">{children}</span>{active && description ? <span className="mt-0.5 block truncate text-[7px] text-white/24">{description}</span> : null}</span>
    {active ? <span className="h-1.5 w-1.5 rounded-full bg-[#b9ccd5] shadow-[0_0_12px_rgba(185,204,213,.45)]" /> : null}
  </a>;
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-4"><div className="mb-1.5 px-3 text-[7px] font-semibold uppercase tracking-[.22em] text-white/15">{title}</div><div className="space-y-0.5">{children}</div></section>;
}

function destinationFor(active: string, guildId: string) {
  const suffix: Record<string, string> = { home:"", settings:"settings", security:"security", joinGate:"join-gate", permissions:"permissions", embeds:"embeds", panels:"panels", designer:"tickets", history:"history", messages:"messages", voicemaster:"voicemaster", customCommands:"custom-commands", automations:"automations", logging:"logging", webhooks:"webhooks", lastfm:"lastfm" };
  return `/dashboard/${guildId}/${suffix[active] ?? ""}`;
}

function ServerSwitcher({ guild, guildId, active }: { guild: GuildInfo; guildId: string; active: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { data } = useQuery({ queryKey:["managedGuilds"], queryFn:()=>getManagedGuildsFn(), staleTime:30_000 });
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const guilds = data?.authenticated ? data.guilds : [];
  return <div ref={root} className="relative">
    <button type="button" onClick={()=>setOpen(v=>!v)} className={`flex w-full items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition ${open ? "border-white/[.13] bg-white/[.065]" : "border-white/[.06] bg-white/[.022] hover:border-white/[.10] hover:bg-white/[.04]"}`}>
      <GuildAvatar guild={guild}/><div className="min-w-0 flex-1"><div className="truncate text-[11px] font-semibold text-white/84">{guild.name}</div><div className="mt-0.5 text-[7px] uppercase tracking-[.14em] text-white/20">Server workspace</div></div><ChevronDown className={`h-3.5 w-3.5 text-white/25 transition ${open?"rotate-180":""}`}/>
    </button>
    {open ? <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[90] rounded-[15px] border border-white/[.08] bg-[#0a0b0b]/[.99] p-2 shadow-[0_26px_90px_rgba(0,0,0,.72)] backdrop-blur-2xl">
      <div className="px-2 pb-2 pt-1 text-[7px] font-semibold uppercase tracking-[.18em] text-white/18">Switch server</div>
      <div className="max-h-[260px] space-y-1 overflow-y-auto [scrollbar-width:thin]">{guilds.map(entry=><a key={entry.id} href={destinationFor(active,entry.id)} onClick={()=>setOpen(false)} className={`flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition ${entry.id===guildId?"bg-white/[.07]":"hover:bg-white/[.035]"}`}><GuildAvatar guild={{id:entry.id,name:entry.name,iconUrl:entry.iconUrl}} size="sm"/><div className="min-w-0 flex-1"><div className="truncate text-[9px] font-medium text-white/62">{entry.name}</div><div className="mt-0.5 text-[7px] text-white/18">{entry.owner?"Owner":"Manager"}</div></div>{entry.id===guildId?<span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>:null}</a>)}</div>
      <a href="/dashboard" className="mt-2 flex items-center justify-center border-t border-white/[.045] pt-2 text-[8px] text-white/30 hover:text-white/65">View all servers</a>
    </div> : null}
  </div>;
}

export function DashboardShell({ guild, guildId, active, children }: DashboardShellProps) {
  const activeLabel = ACTIVE_LABELS[active] || "Dashboard";
  const activeDescription = ACTIVE_DESCRIPTIONS[active] || "Manage your Ware server";
  return <div className="min-h-screen bg-[#060707] text-[#f4f6f7] selection:bg-white/15">
    <style>{`@keyframes ware-page-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:none}}`}</style>
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_62%_-10%,rgba(138,164,176,.075),transparent_31%),radial-gradient(circle_at_95%_75%,rgba(64,80,87,.035),transparent_26%)]"/>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-white/[.045] bg-[#080909]/95 backdrop-blur-2xl lg:flex lg:flex-col">
      <div className="flex h-[66px] items-center justify-between border-b border-white/[.045] px-4"><a href="/dashboard" className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center overflow-hidden rounded-[11px] border border-white/[.07] bg-black"><img src="/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png" alt="Ware" className="h-full w-full object-contain p-1"/></div><div><div className="text-[14px] font-semibold tracking-[-.025em] text-white/92">Ware</div><div className="text-[7px] uppercase tracking-[.19em] text-white/18">Dashboard</div></div></a><span className="rounded-full border border-emerald-400/10 bg-emerald-400/[.045] px-2 py-1 text-[7px] text-emerald-200/55">LIVE</span></div>
      <div className="px-3.5 pb-3 pt-3"><a href="/dashboard" className="mb-2.5 inline-flex items-center gap-1 px-1 text-[8px] text-white/22 transition hover:text-white/60"><ChevronLeft className="h-3 w-3"/>All servers</a><ServerSwitcher guild={guild} guildId={guildId} active={active}/></div>
      <div className="mx-4 h-px bg-white/[.04]"/>
      <nav className="flex-1 overflow-y-auto px-3.5 pb-5 pt-4 [scrollbar-color:#252828_transparent] [scrollbar-width:thin]">
        <NavSection title="Workspace"><NavItem icon={Home} active={active==="home"} href={`/dashboard/${guildId}/`} description="Live snapshot">Overview</NavItem><NavItem icon={Settings2} active={active==="settings"} href={`/dashboard/${guildId}/settings`}>Settings</NavItem></NavSection>
        <NavSection title="Protection"><NavItem icon={ShieldCheck} active={active==="security"} href={`/dashboard/${guildId}/security`} description="Defense & AutoMod">Security</NavItem><NavItem icon={LockKeyhole} active={active==="joinGate"} href={`/dashboard/${guildId}/join-gate`}>Join Gate</NavItem><NavItem icon={UsersRound} active={active==="permissions"} href={`/dashboard/${guildId}/permissions`}>Permissions</NavItem></NavSection>
        <NavSection title="Community"><NavItem icon={Sparkles} active={active==="embeds"} href={`/dashboard/${guildId}/embeds`}>Embed Builder</NavItem><NavItem icon={MessageSquareText} active={active==="messages"} href={`/dashboard/${guildId}/messages`}>Messages</NavItem><NavItem icon={FileText} active={active==="customCommands"} href={`/dashboard/${guildId}/custom-commands`}>Custom Commands</NavItem><NavItem icon={Radio} active={active==="voicemaster"} href={`/dashboard/${guildId}/voicemaster`}>VoiceMaster</NavItem></NavSection>
        <NavSection title="Tickets"><NavItem icon={PanelsTopLeft} active={active==="panels"} href={`/dashboard/${guildId}/panels`}>Panels</NavItem><NavItem icon={LayoutPanelTop} active={active==="designer"} href={`/dashboard/${guildId}/tickets`} description="Create & publish">Designer</NavItem><NavItem icon={Ticket} active={active==="history"} href={`/dashboard/${guildId}/history`}>History</NavItem></NavSection>
        <NavSection title="Automation"><NavItem icon={WandSparkles} active={active==="automations"} href={`/dashboard/${guildId}/automations`}>Automations</NavItem><NavItem icon={ScrollText} active={active==="logging"} href={`/dashboard/${guildId}/logging`}>Logging</NavItem><NavItem icon={Webhook} active={active==="webhooks"} href={`/dashboard/${guildId}/webhooks`}>Webhooks</NavItem></NavSection>
        <NavSection title="Music"><NavItem active={active==="lastfm"} href={`/dashboard/${guildId}/lastfm`} customIcon={<LastFmMark active={active==="lastfm"}/>}>Last.fm</NavItem></NavSection>
      </nav>
      <div className="border-t border-white/[.045] p-3.5"><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-[12px] border border-white/[.05] bg-white/[.018] px-3 py-3 transition hover:border-white/[.09] hover:bg-white/[.035]"><span className="grid h-7 w-7 place-items-center rounded-[8px] bg-white/[.035]"><LifeBuoy className="h-3.5 w-3.5 text-white/35 group-hover:text-white/65"/></span><div className="min-w-0 flex-1"><div className="text-[9px] font-medium text-white/55">Need help?</div><div className="mt-0.5 text-[7px] text-white/20">discord.gg/warebot</div></div><Activity className="h-3 w-3 text-emerald-400/60"/></a></div>
    </aside>

    <div className="lg:pl-[264px]">
      <header className="sticky top-0 z-30 border-b border-white/[.045] bg-[#070808]/88 backdrop-blur-2xl"><div className="flex min-h-[66px] items-center justify-between gap-4 px-4 md:px-7 xl:px-9"><div className="min-w-0"><div className="flex items-center gap-2"><GuildAvatar guild={guild} size="sm"/><div className="min-w-0"><div className="flex items-center gap-1.5 text-[8px] text-white/21"><span className="max-w-[160px] truncate">{guild.name}</span><span>/</span><span>{activeLabel}</span></div><h2 className="mt-0.5 truncate text-[15px] font-semibold tracking-[-.025em] text-white/84">{activeLabel}</h2></div></div></div><div className="hidden items-center gap-2 md:flex"><div className="rounded-full border border-white/[.05] bg-white/[.018] px-3 py-1.5 text-[8px] text-white/28">{activeDescription}</div><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/[.065] bg-white/[.025] px-3 py-1.5 text-[8px] text-white/46 transition hover:bg-white/[.055] hover:text-white/75"><Headphones className="h-3 w-3"/>Support</a></div></div>
        <div className="flex gap-1 overflow-x-auto border-t border-white/[.025] px-3 py-2 lg:hidden">{[["Overview",`/dashboard/${guildId}/`,active==="home"],["Security",`/dashboard/${guildId}/security`,active==="security"],["Tickets",`/dashboard/${guildId}/tickets`,active==="designer"],["Settings",`/dashboard/${guildId}/settings`,active==="settings"]].map(([label,href,isActive])=><a key={String(label)} href={String(href)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[9px] ${isActive?"bg-white/[.08] text-white/80":"text-white/30"}`}>{String(label)}</a>)}</div>
      </header>
      <main className="relative px-4 py-5 md:px-7 md:py-7 xl:px-9"><div className="animate-[ware-page-in_.24s_ease-out]">{children}</div></main>
    </div>
  </div>;
}
