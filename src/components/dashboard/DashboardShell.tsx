import {
  BarChart3,
  Bot,
  ChevronLeft,
  FileText,
  Home,
  LayoutPanelTop,
  MessageSquareText,
  PanelsTopLeft,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Ticket,
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

const futureItems = [
  { label: "Templates", icon: FileText },
  { label: "Ticket History", icon: ScrollText },
  { label: "Applications", icon: MessageSquareText },
  { label: "Custom Commands", icon: Bot },
  { label: "Statistics", icon: BarChart3 },
];

function NavItem({
  active,
  icon: Icon,
  children,
  href,
}: {
  active?: boolean;
  icon: typeof Home;
  children: ReactNode;
  href: string;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
        active
          ? "bg-white/[0.08] text-white"
          : "text-muted-foreground hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{children}</span>
    </a>
  );
}

export function DashboardShell({
  guild,
  guildId,
  active,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-[#070707] text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] border-r border-white/10 bg-[#0a0a0a] lg:flex lg:flex-col">
        <div className="flex h-[70px] items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-wide">ware</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              dashboard
            </div>
          </div>
        </div>

        <div className="p-4">
          <a
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            All servers
          </a>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
            {guild.iconUrl ? (
              <img
                src={guild.iconUrl}
                alt=""
                className="h-11 w-11 rounded-xl object-cover"
              />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 font-semibold">
                {guild.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{guild.name}</div>
              <div className="text-xs text-muted-foreground">Server settings</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-5">
          <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Main Menu
          </div>

          <nav className="space-y-1">
            <NavItem icon={Home} active={active === "home"} href={`/dashboard/${guildId}/`}>
              Home
            </NavItem>

            <NavItem icon={PanelsTopLeft} active={active === "panels"} href={`/dashboard/${guildId}/panels`}>
              Panels
            </NavItem>

            <NavItem icon={LayoutPanelTop} active={active === "designer"} href={`/dashboard/${guildId}/tickets`}>
              Panel Designer
            </NavItem>

            {futureItems.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm text-muted-foreground/55"
                title="Coming in the next ticket-system phase"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider">
                  Soon
                </span>
              </div>
            ))}

            <div className="my-3 border-t border-white/10" />

            <NavItem icon={ShieldCheck} active={active === "security"} href={`/dashboard/${guildId}/security`}>
              Security
            </NavItem>
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-3 py-2 text-xs text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Ware systems operational
          </div>
        </div>
      </aside>

      <div className="lg:pl-[280px]">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070707]/90 backdrop-blur-xl">
          <div className="flex h-[70px] items-center justify-between px-5 md:px-8">
            <div className="flex items-center gap-2 text-sm">
              <a
                href="/dashboard"
                className="text-muted-foreground hover:text-white"
              >
                Servers
              </a>
              <span className="text-muted-foreground/50">/</span>
              <span className="max-w-[180px] truncate text-muted-foreground">
                {guild.name}
              </span>
              <span className="text-muted-foreground/50">/</span>
              <span className="font-medium text-white">
                {active === "home"
                  ? "Home"
                  : active === "panels"
                    ? "Panels"
                    : active === "designer"
                      ? "Panel Designer"
                      : "Security"}
              </span>
            </div>

            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              All Systems Operational
            </div>
          </div>
        </header>

        <main className="px-5 py-7 md:px-8 md:py-9">{children}</main>
      </div>
    </div>
  );
}
