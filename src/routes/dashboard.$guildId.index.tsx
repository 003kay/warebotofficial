import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Activity,
  Command,
  Heart,
  MessageSquare,
  Mic2,
  Radio,
  Server,
  UserMinus,
  UserPlus,
  UsersRound,
  Zap,
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
import { getGuildAnalytics, type AnalyticsDay } from "@/lib/analytics.functions";

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

type RangeKey = "today" | "7d" | "30d" | "90d" | "6m" | "1y" | "all";

const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "90D", days: 90 },
  { key: "6m", label: "6M", days: 183 },
  { key: "1y", label: "1Y", days: 365 },
  { key: "all", label: "All", days: null },
];

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(Number(value || 0))));
}

function signedNumber(value: number) {
  const rounded = Math.round(Number(value || 0));
  return `${rounded >= 0 ? "+" : "-"}${new Intl.NumberFormat("en-US").format(Math.abs(rounded))}`;
}

function hours(seconds: number) {
  const value = Math.max(0, Number(seconds || 0)) / 3600;
  return value >= 100 ? `${number(value)} hrs` : `${value.toFixed(value >= 10 ? 1 : 2)} hrs`;
}

function dateLabel(value: string, long = false) {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: long ? "numeric" : undefined,
    year: long ? "numeric" : undefined,
    timeZone: "UTC",
  });
}

function filterDays(allDays: AnalyticsDay[], range: RangeKey) {
  if (range === "all") return allDays;
  const days = RANGES.find((item) => item.key === range)?.days ?? 7;
  return allDays.slice(-days);
}

function bucketDays(days: AnalyticsDay[], range: RangeKey) {
  if (days.length <= 45 || range === "today" || range === "7d" || range === "30d") {
    return days.map((day) => ({ ...day, label: dateLabel(day.date, true) }));
  }

  const bucketSize = range === "90d" ? 7 : range === "6m" || range === "1y" ? 14 : 30;
  const rows: Array<AnalyticsDay & { label: string }> = [];

  for (let i = 0; i < days.length; i += bucketSize) {
    const chunk = days.slice(i, i + bucketSize);
    if (!chunk.length) continue;
    const sum = chunk.reduce(
      (acc, day) => ({
        date: chunk[0].date,
        messages: acc.messages + Number(day.messages || 0),
        reactions: acc.reactions + Number(day.reactions || 0),
        voice_seconds: acc.voice_seconds + Number(day.voice_seconds || 0),
        joins: acc.joins + Number(day.joins || 0),
        leaves: acc.leaves + Number(day.leaves || 0),
        commands: acc.commands + Number(day.commands || 0),
      }),
      { date: chunk[0].date, messages: 0, reactions: 0, voice_seconds: 0, joins: 0, leaves: 0, commands: 0 },
    );
    rows.push({ ...sum, label: dateLabel(chunk[0].date, bucketSize >= 30) });
  }
  return rows;
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Activity }) {
  return (
    <div className="relative overflow-hidden rounded-[18px] border border-white/[0.06] bg-[#0f1111] p-4 transition-colors hover:border-white/[0.10]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[9px] font-medium uppercase tracking-[0.12em] text-white/25">{label}</div>
          <div className="mt-2.5 text-[25px] font-semibold tracking-[-0.045em] text-white/90">{value}</div>
          <div className="mt-2 text-[9px] leading-4 text-white/25">{detail}</div>
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] border border-white/[0.06] bg-white/[0.025]">
          <Icon className="h-4 w-4 text-[#a8bec7]" strokeWidth={1.65} />
        </div>
      </div>
    </div>
  );
}

function Ranking({
  title,
  subtitle,
  rows,
  suffix,
  channels = false,
}: {
  title: string;
  subtitle: string;
  rows: { id?: string; name: string; value: number }[];
  suffix: (value: number) => string;
  channels?: boolean;
}) {
  const max = Math.max(1, ...rows.map((row) => Number(row.value || 0)));

  return (
    <section className="overflow-hidden rounded-[19px] border border-white/[0.06] bg-[#0f1111]">
      <div className="border-b border-white/[0.05] px-5 py-4">
        <h2 className="text-[12px] font-semibold text-white/78">{title}</h2>
        <p className="mt-1 text-[9px] text-white/24">{subtitle}</p>
      </div>
      <div className="p-3">
        {rows.length ? (
          <div className="space-y-2">
            {rows.slice(0, 8).map((row, index) => (
              <div key={`${row.id || row.name}-${index}`} className="rounded-[13px] border border-white/[0.035] bg-white/[0.018] px-3.5 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-white/[0.035] text-[9px] font-medium text-white/28">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="truncate text-[10px] font-semibold text-white/72">
                          {channels ? `# ${row.name || "Channel"}` : row.name}
                        </div>
                        {channels && row.id ? (
                          <div className="mt-0.5 truncate font-mono text-[8px] tracking-[0.02em] text-white/22">{row.id}</div>
                        ) : null}
                      </div>
                      <span className="shrink-0 pt-0.5 text-[9px] font-medium text-white/36">{suffix(Number(row.value || 0))}</span>
                    </div>
                    <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-white/[0.045]">
                      <div className="h-full rounded-full bg-[#a5bdc8]/55" style={{ width: `${Math.max(3, (Number(row.value || 0) / max) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid min-h-52 place-items-center text-center text-[10px] text-white/20">No activity has been synced yet.</div>
        )}
      </div>
    </section>
  );
}

function GuildDashboardHome() {
  const { guildId } = Route.useParams();
  const [range, setRange] = useState<RangeKey>("7d");

  const { data: server } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });
  const { data: analytics } = useSuspenseQuery({
    queryKey: ["guildAnalytics", guildId],
    queryFn: () => getGuildAnalytics({ data: { guildId } }),
    refetchInterval: 30_000,
  });

  const payload = analytics.payload;
  const allDays = useMemo(() => [...(payload?.days ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [payload?.days]);
  const selectedDays = useMemo(() => filterDays(allDays, range), [allDays, range]);
  const chartData = useMemo(() => bucketDays(selectedDays, range), [selectedDays, range]);

  const selectedTotals = useMemo(
    () => selectedDays.reduce(
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
    [selectedDays],
  );

  const totalEngagement = selectedTotals.messages + selectedTotals.reactions + selectedTotals.commands;
  const netGrowth = selectedTotals.joins - selectedTotals.leaves;
  const syncedAt = analytics.updatedAt ? new Date(analytics.updatedAt) : null;
  const syncedLabel = syncedAt && !Number.isNaN(syncedAt.getTime())
    ? syncedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "waiting";
  const rangeLabel = RANGES.find((item) => item.key === range)?.label ?? "7D";

  return (
    <DashboardShell guild={server.guild} guildId={guildId} active="home">
      <div className="mx-auto max-w-[1480px] pb-10">
        <section className="relative mb-4 overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#0e1010] px-5 py-5 md:px-6 md:py-6">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#9db8c5]/[0.035] blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[9px] text-white/30">
                <span className={`h-1.5 w-1.5 rounded-full ${analytics.connected ? "bg-emerald-400" : "bg-amber-300"}`} />
                <Radio className="h-3 w-3" strokeWidth={1.7} />
                {analytics.connected ? `Live telemetry · synced ${syncedLabel}` : "Waiting for Ware telemetry"}
              </div>
              <div className="mt-3 flex items-center gap-3">
                {server.guild.iconUrl ? <img src={server.guild.iconUrl} alt="" className="h-10 w-10 rounded-[12px] object-cover" /> : (
                  <div className="grid h-10 w-10 place-items-center rounded-[12px] border border-white/[0.06] bg-white/[0.025]"><Server className="h-4 w-4 text-white/35" /></div>
                )}
                <div>
                  <h1 className="text-[25px] font-semibold tracking-[-0.04em] text-white/94 md:text-[30px]">{server.guild.name}</h1>
                  <p className="mt-0.5 text-[10px] text-white/27">Server overview and live Ware activity</p>
                </div>
              </div>
            </div>

            <div className="max-w-full overflow-x-auto rounded-[11px] border border-white/[0.06] bg-black/20 p-1">
              <div className="flex min-w-max">
                {RANGES.map((item) => (
                  <button key={item.key} type="button" onClick={() => setRange(item.key)} className={`rounded-[8px] px-3.5 py-2 text-[9px] font-medium transition-colors ${range === item.key ? "bg-white/[0.08] text-white/78" : "text-white/25 hover:text-white/50"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Messages" value={number(selectedTotals.messages)} detail={`${rangeLabel} message activity`} icon={MessageSquare} />
          <MetricCard label="Reactions" value={number(selectedTotals.reactions)} detail="Reaction events captured by Ware" icon={Heart} />
          <MetricCard label="Voice" value={hours(selectedTotals.voice_seconds)} detail="Completed voice session time" icon={Mic2} />
          <MetricCard label="Members" value={number(payload?.member_count ?? 0)} detail="Current Discord member count" icon={UsersRound} />
        </div>

        <section className="mt-3 overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#0f1111]">
          <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 md:px-6">
            <div>
              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.13em] text-white/25"><Zap className="h-3 w-3 text-[#9ebac5]" /> Engagement · {rangeLabel}</div>
              <div className="mt-2 text-[32px] font-semibold tracking-[-0.055em] text-white/92">{number(totalEngagement)}</div>
              <p className="mt-1 text-[9px] text-white/24">Messages + reactions + successful commands</p>
            </div>
            <div className="flex gap-4 pt-1 text-[8px] text-white/30">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#a9c1cb]" />Messages</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-white/30" />Reactions</span>
            </div>
          </div>
          <div className="h-[360px] px-2 pb-3 pt-4 md:px-4">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 16, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="messageFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a9c1cb" stopOpacity={0.22} /><stop offset="100%" stopColor="#a9c1cb" stopOpacity={0} /></linearGradient>
                    <linearGradient id="reactionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffffff" stopOpacity={0.07} /><stop offset="100%" stopColor="#ffffff" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 6" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: "rgba(255,255,255,.22)", fontSize: 8 }} dy={9} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,.16)", fontSize: 8 }} width={46} />
                  <Tooltip cursor={{ stroke: "rgba(255,255,255,.09)", strokeDasharray: "3 3" }} contentStyle={{ background: "#151717", border: "1px solid rgba(255,255,255,.08)", borderRadius: 11, fontSize: 10, color: "rgba(255,255,255,.8)" }} labelStyle={{ color: "rgba(255,255,255,.4)", marginBottom: 5 }} />
                  <Area type="monotone" dataKey="messages" name="Messages" stroke="#a9c1cb" strokeWidth={1.9} fill="url(#messageFill)" activeDot={{ r: 4, fill: "#d5e1e6", stroke: "#0f1111", strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="reactions" name="Reactions" stroke="rgba(255,255,255,.30)" strokeWidth={1.25} fill="url(#reactionFill)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="grid h-full place-items-center text-[10px] text-white/18">No analytics in this range yet.</div>}
          </div>
        </section>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Commands" value={number(selectedTotals.commands)} detail="Successful prefix command invocations" icon={Command} />
          <MetricCard label="Joined" value={number(selectedTotals.joins)} detail={`Join events in ${rangeLabel}`} icon={UserPlus} />
          <MetricCard label="Left" value={number(selectedTotals.leaves)} detail={`Leave events in ${rangeLabel}`} icon={UserMinus} />
          <MetricCard label="Net Growth" value={signedNumber(netGrowth)} detail={netGrowth >= 0 ? "Positive member movement" : "Negative member movement"} icon={Activity} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <Ranking title="Top Message Channels" subtitle="Most active text channels in Ware's stored analytics window." rows={payload?.top_message_channels ?? []} suffix={(value) => `${number(value)} messages`} channels />
          <Ranking title="Top Voice Channels" subtitle="Voice channels with the most completed session time." rows={payload?.top_voice_channels ?? []} suffix={(value) => hours(value)} channels />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
          <Ranking title="Top Commands" subtitle="Most-used Ware commands in the current analytics snapshot." rows={payload?.top_commands ?? []} suffix={(value) => `${number(value)} uses`} />
          <section className="rounded-[19px] border border-white/[0.06] bg-[#0f1111] p-5">
            <div className="text-[9px] uppercase tracking-[0.13em] text-white/25">Telemetry</div>
            <div className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-white/75"><span className={`h-2 w-2 rounded-full ${analytics.connected ? "bg-emerald-400" : "bg-amber-300"}`} />{analytics.connected ? "Connected" : "Waiting"}</div>
            <div className="mt-4 space-y-2 text-[9px] text-white/28">
              <div className="flex justify-between gap-3"><span>Last sync</span><span className="text-white/48">{syncedLabel}</span></div>
              <div className="flex justify-between gap-3"><span>Stored history</span><span className="text-white/48">{allDays.length} days</span></div>
              <div className="flex justify-between gap-3"><span>Selected range</span><span className="text-white/48">{rangeLabel}</span></div>
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
