import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowUpRight,
  Check,
  CircleDot,
  Hash,
  LayoutPanelTop,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  Ticket,
  UsersRound,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTicketPanel } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/$guildId/")({
  head: () => ({ meta: [{ title: "Overview — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["ticketPanel", params.guildId],
      queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: GuildDashboardHome,
});

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  good,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: typeof Hash;
  good?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[15px] border border-white/[0.06] bg-[#111313] p-4 shadow-[0_18px_55px_rgba(0,0,0,0.15)] transition-colors hover:border-white/[0.095]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-white/34">{label}</div>
          <div className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-white/93">
            {value}
          </div>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/[0.065] bg-white/[0.025]">
          <Icon className="h-3.5 w-3.5 text-[#a9bdc8]" strokeWidth={1.8} />
        </div>
      </div>
      <div className={`mt-2.5 text-[9px] ${good ? "text-emerald-400/75" : "text-white/25"}`}>
        {detail}
      </div>
      <div className="pointer-events-none absolute -bottom-6 -right-5 h-20 w-20 rounded-full bg-[#9cb8c6]/[0.025] blur-2xl transition-colors group-hover:bg-[#9cb8c6]/[0.05]" />
    </div>
  );
}

function HealthRow({ label, ok, optional }: { label: string; ok: boolean; optional?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.045] py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
            ok
              ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300"
              : "border-white/[0.065] bg-white/[0.02] text-white/22"
          }`}
        >
          {ok ? <Check className="h-3 w-3" strokeWidth={2.1} /> : <CircleDot className="h-2.5 w-2.5" />}
        </span>
        <span className="truncate text-[11px] text-white/58">{label}</span>
      </div>
      <span className={`text-[9px] font-medium ${ok ? "text-emerald-300/70" : "text-white/23"}`}>
        {ok ? "Ready" : optional ? "Optional" : "Needs setup"}
      </span>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: typeof PanelsTopLeft;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.055] bg-white/[0.018] p-3.5 transition-all hover:border-white/[0.095] hover:bg-white/[0.035]"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#171a1b] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]">
        <Icon className="h-4 w-4 text-[#aec1cb]" strokeWidth={1.7} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-medium text-white/78">{title}</div>
        <div className="mt-1 truncate text-[9px] text-white/25">{description}</div>
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-white/18 transition-colors group-hover:text-white/55" />
    </a>
  );
}

function GuildDashboardHome() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });

  const panel = data.panel as Record<string, unknown> | null;
  const supportRoles = Array.isArray(panel?.support_role_ids) ? panel.support_role_ids.length : 0;
  const optionCount = data.options.length;
  const roleCount = data.roles.length;
  const channelCount = data.textChannels.length;
  const categoryCount = data.categories.length;

  const configuredChecks = [
    data.botInGuild,
    Boolean(panel),
    Boolean(panel?.channel_id),
    supportRoles > 0,
    Boolean(panel?.log_channel_id),
  ];
  const healthScore = Math.round((configuredChecks.filter(Boolean).length / configuredChecks.length) * 100);

  const footprintData = [
    { name: "Channels", value: channelCount },
    { name: "Roles", value: roleCount },
    { name: "Categories", value: categoryCount },
    { name: "Options", value: optionCount },
    { name: "Support", value: supportRoles },
  ];

  const totalResources = channelCount + roleCount + categoryCount + optionCount + supportRoles;

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="home">
      <div className="mx-auto max-w-[1420px]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] text-white/28">
              <Sparkles className="h-3 w-3 text-[#9db6c3]" />
              Server intelligence
            </div>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.035em] text-white/95 md:text-[28px]">
              Hello, welcome back.
            </h1>
            <p className="mt-1 text-[10px] text-white/27">
              Here&apos;s a live overview of <span className="font-medium text-white/48">{data.guild.name}</span> and its Ware configuration.
            </p>
          </div>

          <div className="flex items-center rounded-[9px] border border-white/[0.055] bg-[#101212] p-1 text-[9px] text-white/28">
            <span className="rounded-md px-2.5 py-1">Live</span>
            <span className="rounded-md bg-white/[0.065] px-2.5 py-1 font-medium text-white/62">Overview</span>
          </div>
        </div>

        {!data.botInGuild ? (
          <div className="mb-5 rounded-[14px] border border-amber-400/15 bg-amber-400/[0.045] px-4 py-3 text-[10px] text-amber-200/70">
            Ware is not currently connected to this Discord server. Invite the bot before changing server configuration.
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[17px] border border-white/[0.06] bg-[#101212] shadow-[0_28px_90px_rgba(0,0,0,0.18)]">
          <div className="flex flex-wrap items-start justify-between gap-4 px-5 pb-1 pt-5 md:px-6">
            <div>
              <div className="text-[9px] font-medium text-white/30">Configuration Footprint</div>
              <div className="mt-1.5 text-[28px] font-semibold tracking-[-0.045em] text-white/92">
                {formatNumber(totalResources)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[9px] text-emerald-300/65">
                <Activity className="h-3 w-3" />
                {healthScore}% configuration health
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1 text-[9px] text-white/27">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#a8c0cb]" />
                Server resources
              </span>
            </div>
          </div>

          <div className="h-[285px] w-full px-2 pb-3 pt-1 md:px-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={footprintData} margin={{ top: 24, right: 18, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="wareFootprint" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9eb8c5" stopOpacity={0.16} />
                    <stop offset="100%" stopColor="#9eb8c5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.045)" strokeDasharray="2 5" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 9 }}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.20)", fontSize: 8 }}
                  width={42}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.10)", strokeDasharray: "3 3" }}
                  contentStyle={{
                    background: "#171919",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    boxShadow: "0 14px 40px rgba(0,0,0,.35)",
                    fontSize: 10,
                    color: "rgba(255,255,255,.8)",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,.42)", marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#a6bec9"
                  strokeWidth={1.7}
                  fill="url(#wareFootprint)"
                  activeDot={{ r: 4, fill: "#bed0d8", stroke: "#101212", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Text Channels"
            value={formatNumber(channelCount)}
            detail={`${categoryCount} categories available`}
            icon={Hash}
            good={channelCount > 0}
          />
          <StatCard
            label="Server Roles"
            value={formatNumber(roleCount)}
            detail={`${supportRoles} assigned to ticket support`}
            icon={UsersRound}
            good={roleCount > 0}
          />
          <StatCard
            label="Ticket Options"
            value={formatNumber(optionCount)}
            detail={panel ? "Panel configuration detected" : "Create your first panel"}
            icon={Ticket}
            good={Boolean(panel)}
          />
          <StatCard
            label="System Health"
            value={`${healthScore}%`}
            detail={healthScore === 100 ? "All recommended items configured" : "Finish optional configuration"}
            icon={ShieldCheck}
            good={healthScore >= 80}
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_.75fr]">
          <section className="overflow-hidden rounded-[16px] border border-white/[0.06] bg-[#101212]">
            <div className="flex items-center justify-between border-b border-white/[0.05] px-5 py-4">
              <div>
                <h2 className="text-[12px] font-semibold text-white/78">Resource Inventory</h2>
                <p className="mt-1 text-[9px] text-white/23">Live Discord resources Ware can currently see.</p>
              </div>
              <span className="rounded-md border border-white/[0.055] px-2 py-1 text-[8px] uppercase tracking-[0.14em] text-white/25">
                Live
              </span>
            </div>

            <div className="overflow-x-auto px-3 pb-3 pt-2">
              <table className="w-full min-w-[620px] border-separate border-spacing-y-1.5 text-left">
                <thead>
                  <tr className="text-[8px] uppercase tracking-[0.12em] text-white/22">
                    <th className="px-3 py-1 font-medium">Resource</th>
                    <th className="px-3 py-1 font-medium">Count</th>
                    <th className="px-3 py-1 font-medium">Status</th>
                    <th className="px-3 py-1 font-medium">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Text channels", channelCount, channelCount > 0, Math.min(100, channelCount * 5)],
                    ["Manageable roles", roleCount, roleCount > 0, Math.min(100, roleCount * 4)],
                    ["Channel categories", categoryCount, categoryCount > 0, Math.min(100, categoryCount * 12)],
                    ["Ticket support roles", supportRoles, supportRoles > 0, Math.min(100, supportRoles * 30)],
                    ["Ticket panel options", optionCount, optionCount > 0, Math.min(100, optionCount * 20)],
                  ].map(([name, count, ok, coverage]) => (
                    <tr key={String(name)} className="bg-white/[0.024] text-[10px] text-white/48">
                      <td className="rounded-l-[9px] px-3 py-3 font-medium text-white/65">{String(name)}</td>
                      <td className="px-3 py-3">{formatNumber(Number(count))}</td>
                      <td className="px-3 py-3">
                        <span className={ok ? "text-emerald-300/65" : "text-white/22"}>{ok ? "Detected" : "Not set"}</span>
                      </td>
                      <td className="rounded-r-[9px] px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.05]">
                            <div
                              className="h-full rounded-full bg-[#a4bcc7]/60"
                              style={{ width: `${Math.max(5, Number(coverage))}%` }}
                            />
                          </div>
                          <span className="text-[8px] text-white/24">{Number(coverage)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-[16px] border border-white/[0.06] bg-[#101212] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[12px] font-semibold text-white/78">Configuration Health</h2>
                  <p className="mt-1 text-[9px] text-white/23">Recommended setup checks.</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.055] text-[9px] font-semibold text-[#b0c4cd]">
                  {healthScore}
                </div>
              </div>

              <div className="mt-3">
                <HealthRow label="Ware connected" ok={data.botInGuild} />
                <HealthRow label="Ticket panel saved" ok={Boolean(panel)} />
                <HealthRow label="Panel channel selected" ok={Boolean(panel?.channel_id)} />
                <HealthRow label="Support role assigned" ok={supportRoles > 0} optional />
                <HealthRow label="Log channel selected" ok={Boolean(panel?.log_channel_id)} optional />
              </div>
            </section>

            <section className="rounded-[16px] border border-white/[0.06] bg-[#101212] p-4">
              <h2 className="text-[12px] font-semibold text-white/78">Quick Actions</h2>
              <p className="mt-1 text-[9px] text-white/23">Jump straight into the tools you use most.</p>
              <div className="mt-3 space-y-2">
                <QuickAction
                  title="Open Panel Designer"
                  description="Build and publish ticket panels"
                  href={`/dashboard/${guildId}/tickets`}
                  icon={LayoutPanelTop}
                />
                <QuickAction
                  title="Manage Panels"
                  description="Review saved panel configuration"
                  href={`/dashboard/${guildId}/panels`}
                  icon={PanelsTopLeft}
                />
                <QuickAction
                  title="Security Center"
                  description="Manage Ware server protections"
                  href={`/dashboard/${guildId}/security`}
                  icon={ShieldCheck}
                />
              </div>
            </section>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[13px] border border-white/[0.05] bg-white/[0.012] px-4 py-3 text-[9px] text-white/21">
          <span>Ware dashboard • data shown here is based on the server resources currently available to Ware.</span>
          <Link
            to="/dashboard/$guildId/tickets"
            params={{ guildId }}
            className="inline-flex items-center gap-1.5 text-white/42 transition-colors hover:text-white/75"
          >
            Configure tickets
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
