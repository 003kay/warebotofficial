import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Activity,
  Command,
  Heart,
  Hash,
  MessageSquare,
  Mic2,
  Radio,
  UserMinus,
  UserPlus,
  UsersRound,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTicketPanel } from "@/lib/dashboard.functions";
import { getGuildAnalytics } from "@/lib/analytics.functions";

export const Route = createFileRoute("/dashboard/$guildId/")({
  head: () => ({ meta: [{ title: "Overview — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["ticketPanel", params.guildId],
        queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["guildAnalytics", params.guildId],
        queryFn: () => getGuildAnalytics({ data: { guildId: params.guildId } }),
      }),
    ]);
    return null;
  },
  component: GuildDashboardHome,
});

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(value || 0)));
}

function hours(seconds: number) {
  const value = Math.max(0, Number(seconds || 0)) / 3600;
  return value >= 100 ? `${number(value)} hrs` : `${value.toFixed(value >= 10 ? 1 : 2)} hrs`;
}

function shortDate(value: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-[15px] border border-white/[0.055] bg-[#111313] p-4 shadow-[0_18px_55px_rgba(0,0,0,.14)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-medium text-white/28">{label}</div>
          <div className="mt-2 text-[24px] font-semibold tracking-[-0.04em] text-white/92">{value}</div>
        </div>
        <div className="grid h-8 w-8 place-items-center rounded-[9px] border border-white/[0.06] bg-white/[0.025]">
          <Icon className="h-3.5 w-3.5 text-[#a8bdc7]" strokeWidth={1.7} />
        </div>
      </div>
      <div className="mt-2 text-[9px] text-white/23">{detail}</div>
    </div>
  );
}

function Ranking({
  title,
  subtitle,
  rows,
  suffix,
}: {
  title: string;
  subtitle: string;
  rows: { id?: string; name: string; value: number }[];
  suffix: (value: number) => string;
}) {
  const max = Math.max(1, ...rows.map((row) => Number(row.value || 0)));
  return (
    <section className="overflow-hidden rounded-[16px] border border-white/[0.055] bg-[#101212]">
      <div className="border-b border-white/[0.05] px-5 py-4">
        <h2 className="text-[11px] font-semibold text-white/75">{title}</h2>
        <p className="mt-1 text-[9px] text-white/22">{subtitle}</p>
      </div>
      <div className="p-3">
        {rows.length ? (
          <div className="space-y-1.5">
            {rows.slice(0, 7).map((row, index) => (
              <div key={`${row.id || row.name}-${index}`} className="rounded-[10px] bg-white/[0.023] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center text-[9px] text-white/18">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-[10px] font-medium text-white/60">{row.name}</span>
                      <span className="shrink-0 text-[9px] text-white/31">{suffix(Number(row.value || 0))}</span>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                      <div className="h-full rounded-full bg-[#9db8c5]/55" style={{ width: `${Math.max(2, (Number(row.value || 0) / max) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center text-center text-[10px] text-white/20">
            No activity has been synced yet.
          </div>
        )}
      </div>
    </section>
  );
}

function GuildDashboardHome() {
  const { guildId } = Route.useParams();
  const [period, setPeriod] = useState<1 | 7 | 30>(7);

  const { data: server } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });
  const { data: analytics } = useSuspenseQuery({
    queryKey: ["guildAnalytics", guildId],
    queryFn: () => getGuildAnalytics({ data: { guildId } }),
    refetchInterval: 60_000,
  });

  const payload = analytics.payload;
  const allDays = useMemo(
    () => [...(payload?.days ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    [payload?.days],
  );
  const days = allDays.slice(-period);

  const selectedTotals = useMemo(
    () =>
      days.reduce(
        (acc, day) => ({
          messages: acc.messages + Number(day.messages || 0),
          reactions: acc.reactions + Number(day.reactions || 0),
          voice_seconds: acc.voice_seconds + Number(day.voice_seconds || 0),
          joins: acc.joins + Number(day.joins || 0),
          leaves: acc.leaves + Number(day.leaves || 0),
          commands: acc.commands + Number(day.commands || 0),
        }),
        { messages: 0, reactions: 0, voice_seconds: 0, joins: 0, leaves: 0, commands: 0 },
      ),
    [days],
  );

  const totalEngagement = selectedTotals.messages + selectedTotals.reactions + selectedTotals.commands;
  const syncedAt = analytics.updatedAt ? new Date(analytics.updatedAt) : null;
  const syncedLabel = syncedAt && !Number.isNaN(syncedAt.getTime())
    ? syncedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "waiting";

  const chartData = days.map((day) => ({ ...day, label: shortDate(day.date) }));
  const topMessages = payload?.top_message_channels ?? [];
  const topVoice = payload?.top_voice_channels ?? [];
  const topCommands = payload?.top_commands ?? [];

  return (
    <DashboardShell guild={server.guild} guildId={guildId} active="home">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[9px] text-white/25">
              <Radio className={`h-3 w-3 ${analytics.connected ? "text-emerald-400/70" : "text-amber-300/60"}`} />
              {analytics.connected ? `Live bot telemetry • synced ${syncedLabel}` : "Waiting for Ware telemetry"}
            </div>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.035em] text-white/94 md:text-[28px]">
              {server.guild.name} overview
            </h1>
            <p className="mt-1 text-[10px] text-white/25">
              Real Discord activity collected by Ware — not estimated dashboard data.
            </p>
          </div>

          <div className="flex rounded-[9px] border border-white/[0.055] bg-[#101212] p-1">
            {[
              [1, "Day"],
              [7, "Week"],
              [30, "Month"],
            ].map(([value, label]) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => setPeriod(value as 1 | 7 | 30)}
                className={`rounded-md px-3 py-1.5 text-[9px] transition-colors ${period === value ? "bg-white/[0.07] text-white/70" : "text-white/25 hover:text-white/45"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {!analytics.connected ? (
          <div className="mb-4 rounded-[14px] border border-amber-300/15 bg-amber-300/[0.035] px-4 py-3 text-[10px] text-amber-100/55">
            The dashboard is ready, but it has not received a signed analytics snapshot from the running Ware bot yet.
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[17px] border border-white/[0.055] bg-[#101212] shadow-[0_28px_90px_rgba(0,0,0,.17)]">
          <div className="flex flex-wrap items-start justify-between gap-4 px-5 pb-0 pt-5 md:px-6">
            <div>
              <div className="text-[9px] font-medium text-white/28">Total Engagement</div>
              <div className="mt-1.5 text-[29px] font-semibold tracking-[-0.05em] text-white/92">{number(totalEngagement)}</div>
              <div className="mt-1 text-[9px] text-emerald-300/55">
                Messages + reactions + commands for the selected period
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[8px] text-white/27">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#b4cad4]" />Messages</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white/25" />Reactions</span>
            </div>
          </div>

          <div className="h-[300px] px-2 pb-3 pt-3 md:px-4">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 16, right: 18, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.045)" strokeDasharray="2 5" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,.25)", fontSize: 8 }} dy={9} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,.18)", fontSize: 8 }} width={46} />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,255,255,.10)", strokeDasharray: "3 3" }}
                    contentStyle={{ background: "#171919", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10, fontSize: 10, color: "rgba(255,255,255,.8)" }}
                    labelStyle={{ color: "rgba(255,255,255,.4)", marginBottom: 5 }}
                  />
                  <Line type="monotone" dataKey="messages" name="Messages" stroke="#b3c8d2" strokeWidth={1.8} dot={false} activeDot={{ r: 4, fill: "#d6e2e7", stroke: "#101212", strokeWidth: 2 }} />
                  <Line type="monotone" dataKey="reactions" name="Reactions" stroke="rgba(255,255,255,.28)" strokeWidth={1.4} strokeDasharray="3 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-[10px] text-white/18">Analytics will appear after the first bot sync.</div>
            )}
          </div>
        </section>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Messages" value={number(selectedTotals.messages)} detail={`${period === 1 ? "Today" : `Last ${period} days`} of message activity`} icon={MessageSquare} />
          <MetricCard label="Total Reactions" value={number(selectedTotals.reactions)} detail="Reaction events captured by Ware" icon={Heart} />
          <MetricCard label="Total Voice Activity" value={hours(selectedTotals.voice_seconds)} detail="Completed voice sessions" icon={Mic2} />
          <MetricCard label="Server Members" value={number(payload?.member_count ?? 0)} detail="Current Discord member count" icon={UsersRound} />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Commands Used" value={number(selectedTotals.commands)} detail="Successful prefix command invocations" icon={Command} />
          <MetricCard label="Members Joined" value={number(selectedTotals.joins)} detail="Join events in selected period" icon={UserPlus} />
          <MetricCard label="Members Left" value={number(selectedTotals.leaves)} detail="Leave events in selected period" icon={UserMinus} />
          <MetricCard label="Net Growth" value={`${selectedTotals.joins - selectedTotals.leaves >= 0 ? "+" : ""}${number(Math.abs(selectedTotals.joins - selectedTotals.leaves))}`} detail={`${selectedTotals.joins - selectedTotals.leaves >= 0 ? "Positive" : "Negative"} member movement`} icon={Activity} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Ranking title="Top Message Channels" subtitle="Channels generating the most messages in the live analytics window." rows={topMessages} suffix={(value) => `${number(value)} messages`} />
          <Ranking title="Top Voice Channels" subtitle="Voice channels with the most completed session time." rows={topVoice} suffix={(value) => hours(value)} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
          <Ranking title="Top Commands" subtitle="Most-used Ware commands since daily command telemetry was enabled." rows={topCommands} suffix={(value) => `${number(value)} uses`} />

          <section className="rounded-[16px] border border-white/[0.055] bg-[#101212] p-5">
            <div className="flex items-center gap-2">
              <Hash className="h-3.5 w-3.5 text-[#a9bec8]" />
              <h2 className="text-[11px] font-semibold text-white/72">Telemetry Status</h2>
            </div>
            <div className="mt-4 space-y-2 text-[9px]">
              {[
                ["Bot connected", server.botInGuild],
                ["Analytics feed", analytics.connected],
                ["Message tracking", Boolean(payload?.days?.length)],
                ["Voice tracking", Boolean((payload?.totals?.voice_seconds ?? 0) > 0 || payload?.days?.length)],
                ["Command tracking", Boolean(payload?.top_commands?.length || payload?.days?.length)],
              ].map(([label, ok]) => (
                <div key={String(label)} className="flex items-center justify-between rounded-[9px] bg-white/[0.022] px-3 py-2.5">
                  <span className="text-white/36">{String(label)}</span>
                  <span className={ok ? "text-emerald-300/65" : "text-white/18"}>{ok ? "Live" : "Waiting"}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
