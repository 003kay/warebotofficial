import {
  Activity, BadgeCheck, ChevronDown, ChevronLeft, FileText, Headphones, Home,
  LifeBuoy, LockKeyhole, MessageSquareText, PanelsTopLeft, Radio, ScrollText,
  Settings2, ShieldCheck, Sparkles, UsersRound, WandSparkles, Webhook,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getManagedGuildsFn } from "@/lib/dashboard.functions";
import { SUPPORT_URL } from "@/lib/links";
import "@/dashboard-extra.css";

type GuildInfo = { id: string; name: string; iconUrl: string | null };
type DashboardShellProps = { guild: GuildInfo; guildId: string; active: string; children: ReactNode };
type NavItemProps = { active?: boolean; icon?: typeof Home; customIcon?: ReactNode; children: ReactNode; href: string };

const ACTIVE_LABELS: Record<string, string> = {
  home: "Overview", settings: "Settings", security: "Antinuke", joinGate: "Join Gate", verification: "Verification", permissions: "Permissions",
  embeds: "Embed Builder", panels: "Ticket Panels", designer: "Ticket Designer", messages: "Messages",
  voicemaster: "VoiceMaster", customCommands: "Custom Commands", automations: "Automations", logging: "Logging", webhooks: "Webhooks", lastfm: "Last.fm",
};

function GuildAvatar({ guild, size = "lg" }: { guild: GuildInfo; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-11 w-11 rounded-[14px]" : "h-8 w-8 rounded-[10px]";
  return guild.iconUrl
    ? <img src={guild.iconUrl} alt="" className={`${cls} object-cover ring-1 ring-white/[.09]`} />
    : <div className={`${cls} grid place-items-center bg-[#5362aa]/12 text-[10px] font-bold text-[#bac3f8]/70 ring-1 ring-[#6677ca]/14`}>{guild.name.slice(0, 2).toUpperCase()}</div>;
}

function LastFmMark({ active }: { active: boolean }) {
  return <span className={`text-[13px] font-black italic tracking-[-.08em] transition ${active ? "text-[#ff5a64]" : "text-[#d54a52]/65 group-hover:text-[#ff5a64]"}`}>fm</span>;
}

function NavItem({ active, icon: Icon, customIcon, children, href }: NavItemProps) {
  const navigate = useNavigate();
  return <button type="button" onClick={() => navigate({ to: href as never })} className={`group flex min-h-[44px] w-full items-center gap-3 rounded-[13px] border px-3.5 text-left transition-all duration-200 ${active ? "border-[#6678d2]/18 bg-[linear-gradient(90deg,rgba(67,80,145,.28),rgba(24,39,46,.22))] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.018)]" : "border-transparent text-white/46 hover:translate-x-0.5 hover:border-white/[.055] hover:bg-white/[.04] hover:text-white/86"}`}>
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[9px] transition ${active ? "bg-[#6677cc]/12" : "group-hover:bg-white/[.035]"}`}>{customIcon ?? (Icon ? <Icon className={`h-[16px] w-[16px] ${active ? "text-[#a7b5f0]" : "text-white/31 group-hover:text-white/66"}`} strokeWidth={1.9} /> : null)}</span>
    <span className="min-w-0 flex-1 truncate text-[12px] font-bold tracking-[-.012em]">{children}</span>
  </button>;
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-5"><div className="mb-2 px-3.5 text-[9px] font-bold uppercase tracking-[.16em] text-[#7e8cbd]/46">{title}</div><div className="space-y-1">{children}</div></section>;
}

function destinationFor(active: string, guildId: string) {
  const suffix: Record<string, string> = { home: "", settings: "settings", security: "security", joinGate: "join-gate", verification: "verification", permissions: "permissions", embeds: "embeds", panels: "panels", designer: "tickets", messages: "messages", voicemaster: "voicemaster", customCommands: "custom-commands", automations: "automations", logging: "logging", webhooks: "webhooks", lastfm: "lastfm" };
  return `/dashboard/${guildId}/${suffix[active] ?? ""}`;
}

function ServerSwitcher({ guild, guildId, active }: { guild: GuildInfo; guildId: string; active: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const { data } = useQuery({ queryKey: ["managedGuilds"], queryFn: () => getManagedGuildsFn(), staleTime: 15_000 });

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (root.current && !root.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const guilds = data?.authenticated ? data.guilds : [];
  return <div ref={root} className="relative">
    <button type="button" onClick={() => setOpen((value) => !value)} className={`flex w-full items-center gap-3 rounded-[16px] border px-3 py-3 text-left transition ${open ? "border-[#7182dd]/22 bg-[#5363af]/12" : "border-white/[.06] bg-white/[.02] hover:border-[#7182dd]/16 hover:bg-[#5363af]/8"}`}>
      <GuildAvatar guild={guild} />
      <div className="min-w-0 flex-1"><div className="truncate text-[12px] font-bold text-white/90">{guild.name}</div><div className="mt-0.5 text-[8px] font-semibold uppercase tracking-[.12em] text-white/23">Server workspace</div></div>
      <ChevronDown className={`h-4 w-4 text-white/30 transition ${open ? "rotate-180" : ""}`} />
    </button>
    {open ? <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[90] rounded-[16px] border border-[#6677c8]/14 bg-[#090b10]/[.99] p-2 shadow-[0_26px_90px_rgba(0,0,0,.72)]">
      <div className="max-h-[260px] space-y-1 overflow-y-auto">{guilds.map((entry) => <button key={entry.id} type="button" onClick={() => { setOpen(false); navigate({ to: destinationFor(active, entry.id) as never }); }} className={`flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2.5 text-left transition ${entry.id === guildId ? "bg-[#5363af]/14" : "hover:bg-white/[.035]"}`}><GuildAvatar guild={{ id: entry.id, name: entry.name, iconUrl: entry.iconUrl }} size="sm" /><div className="min-w-0 flex-1"><div className="truncate text-[10px] font-bold text-white/68">{entry.name}</div><div className="text-[8px] text-white/22">{entry.owner ? "Owner" : "Manager"}</div></div>{entry.id === guildId ? <span className="h-1.5 w-1.5 rounded-full bg-[#6fd3be]" /> : null}</button>)}</div>
      <button type="button" onClick={() => navigate({ to: "/dashboard" as never })} className="mt-2 flex w-full items-center justify-center border-t border-white/[.045] pt-2.5 text-[9px] font-semibold text-white/34 hover:text-white/68">View all servers</button>
    </div> : null}
  </div>;
}

export function DashboardShell({ guild, guildId, active, children }: DashboardShellProps) {
  const navigate = useNavigate();
  const activeLabel = ACTIVE_LABELS[active] || "Dashboard";
  useEffect(() => { document.title = activeLabel; }, [activeLabel]);

  return <div className="min-h-screen bg-[#05070a] text-[#f4f6f7] selection:bg-[#6677cc]/25">
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_68%_-12%,rgba(73,88,160,.12),transparent_31%),radial-gradient(circle_at_95%_35%,rgba(31,93,93,.055),transparent_23%)]" />
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-white/[.05] bg-[linear-gradient(180deg,#090b10,#07090c)] lg:flex lg:flex-col">
      <div className="flex h-[66px] items-center gap-2.5 border-b border-white/[.045] px-4">
        <button type="button" onClick={() => navigate({ to: "/dashboard" as never })} className="flex items-center gap-2.5 text-left"><div className="grid h-9 w-9 place-items-center overflow-hidden rounded-[11px] border border-[#6677ca]/14 bg-black"><img src="/ware-logo.svg?v=4" alt="Ware" className="h-full w-full object-contain p-1" /></div><div><div className="text-[14px] font-bold tracking-[-.025em] text-white/94">Ware</div><div className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8898d7]/38">Dashboard</div></div></button>
        <span className="ml-auto rounded-full border border-[#4dc7a4]/14 bg-[#2f9d80]/8 px-2 py-1 text-[7px] font-bold text-[#81dbc4]/65">LIVE</span>
      </div>
      <div className="px-3.5 pb-3 pt-3"><button type="button" onClick={() => navigate({ to: "/dashboard" as never })} className="mb-2.5 inline-flex items-center gap-1 px-1 text-[9px] font-semibold text-white/28 hover:text-white/68"><ChevronLeft className="h-3 w-3" />All servers</button><ServerSwitcher guild={guild} guildId={guildId} active={active} /></div>
      <nav className="flex-1 overflow-y-auto px-3 pb-5 pt-3 [scrollbar-color:#242a34_transparent] [scrollbar-width:thin]">
        <NavSection title="Server"><NavItem icon={Home} active={active === "home"} href={`/dashboard/${guildId}/`}>Overview</NavItem><NavItem icon={Settings2} active={active === "settings"} href={`/dashboard/${guildId}/settings`}>Settings</NavItem></NavSection>
        <NavSection title="Security"><NavItem icon={ShieldCheck} active={active === "security"} href={`/dashboard/${guildId}/security`}>Antinuke</NavItem><NavItem icon={LockKeyhole} active={active === "joinGate"} href={`/dashboard/${guildId}/join-gate`}>Join Gate</NavItem><NavItem icon={BadgeCheck} active={active === "verification"} href={`/dashboard/${guildId}/verification`}>Verification</NavItem><NavItem icon={UsersRound} active={active === "permissions"} href={`/dashboard/${guildId}/permissions`}>Permissions</NavItem></NavSection>
        <NavSection title="Configuration"><NavItem icon={Sparkles} active={active === "embeds"} href={`/dashboard/${guildId}/embeds`}>Embed Builder</NavItem><NavItem icon={MessageSquareText} active={active === "messages"} href={`/dashboard/${guildId}/messages`}>Messages</NavItem><NavItem icon={Radio} active={active === "voicemaster"} href={`/dashboard/${guildId}/voicemaster`}>VoiceMaster</NavItem><NavItem icon={FileText} active={active === "customCommands"} href={`/dashboard/${guildId}/custom-commands`}>Custom Commands</NavItem><NavItem icon={PanelsTopLeft} active={active === "panels"} href={`/dashboard/${guildId}/panels`}>Ticket Panels</NavItem><NavItem icon={WandSparkles} active={active === "designer"} href={`/dashboard/${guildId}/tickets`}>Ticket Designer</NavItem><NavItem icon={ScrollText} active={active === "logging"} href={`/dashboard/${guildId}/logging`}>Logging</NavItem></NavSection>
        <NavSection title="Integrations"><NavItem icon={Webhook} active={active === "webhooks"} href={`/dashboard/${guildId}/webhooks`}>Webhooks</NavItem><NavItem active={active === "lastfm"} href={`/dashboard/${guildId}/lastfm`} customIcon={<LastFmMark active={active === "lastfm"} />}>Last.fm</NavItem></NavSection>
      </nav>
      <div className="border-t border-white/[.045] p-3"><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-[14px] border border-[#6677ca]/10 bg-[linear-gradient(90deg,rgba(63,75,130,.13),rgba(25,52,55,.10))] px-3 py-3 transition hover:border-[#7183dd]/20"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#5363af]/12"><LifeBuoy className="h-4 w-4 text-[#a7b3ef]/60" /></span><div className="min-w-0 flex-1"><div className="text-[10px] font-bold text-white/68">Support center</div><div className="mt-0.5 text-[8px] text-white/24">discord.gg/warebot</div></div><Activity className="h-3.5 w-3.5 text-[#5bc8aa]/70" /></a></div>
    </aside>
    <div className="lg:pl-[264px]"><header className="sticky top-0 z-30 border-b border-white/[.045] bg-[#07090d]/90 backdrop-blur-2xl"><div className="flex min-h-[66px] items-center justify-between gap-4 px-4 md:px-7 xl:px-9"><div className="flex items-center gap-3"><GuildAvatar guild={guild} size="sm" /><div><div className="text-[9px] font-semibold text-white/25">{guild.name}</div><h2 className="mt-0.5 text-[16px] font-bold tracking-[-.025em] text-white/90">{activeLabel}</h2></div></div><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-full border border-[#6677ca]/10 bg-[#5363af]/7 px-3 py-2 text-[9px] font-bold text-[#c0c8f7]/52 hover:bg-[#5363af]/13 md:inline-flex"><Headphones className="h-3 w-3" />Support</a></div></header><main className="relative px-4 py-5 md:px-7 md:py-7 xl:px-9">{children}</main></div>
  </div>;
}
