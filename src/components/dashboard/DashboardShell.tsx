import {
  Activity, Bot, ChevronDown, ChevronLeft, CircleDot, FileText, Home,
  LayoutPanelTop, LockKeyhole, MessageSquareText, PanelsTopLeft, Radio, ScrollText,
  Settings2, ShieldCheck, Sparkles, Ticket, UsersRound, WandSparkles, Webhook,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getManagedGuildsFn } from "@/lib/dashboard.functions";

type GuildInfo = { id: string; name: string; iconUrl: string | null };
type DashboardShellProps = { guild: GuildInfo; guildId: string; active: string; children: ReactNode };
type NavItemProps = { active?: boolean; icon: typeof Home; children: ReactNode; href?: string; description?: string };

function NavItem({ active, icon: Icon, children, href, description }: NavItemProps) {
  const className = `group relative flex min-h-[48px] items-center rounded-[14px] px-2.5 transition-all duration-200 ${active ? "bg-gradient-to-r from-white/[.10] to-white/[.045] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08),0_10px_24px_rgba(0,0,0,.20)]" : "text-white/42 hover:bg-white/[.045] hover:text-white/82"}`;
  const body = <>
    <span className={`mr-2.5 grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border transition-all ${active ? "border-white/[.10] bg-white/[.07] shadow-[0_0_20px_rgba(255,255,255,.025)]" : "border-transparent bg-transparent group-hover:border-white/[.04] group-hover:bg-white/[.025]"}`}>
      <Icon className={`h-[15px] w-[15px] ${active ? "text-white" : "text-white/34 group-hover:text-white/66"}`} strokeWidth={1.8} />
    </span>
    <span className="min-w-0 flex-1">
      <span className={`block truncate text-[12px] ${active ? "font-semibold" : "font-medium"}`}>{children}</span>
      {active && description ? <span className="mt-0.5 block truncate text-[8px] text-white/30">{description}</span> : null}
    </span>
    {active ? <span className="absolute right-2.5 h-6 w-[2px] rounded-full bg-white/65" /> : null}
  </>;
  return href ? <a href={href} className={className}>{body}</a> : <div className={className}>{body}</div>;
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-5"><div className="mb-1.5 px-3 text-[8px] font-semibold uppercase tracking-[.24em] text-white/17">{title}</div><div className="space-y-0.5">{children}</div></section>;
}

function GuildAvatar({ guild, size = "lg" }: { guild: GuildInfo; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "h-11 w-11 rounded-[14px]" : "h-7 w-7 rounded-lg";
  if (guild.iconUrl) return <img src={guild.iconUrl} alt="" className={`${sizeClass} object-cover ring-1 ring-white/[.08]`} />;
  return <div className={`${sizeClass} grid place-items-center bg-gradient-to-br from-[#d5dde1] to-[#68747a] text-[11px] font-bold text-black ring-1 ring-white/[.08]`}>{guild.name.slice(0, 2).toUpperCase()}</div>;
}

const ACTIVE_LABELS: Record<string, string> = {
  home: "Overview", settings: "Settings", security: "Security Center", joinGate: "Join Gate",
  permissions: "Permissions", embeds: "Embed Builder", panels: "Ticket Panels", designer: "Ticket Designer",
  history: "Ticket History", messages: "Messages", voicemaster: "VoiceMaster", customCommands: "Custom Commands",
  automations: "Automations", logging: "Logging", webhooks: "Webhooks", lastfm: "Last.fm", discordApps: "Discord Apps",
};
const ACTIVE_DESCRIPTIONS: Record<string, string> = {
  home: "Live server activity and Ware telemetry.", settings: "Core server preferences and bot behavior.",
  security: "Protection, verification and server defense.", joinGate: "Control how new members enter your server.",
  permissions: "Manage staff access to Ware controls.", embeds: "Design polished Discord messages with live preview.",
  panels: "Manage your saved ticket panels.", designer: "Create and publish ticket experiences.",
  history: "Browse ticket closes and online transcripts.", messages: "Configure welcome and leave messaging.",
  voicemaster: "Create and manage temporary voice channels.", customCommands: "Build custom server responses.",
  automations: "Create rules and repeatable workflows.", logging: "Choose what Ware records and where it sends logs.",
  webhooks: "Manage outgoing webhook integrations.", lastfm: "Configure Last.fm features for this server.",
  discordApps: "Manage Discord application integrations.",
};

function destinationFor(active: string, guildId: string) {
  const suffix: Record<string, string> = {
    home: "", settings: "settings", security: "security", joinGate: "join-gate", permissions: "permissions",
    embeds: "embeds", panels: "panels", designer: "tickets", history: "history", messages: "messages",
    voicemaster: "voicemaster", customCommands: "custom-commands", automations: "automations", logging: "logging",
    webhooks: "webhooks", lastfm: "lastfm", discordApps: "discord-apps",
  };
  return `/dashboard/${guildId}/${suffix[active] ?? ""}`;
}

function ServerSwitcher({ guild, guildId, active }: { guild: GuildInfo; guildId: string; active: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { data } = useQuery({ queryKey: ["managedGuilds"], queryFn: () => getManagedGuildsFn(), staleTime: 30_000 });
  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const guilds = data?.authenticated ? data.guilds : [];
  return <div ref={root} className="relative">
    <button type="button" onClick={() => setOpen(v => !v)} className={`group flex w-full items-center gap-3 rounded-[18px] border p-3 text-left transition-all ${open ? "border-white/[.16] bg-white/[.075]" : "border-white/[.075] bg-gradient-to-b from-white/[.055] to-white/[.018] hover:border-white/[.12] hover:bg-white/[.05]"}`}>
      <GuildAvatar guild={guild} />
      <div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold text-white/94">{guild.name}</div><div className="mt-1 text-[8px] uppercase tracking-[.12em] text-white/23">Server workspace</div></div>
      <ChevronDown className={`h-3.5 w-3.5 text-white/30 transition ${open ? "rotate-180" : ""}`} />
    </button>
    {open ? <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[90] overflow-hidden rounded-[18px] border border-white/[.09] bg-[#0b0c0c]/[.99] p-2 shadow-[0_24px_80px_rgba(0,0,0,.7)] backdrop-blur-2xl">
      <div className="px-2 pb-2 pt-1 text-[8px] font-semibold uppercase tracking-[.18em] text-white/22">Switch server</div>
      <div className="max-h-[280px] space-y-1 overflow-y-auto [scrollbar-width:thin]">{guilds.map(entry => <a key={entry.id} href={destinationFor(active, entry.id)} onClick={() => setOpen(false)} className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition ${entry.id === guildId ? "bg-white/[.08]" : "hover:bg-white/[.045]"}`}><GuildAvatar guild={{ id: entry.id, name: entry.name, iconUrl: entry.iconUrl }} size="sm" /><div className="min-w-0 flex-1"><div className="truncate text-[10px] font-medium text-white/72">{entry.name}</div><div className="mt-0.5 text-[7px] text-white/22">{entry.owner ? "Owner" : "Manager"}</div></div>{entry.id === guildId ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> : null}</a>)}</div>
      <div className="mt-2 border-t border-white/[.05] pt-2"><a href="/dashboard" className="flex items-center justify-center rounded-xl px-3 py-2 text-[9px] text-white/38 transition hover:bg-white/[.04] hover:text-white/70">View all servers</a></div>
    </div> : null}
  </div>;
}

export function DashboardShell({ guild, guildId, active, children }: DashboardShellProps) {
  const activeLabel = ACTIVE_LABELS[active] || "Dashboard";
  const activeDescription = ACTIVE_DESCRIPTIONS[active] || "Manage your Ware server experience.";
  return <div className="min-h-screen bg-[#050606] text-[#f5f7f8] selection:bg-white/15">
    <style>{`@keyframes ware-page-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes ware-glow{0%,100%{opacity:.28}50%{opacity:.5}}`}</style>
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_60%_-15%,rgba(155,180,192,.09),transparent_33%),radial-gradient(circle_at_100%_30%,rgba(80,100,110,.055),transparent_25%)]" />
    <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-white/[.055] bg-[#080909]/97 shadow-[20px_0_70px_rgba(0,0,0,.20)] backdrop-blur-xl lg:flex lg:flex-col">
      <a href="/dashboard" className="flex h-[72px] items-center gap-3 border-b border-white/[.05] px-5 transition hover:bg-white/[.018]"><div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/[.08] bg-black"><img src="/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png" alt="Ware" className="h-full w-full object-contain p-1" /></div><div><div className="text-[15px] font-semibold text-white">Ware</div><div className="mt-0.5 text-[8px] uppercase tracking-[.18em] text-white/20">Control center</div></div></a>
      <div className="px-4 pb-3 pt-4"><a href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 px-1 text-[9px] text-white/26 hover:text-white/65"><ChevronLeft className="h-3 w-3" /> All servers</a><ServerSwitcher guild={guild} guildId={guildId} active={active} /></div>
      <div className="mx-4 h-px bg-white/[.045]" />
      <div className="flex-1 overflow-y-auto px-4 pb-5 pt-4 [scrollbar-color:#2b2d2e_transparent] [scrollbar-width:thin]">
        <NavSection title="Core"><NavItem icon={Home} active={active === "home"} href={`/dashboard/${guildId}/`} description="Live server snapshot">Overview</NavItem><NavItem icon={Settings2} active={active === "settings"} href={`/dashboard/${guildId}/settings`} description="Server configuration">Settings</NavItem></NavSection>
        <NavSection title="Protection"><NavItem icon={ShieldCheck} active={active === "security"} href={`/dashboard/${guildId}/security`} description="Defense & AutoMod">Security Center</NavItem><NavItem icon={LockKeyhole} active={active === "joinGate"} href={`/dashboard/${guildId}/join-gate`} description="Member entry rules">Join Gate</NavItem><NavItem icon={UsersRound} active={active === "permissions"} href={`/dashboard/${guildId}/permissions`} description="Staff access">Permissions</NavItem></NavSection>
        <NavSection title="Content"><NavItem icon={Sparkles} active={active === "embeds"} href={`/dashboard/${guildId}/embeds`} description="Discord messages">Embed Builder</NavItem><NavItem icon={MessageSquareText} active={active === "messages"} href={`/dashboard/${guildId}/messages`} description="Welcome & leave">Messages</NavItem><NavItem icon={FileText} active={active === "customCommands"} href={`/dashboard/${guildId}/custom-commands`} description="Custom responses">Custom Commands</NavItem></NavSection>
        <NavSection title="Tickets"><NavItem icon={PanelsTopLeft} active={active === "panels"} href={`/dashboard/${guildId}/panels`} description="Saved configurations">Panels</NavItem><NavItem icon={LayoutPanelTop} active={active === "designer"} href={`/dashboard/${guildId}/tickets`} description="Create & publish">Ticket Designer</NavItem><NavItem icon={Ticket} active={active === "history"} href={`/dashboard/${guildId}/history`} description="Transcripts & closes">Ticket History</NavItem></NavSection>
        <NavSection title="Tools"><NavItem icon={Radio} active={active === "voicemaster"} href={`/dashboard/${guildId}/voicemaster`} description="Temporary voice">VoiceMaster</NavItem><NavItem icon={WandSparkles} active={active === "automations"} href={`/dashboard/${guildId}/automations`} description="Rules & workflows">Automations</NavItem><NavItem icon={ScrollText} active={active === "logging"} href={`/dashboard/${guildId}/logging`} description="Server event logs">Logging</NavItem></NavSection>
        <NavSection title="Integrations"><NavItem icon={Webhook} active={active === "webhooks"} href={`/dashboard/${guildId}/webhooks`}>Webhooks</NavItem><NavItem icon={CircleDot} active={active === "lastfm"} href={`/dashboard/${guildId}/lastfm`}>Last.fm</NavItem><NavItem icon={Bot} active={active === "discordApps"} href={`/dashboard/${guildId}/discord-apps`}>Discord Apps</NavItem></NavSection>
      </div>
      <div className="border-t border-white/[.05] p-4"><div className="flex items-center justify-between rounded-[15px] border border-white/[.055] bg-white/[.022] px-3 py-3"><div className="flex items-center gap-2.5"><span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400/20" /><span className="relative h-2 w-2 rounded-full bg-emerald-400" /></span><div><div className="text-[9px] text-white/65">Ware online</div><div className="mt-0.5 text-[8px] text-white/22">Live server connection</div></div></div><Activity className="h-3.5 w-3.5 text-white/20" /></div></div>
    </aside>
    <div className="lg:pl-[280px]">
      <header className="sticky top-0 z-30 border-b border-white/[.05] bg-[#070808]/82 backdrop-blur-2xl"><div className="flex min-h-[76px] items-center justify-between gap-4 px-4 py-3 md:px-8 xl:px-10"><div className="min-w-0"><div className="flex items-center gap-2 text-[9px] text-white/24"><GuildAvatar guild={guild} size="sm" /><span className="max-w-[170px] truncate">{guild.name}</span><span className="text-white/10">/</span><span>{activeLabel}</span></div><div className="mt-1.5"><h2 className="truncate text-[18px] font-semibold text-white/92">{activeLabel}</h2><p className="mt-0.5 hidden max-w-2xl truncate text-[9px] text-white/25 md:block">{activeDescription}</p></div></div><div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-full border border-white/[.06] bg-white/[.02] px-3 py-1.5 text-[9px] text-white/38 md:flex"><Activity className="h-3 w-3 text-emerald-400" /> Live</div><a href="https://discord.gg/warebot" className="rounded-full border border-white/[.07] bg-white/[.03] px-3.5 py-1.5 text-[10px] text-white/65 transition hover:border-white/[.12] hover:bg-white/[.06]">Support</a></div></div><div className="flex gap-1 overflow-x-auto border-t border-white/[.03] px-3 py-2 lg:hidden">{[["Overview", `/dashboard/${guildId}/`, active === "home"],["Security", `/dashboard/${guildId}/security`, active === "security"],["Embeds", `/dashboard/${guildId}/embeds`, active === "embeds"],["Tickets", `/dashboard/${guildId}/tickets`, active === "designer"],["Settings", `/dashboard/${guildId}/settings`, active === "settings"]].map(([label, href, isActive]) => <a key={String(label)} href={String(href)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] ${isActive ? "bg-white/[.09] text-white" : "text-white/35"}`}>{String(label)}</a>)}</div></header>
      <main className="relative animate-[ware-page-in_.28s_ease-out] px-4 py-6 md:px-8 md:py-8 xl:px-10">{children}</main>
    </div>
  </div>;
}
