import {
  Activity,
  BarChart3,
  Bot,
  ChevronDown,
  ChevronLeft,
  CircleDot,
  FileText,
  Home,
  LayoutPanelTop,
  LockKeyhole,
  MessageSquareText,
  PanelsTopLeft,
  Radio,
  ScrollText,
  Settings2,
  ShieldCheck,
  Ticket,
  UsersRound,
  WandSparkles,
  Webhook,
} from "lucide-react";
import type { ReactNode } from "react";

type GuildInfo = { id: string; name: string; iconUrl: string | null };
type DashboardShellProps = { guild: GuildInfo; guildId: string; active: string; children: ReactNode };
type NavItemProps = { active?: boolean; icon: typeof Home; children: ReactNode; href?: string; disabled?: boolean; badge?: string };

function NavItem({ active, icon: Icon, children, href, disabled, badge }: NavItemProps) {
  const className = `group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] transition-all duration-200 ${active ? "bg-white/[0.075] text-white shadow-[0_10px_30px_rgba(0,0,0,0.16),inset_0_0_0_1px_rgba(255,255,255,0.075)]" : disabled ? "cursor-not-allowed text-white/20" : "text-white/46 hover:bg-white/[0.04] hover:text-white/88"}`;
  const body = <><span className="flex min-w-0 items-center gap-3"><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors ${active ? "bg-white/[0.06]" : "bg-transparent group-hover:bg-white/[0.035]"}`}><Icon className={`h-[15px] w-[15px] ${active ? "text-[#d6e2e8]" : "text-white/34 group-hover:text-white/66"}`} strokeWidth={1.8} /></span><span className="truncate">{children}</span></span>{badge ? <span className="rounded-md border border-white/[0.06] bg-black/20 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.16em] text-white/24">{badge}</span> : null}{active ? <span className="absolute left-0 h-5 w-[2px] rounded-full bg-[#c3d4dc]" /> : null}</>;
  if (disabled || !href) return <div className={className}>{body}</div>;
  return <a href={href} className={className}>{body}</a>;
}

function NavSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mb-6"><div className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/22">{title}</div><div className="space-y-1">{children}</div></section>;
}

function GuildAvatar({ guild, size = "lg" }: { guild: GuildInfo; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "h-11 w-11 rounded-[13px]" : "h-7 w-7 rounded-lg";
  if (guild.iconUrl) return <img src={guild.iconUrl} alt="" className={`${sizeClass} object-cover ring-1 ring-white/[0.07]`} />;
  return <div className={`${sizeClass} grid place-items-center bg-gradient-to-br from-[#c5d2d8] to-[#68757c] text-[11px] font-bold text-[#071014] ring-1 ring-white/[0.08]`}>{guild.name.slice(0, 2).toUpperCase()}</div>;
}

const ACTIVE_LABELS: Record<string, string> = {
  home: "Overview",
  settings: "Settings",
  leaderboard: "Leaderboard",
  security: "Security Center",
  joinGate: "Join Gate",
  permissions: "Permissions",
  panels: "Panels",
  designer: "Panel Designer",
  history: "Ticket History",
  messages: "Messages",
  voicemaster: "VoiceMaster",
  customCommands: "Custom Commands",
  automations: "Automations",
  logging: "Logging",
  webhooks: "Webhooks",
  lastfm: "Last.fm",
  discordApps: "Discord Apps",
};

export function DashboardShell({ guild, guildId, active, children }: DashboardShellProps) {
  const activeLabel = ACTIVE_LABELS[active] || "Dashboard";
  return (
    <div className="min-h-screen bg-[#070808] text-[#f4f6f7] selection:bg-[#9eb7c5]/25">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_45%_-20%,rgba(147,170,182,0.08),transparent_36%)]" />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[272px] border-r border-white/[0.055] bg-[#090a0a]/98 lg:flex lg:flex-col">
        <a href="/dashboard" className="flex h-[68px] items-center gap-3 border-b border-white/[0.05] px-5 transition hover:bg-white/[0.018]">
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-white/[0.07] bg-black shadow-[0_8px_25px_rgba(0,0,0,0.28)]"><img src="/6ef1b8a8-6882-4b66-a59f-22f2bf408ca8.png" alt="Ware" className="h-full w-full object-contain p-1" /></div>
          <div className="text-[15px] font-semibold tracking-[-0.02em] text-white">Dashboard</div>
        </a>
        <div className="px-4 pb-3 pt-4">
          <a href="/dashboard" className="mb-3 inline-flex items-center gap-1.5 px-1 text-[10px] text-white/28 transition-colors hover:text-white/70"><ChevronLeft className="h-3 w-3" /> All servers</a>
          <a href={`/dashboard/${guildId}/`} className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.045] to-white/[0.02] p-3 text-left shadow-[0_14px_35px_rgba(0,0,0,0.16)] transition hover:border-white/[0.1] hover:bg-white/[0.05]"><GuildAvatar guild={guild} /><div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold text-white/92">{guild.name}</div><div className="mt-1 text-[9px] text-white/27">Manage server</div></div><ChevronDown className="h-3.5 w-3.5 text-white/22 transition-transform group-hover:translate-y-0.5" /></a>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-5 pt-3 [scrollbar-color:#2a2d2d_transparent] [scrollbar-width:thin]">
          <NavSection title="Server">
            <NavItem icon={Home} active={active === "home"} href={`/dashboard/${guildId}/`}>Overview</NavItem>
            <NavItem icon={Settings2} active={active === "settings"} href={`/dashboard/${guildId}/settings`}>Settings</NavItem>
            <NavItem icon={BarChart3} active={active === "leaderboard"} href={`/dashboard/${guildId}/leaderboard`}>Leaderboard</NavItem>
          </NavSection>
          <NavSection title="Security">
            <NavItem icon={ShieldCheck} active={active === "security"} href={`/dashboard/${guildId}/security`}>Security Center</NavItem>
            <NavItem icon={LockKeyhole} active={active === "joinGate"} href={`/dashboard/${guildId}/join-gate`}>Join Gate</NavItem>
            <NavItem icon={UsersRound} active={active === "permissions"} href={`/dashboard/${guildId}/permissions`}>Permissions</NavItem>
          </NavSection>
          <NavSection title="Ticketing">
            <NavItem icon={PanelsTopLeft} active={active === "panels"} href={`/dashboard/${guildId}/panels`}>Panels</NavItem>
            <NavItem icon={LayoutPanelTop} active={active === "designer"} href={`/dashboard/${guildId}/tickets`}>Panel Designer</NavItem>
            <NavItem icon={Ticket} active={active === "history"} href={`/dashboard/${guildId}/history`}>Ticket History</NavItem>
          </NavSection>
          <NavSection title="Configuration">
            <NavItem icon={MessageSquareText} active={active === "messages"} href={`/dashboard/${guildId}/messages`}>Messages</NavItem>
            <NavItem icon={Radio} active={active === "voicemaster"} href={`/dashboard/${guildId}/voicemaster`}>VoiceMaster</NavItem>
            <NavItem icon={FileText} active={active === "customCommands"} href={`/dashboard/${guildId}/custom-commands`}>Custom Commands</NavItem>
            <NavItem icon={WandSparkles} active={active === "automations"} href={`/dashboard/${guildId}/automations`}>Automations</NavItem>
            <NavItem icon={ScrollText} active={active === "logging"} href={`/dashboard/${guildId}/logging`}>Logging</NavItem>
          </NavSection>
          <NavSection title="Integrations">
            <NavItem icon={Webhook} active={active === "webhooks"} href={`/dashboard/${guildId}/webhooks`}>Webhooks</NavItem>
            <NavItem icon={CircleDot} active={active === "lastfm"} href={`/dashboard/${guildId}/lastfm`}>Last.fm</NavItem>
            <NavItem icon={Bot} active={active === "discordApps"} href={`/dashboard/${guildId}/discord-apps`}>Discord Apps</NavItem>
          </NavSection>
        </div>
        <div className="border-t border-white/[0.05] p-4"><div className="flex items-center gap-3 rounded-2xl border border-white/[0.055] bg-white/[0.025] px-3 py-3"><span className="relative flex h-2 w-2 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/20" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span><div className="min-w-0"><div className="text-[10px] font-medium text-white/72">Dashboard online</div><div className="mt-0.5 truncate text-[9px] text-white/24">Discord data updates live</div></div></div></div>
      </aside>
      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#080909]/88 backdrop-blur-2xl">
          <div className="flex h-[68px] items-center justify-between gap-4 px-4 md:px-8"><div className="flex min-w-0 items-center gap-2 text-[11px]"><span className="hidden text-white/23 sm:inline">Server</span><span className="hidden text-white/12 sm:inline">/</span><span className="flex min-w-0 items-center gap-2 text-white/42"><GuildAvatar guild={guild} size="sm" /><span className="max-w-[180px] truncate">{guild.name}</span></span><span className="text-white/12">/</span><span className="font-medium text-white/88">{activeLabel}</span></div><div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-full border border-white/[0.055] bg-white/[0.018] px-3 py-1.5 text-[9px] text-white/36 md:flex"><Activity className="h-3 w-3 text-emerald-400" /> Live</div><a href="https://discord.gg/warebot" className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3.5 py-1.5 text-[10px] font-medium text-white/62 transition hover:bg-white/[0.07] hover:text-white">Support</a></div></div>
          <div className="flex gap-1 overflow-x-auto border-t border-white/[0.03] px-3 py-2 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{[["Overview", `/dashboard/${guildId}/`, active === "home"],["Tickets", `/dashboard/${guildId}/tickets`, active === "designer"],["History", `/dashboard/${guildId}/history`, active === "history"],["Security", `/dashboard/${guildId}/security`, active === "security"],["Settings", `/dashboard/${guildId}/settings`, active === "settings"]].map(([label, href, isActive]) => <a key={String(label)} href={String(href)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] ${isActive ? "bg-white/[0.08] text-white" : "text-white/35"}`}>{String(label)}</a>)}</div>
        </header>
        <main className="relative px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
