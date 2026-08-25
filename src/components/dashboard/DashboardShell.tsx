import {
  Activity,
  BarChart3,
  Bot,
  ChevronDown,
  ChevronLeft,
  CircleDot,
  FileText,
  Gauge,
  Home,
  LayoutPanelTop,
  LockKeyhole,
  MessageSquareText,
  PanelsTopLeft,
  Radio,
  ScrollText,
  Settings2,
  ShieldCheck,
  Sparkles,
  Ticket,
  UsersRound,
  WandSparkles,
  Webhook,
} from "lucide-react";
import type { ReactNode } from "react";

type GuildInfo = {
  id: string;
  name: string;
  iconUrl: string | null;
};

type DashboardShellProps = {
  guild: GuildInfo;
  guildId: string;
  active: "home" | "panels" | "designer" | "security";
  children: ReactNode;
};

type NavItemProps = {
  active?: boolean;
  icon: typeof Home;
  children: ReactNode;
  href?: string;
  disabled?: boolean;
  badge?: string;
};

function NavItem({
  active,
  icon: Icon,
  children,
  href,
  disabled,
  badge,
}: NavItemProps) {
  const className = `group flex items-center justify-between rounded-[10px] px-3 py-2.5 text-[13px] transition-all ${
    active
      ? "bg-[#171a1b] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
      : disabled
        ? "cursor-not-allowed text-white/25"
        : "text-white/48 hover:bg-white/[0.035] hover:text-white/85"
  }`;

  const body = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <Icon
          className={`h-[15px] w-[15px] shrink-0 ${
            active ? "text-[#a7bdc8]" : "text-white/35 group-hover:text-white/65"
          }`}
          strokeWidth={1.8}
        />
        <span className="truncate">{children}</span>
      </span>
      {badge ? (
        <span className="rounded-md border border-white/[0.07] bg-white/[0.025] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] text-white/28">
          {badge}
        </span>
      ) : null}
    </>
  );

  if (disabled || !href) {
    return <div className={className}>{body}</div>;
  }

  return (
    <a href={href} className={className}>
      {body}
    </a>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="mb-1.5 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}

function GuildAvatar({ guild, size = "lg" }: { guild: GuildInfo; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "h-10 w-10 rounded-[11px]" : "h-7 w-7 rounded-lg";

  if (guild.iconUrl) {
    return <img src={guild.iconUrl} alt="" className={`${sizeClass} object-cover`} />;
  }

  return (
    <div
      className={`${sizeClass} grid place-items-center bg-gradient-to-br from-[#b7c7d1] to-[#768690] text-[11px] font-bold text-[#071014]`}
    >
      {guild.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function DashboardShell({
  guild,
  guildId,
  active,
  children,
}: DashboardShellProps) {
  const activeLabel =
    active === "home"
      ? "Overview"
      : active === "panels"
        ? "Panels"
        : active === "designer"
          ? "Panel Designer"
          : "Security";

  return (
    <div className="min-h-screen bg-[#080909] text-[#f4f6f7] selection:bg-[#9eb7c5]/25">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-white/[0.065] bg-[#090a0a] lg:flex lg:flex-col">
        <div className="flex h-[62px] items-center gap-3 border-b border-white/[0.055] px-4">
          <div className="grid h-8 w-8 place-items-center rounded-[9px] bg-white/[0.045] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
            <Sparkles className="h-4 w-4 text-[#bfd0da]" strokeWidth={1.8} />
          </div>
          <div className="leading-none">
            <div className="text-[13px] font-semibold tracking-[-0.01em]">ware</div>
            <div className="mt-1.5 text-[9px] uppercase tracking-[0.19em] text-white/25">
              control center
            </div>
          </div>
        </div>

        <div className="px-3 pb-2 pt-3">
          <a
            href="/dashboard"
            className="mb-3 inline-flex items-center gap-1.5 px-2 text-[10px] text-white/30 transition-colors hover:text-white/70"
          >
            <ChevronLeft className="h-3 w-3" />
            All servers
          </a>

          <button className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.065] bg-[#111313] p-2.5 text-left transition-colors hover:bg-[#141616]">
            <GuildAvatar guild={guild} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-white/92">{guild.name}</div>
              <div className="mt-1 text-[9px] text-white/27">Server dashboard</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-white/22" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-5 pt-3 [scrollbar-color:#2a2d2d_transparent] [scrollbar-width:thin]">
          <NavSection title="Server">
            <NavItem icon={Home} active={active === "home"} href={`/dashboard/${guildId}/`}>
              Overview
            </NavItem>
            <NavItem icon={Settings2} disabled badge="soon">
              Settings
            </NavItem>
            <NavItem icon={BarChart3} disabled badge="soon">
              Leaderboard
            </NavItem>
          </NavSection>

          <NavSection title="Security">
            <NavItem icon={ShieldCheck} active={active === "security"} href={`/dashboard/${guildId}/security`}>
              Security Center
            </NavItem>
            <NavItem icon={LockKeyhole} disabled badge="soon">
              Join Gate
            </NavItem>
            <NavItem icon={UsersRound} disabled badge="soon">
              Permissions
            </NavItem>
          </NavSection>

          <NavSection title="Ticketing">
            <NavItem icon={PanelsTopLeft} active={active === "panels"} href={`/dashboard/${guildId}/panels`}>
              Panels
            </NavItem>
            <NavItem icon={LayoutPanelTop} active={active === "designer"} href={`/dashboard/${guildId}/tickets`}>
              Panel Designer
            </NavItem>
            <NavItem icon={Ticket} disabled badge="soon">
              Ticket History
            </NavItem>
          </NavSection>

          <NavSection title="Configuration">
            <NavItem icon={MessageSquareText} disabled badge="soon">
              Messages
            </NavItem>
            <NavItem icon={Radio} disabled badge="soon">
              VoiceMaster
            </NavItem>
            <NavItem icon={FileText} disabled badge="soon">
              Custom Commands
            </NavItem>
            <NavItem icon={WandSparkles} disabled badge="soon">
              Automations
            </NavItem>
            <NavItem icon={ScrollText} disabled badge="soon">
              Logging
            </NavItem>
          </NavSection>

          <NavSection title="Integrations">
            <NavItem icon={Webhook} disabled badge="soon">
              Webhooks
            </NavItem>
            <NavItem icon={CircleDot} disabled badge="soon">
              Last.fm
            </NavItem>
            <NavItem icon={Bot} disabled badge="soon">
              Discord Apps
            </NavItem>
          </NavSection>
        </div>

        <div className="border-t border-white/[0.055] p-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-[#0e1110] px-3 py-2.5 shadow-[inset_0_0_0_1px_rgba(90,190,130,0.08)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/30" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <div>
              <div className="text-[10px] font-medium text-emerald-300/85">Systems operational</div>
              <div className="mt-0.5 text-[9px] text-white/22">Ware is connected</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.055] bg-[#080909]/92 backdrop-blur-2xl">
          <div className="flex h-[62px] items-center justify-between gap-4 px-4 md:px-7">
            <div className="flex min-w-0 items-center gap-2 text-[11px]">
              <span className="hidden text-white/25 sm:inline">Server</span>
              <span className="hidden text-white/13 sm:inline">/</span>
              <span className="flex min-w-0 items-center gap-2 text-white/42">
                <GuildAvatar guild={guild} size="sm" />
                <span className="max-w-[160px] truncate">{guild.name}</span>
              </span>
              <span className="text-white/13">/</span>
              <span className="font-medium text-white/88">{activeLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-white/[0.055] bg-white/[0.018] px-2.5 py-1.5 text-[9px] text-white/34 md:flex">
                <Activity className="h-3 w-3 text-emerald-400" />
                Live
              </div>
              <a
                href="https://discord.gg/warebot"
                className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] font-medium text-white/62 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                Support
              </a>
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto border-t border-white/[0.035] px-3 py-2 lg:hidden">
            {[
              ["Overview", `/dashboard/${guildId}/`, active === "home"],
              ["Panels", `/dashboard/${guildId}/panels`, active === "panels"],
              ["Designer", `/dashboard/${guildId}/tickets`, active === "designer"],
              ["Security", `/dashboard/${guildId}/security`, active === "security"],
            ].map(([label, href, isActive]) => (
              <a
                key={String(label)}
                href={String(href)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[10px] ${
                  isActive ? "bg-white/[0.08] text-white" : "text-white/35"
                }`}
              >
                {String(label)}
              </a>
            ))}
          </div>
        </header>

        <main className="px-4 py-5 md:px-7 md:py-7">{children}</main>
      </div>
    </div>
  );
}
