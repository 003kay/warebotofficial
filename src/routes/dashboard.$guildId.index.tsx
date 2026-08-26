import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Command,
  Heart,
  MessageSquare,
  Mic2,
  Radio,
  ShieldCheck,
  TicketCheck,
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
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
import { getGuildAnalytics, type AnalyticsDay } from "@/lib/analytics.functions";

export const Route = createFileRoute("/dashboard/$guildId/")({
  head: () => ({ meta: [{ title: "Overview — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["ticketPanel", params.guildId], queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }) }),
      context.queryClient.ensureQueryData({ queryKey: ["guildAnalytics", params.guildId], queryFn: () => getGuildAnalytics({ data: { guildId: params.guildId } }) }),
      context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }),
    ]);
    return null;
  },
  component: GuildDashboardHome,
});

type RangeKey = "today" | "7d" | "30d" | "90d" | "6m" | "1y" | "all";
type ChartMode = "activity" | "voice" | "growth";

const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "7 days", days: 7 },
  { key: "30d", label: "30 days", days: 30 },
  { key: "90d", label: "3 months", days: 90 },
  { key: "6m", label: "6 months", days: 183 },
  { key: "1y", label: "1 year", days: 365 },
  { key: "all", label: "All time", days: null },
];

function number(value: number) {
  return new Intl.NumberFormat("en-US").format(Math.max(0, Math.round(Number(value || 0))));
}

function signed(value: number) {
  const rounded = Math.round(Number(value || 0));
  return `${rounded >= 0 ? "+" : "-"}${new Intl.NumberFormat("en-US").format(Math.abs(rounded))}`;
}

function hours(seconds: number) {
  const value = Math.max(0, Number(seconds || 0)) / 3600;
  if (value >= 100) return `${number(value)}h`;
  return `${value.toFixed(value >= 10 ? 1 : 2)}h`;
}

function shortDate(value: string, includeYear = false) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: includeYear ? "2-digit" : undefined,
    timeZone: "UTC",
  });
}

function filterDays(all: AnalyticsDay[], range: RangeKey) {
  const size = RANGES.find((item) => item.key === range)?.days;
  return size == null ? all : all.slice(-size);
}

function bucketDays(days: AnalyticsDay[], range: RangeKey) {
  const size = range === "90d" ? 3 : range === "6m" ? 7 : range === "1y" ? 14 : range === "all" && days.length > 365 ? 30 : 1;
  if (size === 1) return days.map((day) => ({ ...day, label: shortDate(day.date, range === "1y" || range === "all") }));

  const result: Array<AnalyticsDay & { label: string }> = [];
  for (let i = 0; i < days.length; i += size) {
    const group = days.slice(i, i + size);
    if (!group.length) continue;
    const total = group.reduce(
      (acc, day) => ({
        date: group[0].date,
        messages: acc.messages + Number(day.messages || 0),
        reactions: acc.reactions + Number(day.reactions || 0),
        voice_seconds: acc.voice_seconds + Number(day.voice_seconds || 0),
        joins: acc.joins + Number(day.joins || 0),
        leaves: acc.leaves + Number(day.leaves || 0),
        commands: acc.commands + Number(day.commands || 0),
      }),
      { date: group[0].date, messages: 0, reactions: 0, voice_seconds: 0, joins: 0, leaves: 0, commands: 0 },
    );
    result.push({ ...total, label: shortDate(group[0].date, range === "1y" || range === "all") });
  }
  return result;
}

function MetricCard({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Activity }) {
  return (
    <div className="group rounded-[18px] border border-white/[0.06] bg-[#101212] p-4 transition hover:border-white/[0.11] hover:bg-[#121414]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-white/25">{label}</div>
          <div className="mt-2 text-[25px] font-semibold tracking-[-0.05em] text-white/92">{value}</div>
          <div className="mt-1.5 text-[9px] text-white/27">{detail}</div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-[11px] border border-white/[0.06] bg-white/[0.025]"><Icon className="h-4 w-4 text-[#a9bec7]" strokeWidth={1.65} /></div>
      </div>
    </div>
  );
}

function StatusCard({ title, detail, active, href, icon: Icon }: { title: string; detail: string; active: boolean; href: string; icon: typeof Activity }) {
  return (
    <a href={href} className="group flex items-center gap-3 rounded-[16px] border border-white/[0.055] bg-[#0f1111] p-3.5 transition hover:border-white/[0.11] hover:bg-[#121414]">
      <div className="grid h-9 w-9 place-items-center rounded-[11px] border border-white/[0.06] bg-white/[0.025]"><Icon className="h-4 w-4 text-white/45" /></div>
      <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-[10px] font-medium text-white/72"><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-white/20"}`} />{title}</div><div className="mt-1 truncate text-[9px] text-white/25">{detail}</div></div>
      <ArrowUpRight className="h-3.5 w-3.5 text-white/18 transition group-hover:text-white/45" />
    </a>
  );
}

function Ranking({ title, subtitle, rows, suffix, channels = false }: { title: string; subtitle: string; rows: { id?: string; name: string; value: number }[]; suffix: (value: number) => string; channels?: boolean }) {
  const max = Math.max(1, ...rows.map((row) => Number(row.value || 0)));
  return (
    <section className="overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#101212]">
      <div className="border-b border-white/[0.05] px-5 py-4"><h2 className="text-[12px] font-semibold text-white/78">{title}</h2><p className="mt-1 text-[9px] text-white/25">{subtitle}</p></div>
      <div className="p-3">
        {rows.length ? <div className="space-y-2">{rows.slice(0, 8).map((row, index) => {
          const rawId = String(row.id || "");
          const displayName = row.name && row.name !== rawId ? row.name : rawId ? `channel-${rawId.slice(-6)}` : "channel";
          return (
            <div key={`${rawId || row.name}-${index}`} className="rounded-[13px] border border-white/[0.04] bg-white/[0.018] px-3.5 py-3">
              <div className="flex items-center gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-white/[0.035] text-[9px] text-white/28">{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0"><div className="truncate text-[10px] font-semibold text-white/72">{channels ? `# ${displayName}` : row.name}</div>{channels && rawId ? <div className="mt-0.5 truncate font-mono text-[8px] text-white/22">{rawId}</div> : null}</div>
                    <div className="shrink-0 text-[9px] font-medium text-white/36">{suffix(Number(row.value || 0))}</div>
                  </div>
                  <div className="mt-2.5 h-[3px] overflow-hidden rounded-full bg-white/[0.045]"><div className="h-full rounded-full bg-[#a7bdc7]/55" style={{ width: `${Math.max(3, (Number(row.value || 0) / max) * 100)}%` }} /></div>
                </div>
              </div>
            </div>
          );
        })}</div> : <div className="grid min-h-44 place-items-center text-[10px] text-white/20">No activity yet.</div>}
      </div>
    </section>
  );
}

function GuildDashboardHome() {
  const { guildId } = Route.useParams();
  const [range, setRange] = useState<RangeKey>("7d");
  const [chartMode, setChartMode] = useState<ChartMode>("activity");

  const { data: tickets } = useSuspenseQuery({ queryKey: ["ticketPanel", guildId], queryFn: () => getTicketPanel({ data: { guildId } }) });
  const { data: analytics } = useSuspenseQuery({ queryKey: ["guildAnalytics", guildId], queryFn: () => getGuildAnalytics({ data: { guildId } }), refetchInterval: 30_000 });
  const { data: settings } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });

  const payload = analytics.payload;
  const allDays = useMemo(() => [...(payload?.days ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [payload?.days]);
  const selectedDays = useMemo(() => filterDays(allDays, range), [allDays, range]);
  const chartData = useMemo(() => bucketDays(selectedDays, range).map((row) => ({ ...row, engagement: row.messages + row.reactions + row.commands, growth: row.joins - row.leaves, voice_hours: row.voice_seconds / 3600 })), [selectedDays, range]);

  const totals = useMemo(() => selectedDays.reduce((acc, day) => ({ messages: acc.messages + Number(day.messages || 0), reactions: acc.reactions + Number(day.reactions || 0), voice_seconds: acc.voice_seconds + Number(day.voice_seconds || 0), joins: acc.joins + Number(day.joins || 0), leaves: acc.leaves + Number(day.leaves || 0), commands: acc.commands + Number(day.commands || 0) }), { messages: 0, reactions: 0, voice_seconds: 0, joins: 0, leaves: 0, commands: 0 }), [selectedDays]);

  const rangeLabel = RANGES.find((item) => item.key === range)?.label ?? "7 days";
  const joinGate = (settings.settings.joinGate as Record<string, unknown> | undefined) ?? {};
  const totalEngagement = totals.messages + totals.reactions + totals.commands;
  const netGrowth = totals.joins - totals.leaves;
  const syncedAt = analytics.updatedAt ? new Date(analytics.updatedAt) : null;
  const synced = syncedAt && !Number.isNaN(syncedAt.getTime()) ? syncedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "waiting";

  const chartSeries = chartMode === "activity"
    ? [{ key: "messages", name: "Messages", stroke: "#b6cbd4", fill: "url(#wareFill)" }, { key: "engagement", name: "Engagement", stroke: "rgba(255,255,255,.30)", fill: "transparent" }]
    : chartMode === "voice"
      ? [{ key: "voice_hours", name: "Voice hours", stroke: "#b6cbd4", fill: "url(#wareFill)" }]
      : [{ key: "growth", name: "Net growth", stroke: "#b6cbd4", fill: "url(#wareFill)" }];

  return (
    <DashboardShell guild={tickets.guild} guildId={guildId} active="home">
      <div className="mx-auto max-w-[1500px] pb-12">
        <section className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#0d0f0f] p-5 md:p-6">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#9fb8c3]/[0.035] blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div className="flex items-center gap-4">
              {tickets.guild.iconUrl ? <img src={tickets.guild.iconUrl} alt="" className="h-12 w-12 rounded-[14px] object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-[14px] border border-white/[0.06] bg-white/[0.025]"><Bot className="h-5 w-5 text-white/35" /></div>}
              <div><div className="flex items-center gap-2 text-[9px] text-white/28"><Radio className="h-3 w-3" /><span className={`h-1.5 w-1.5 rounded-full ${analytics.connected ? "bg-emerald-400" : "bg-amber-300"}`} />{analytics.connected ? `Live telemetry · ${synced}` : "Waiting for telemetry"}</div><h1 className="mt-2 text-[28px] font-semibold tracking-[-0.05em] text-white/94">{tickets.guild.name}</h1><p className="mt-1 text-[10px] text-white/27">Operations, security and community activity in one place.</p></div>
            </div>
            <div className="max-w-full overflow-x-auto rounded-[11px] border border-white/[0.06] bg-black/20 p-1"><div className="flex min-w-max">{RANGES.map((item) => <button key={item.key} type="button" onClick={() => setRange(item.key)} className={`rounded-[8px] px-3.5 py-2 text-[9px] font-medium transition ${range === item.key ? "bg-white/[0.08] text-white/78" : "text-white/25 hover:text-white/50"}`}>{item.label}</button>)}</div></div>
          </div>
        </section>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard label="Messages" value={number(totals.messages)} detail={rangeLabel} icon={MessageSquare} />
          <MetricCard label="Reactions" value={number(totals.reactions)} detail={rangeLabel} icon={Heart} />
          <MetricCard label="Commands" value={number(totals.commands)} detail="successful uses" icon={Command} />
          <MetricCard label="Voice" value={hours(totals.voice_seconds)} detail="completed sessions" icon={Mic2} />
          <MetricCard label="Members" value={number(payload?.member_count ?? 0)} detail="current total" icon={UsersRound} />
          <MetricCard label="Growth" value={signed(netGrowth)} detail={`${number(totals.joins)} in · ${number(totals.leaves)} out`} icon={Activity} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
          <StatusCard title="Ware bot" detail={tickets.botInGuild ? "Connected to this server" : "Connection needs attention"} active={tickets.botInGuild} href={`/dashboard/${guildId}/settings`} icon={Bot} />
          <StatusCard title="Join Gate" detail={Boolean(joinGate.enabled) ? "Entrance screening enabled" : "Entrance screening disabled"} active={Boolean(joinGate.enabled)} href={`/dashboard/${guildId}/join-gate`} icon={ShieldCheck} />
          <StatusCard title="Tickets" detail={tickets.panel ? "Ticket panel configured" : "No ticket panel configured"} active={Boolean(tickets.panel)} href={`/dashboard/${guildId}/tickets`} icon={TicketCheck} />
        </div>

        <section className="mt-3 overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#101212]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.05] px-5 py-4 md:px-6">
            <div><div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/25"><Zap className="h-3.5 w-3.5 text-[#a9bec7]" /> Analytics</div><div className="mt-1.5 text-[20px] font-semibold tracking-[-0.035em] text-white/85">{chartMode === "activity" ? number(totalEngagement) : chartMode === "voice" ? hours(totals.voice_seconds) : signed(netGrowth)}</div></div>
            <div className="flex rounded-[10px] border border-white/[0.055] bg-black/20 p-1">{([['activity','Activity'],['voice','Voice'],['growth','Growth']] as const).map(([key,label]) => <button key={key} type="button" onClick={() => setChartMode(key)} className={`rounded-[7px] px-3 py-1.5 text-[9px] ${chartMode === key ? "bg-white/[0.08] text-white/72" : "text-white/25 hover:text-white/50"}`}>{label}</button>)}</div>
          </div>
          <div className="h-[390px] px-2 pb-3 pt-4 md:px-4">
            {chartData.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 18, left: -12, bottom: 0 }}><defs><linearGradient id="wareFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#b6cbd4" stopOpacity={0.19} /><stop offset="100%" stopColor="#b6cbd4" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(255,255,255,.04)" strokeDasharray="2 6" /><XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: "rgba(255,255,255,.24)", fontSize: 8 }} dy={9} /><YAxis axisLine={false} tickLine={false} width={52} tick={{ fill: "rgba(255,255,255,.18)", fontSize: 8 }} /><Tooltip cursor={{ stroke: "rgba(255,255,255,.10)", strokeDasharray: "3 3" }} contentStyle={{ background: "#151717", border: "1px solid rgba(255,255,255,.08)", borderRadius: 12, fontSize: 10, color: "rgba(255,255,255,.82)" }} labelStyle={{ color: "rgba(255,255,255,.42)", marginBottom: 5 }} />{chartSeries.map((series) => <Area key={series.key} type="monotone" dataKey={series.key} name={series.name} stroke={series.stroke} strokeWidth={1.8} fill={series.fill} dot={false} activeDot={{ r: 4, fill: "#d9e5ea", stroke: "#101212", strokeWidth: 2 }} />)}</AreaChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-[10px] text-white/20">No analytics for this range yet.</div>}
          </div>
        </section>

        <div className="mt-3 grid gap-3 xl:grid-cols-2">
          <Ranking title="Top message channels" subtitle="Most active text channels in Ware's stored analytics window." rows={payload?.top_message_channels ?? []} suffix={(value) => `${number(value)} messages`} channels />
          <Ranking title="Top voice channels" subtitle="Voice channels with the most completed session time." rows={payload?.top_voice_channels ?? []} suffix={(value) => hours(value)} channels />
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-[1.15fr_.85fr]">
          <Ranking title="Top commands" subtitle="Commands your community is actually using." rows={payload?.top_commands ?? []} suffix={(value) => `${number(value)} uses`} />
          <section className="rounded-[20px] border border-white/[0.06] bg-[#101212] p-5"><div className="text-[9px] uppercase tracking-[0.14em] text-white/25">Member movement</div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-[14px] border border-white/[0.05] bg-white/[0.018] p-4"><UserPlus className="h-4 w-4 text-emerald-300/55" /><div className="mt-3 text-[22px] font-semibold text-white/82">{number(totals.joins)}</div><div className="mt-1 text-[9px] text-white/25">joined</div></div><div className="rounded-[14px] border border-white/[0.05] bg-white/[0.018] p-4"><UserMinus className="h-4 w-4 text-rose-300/45" /><div className="mt-3 text-[22px] font-semibold text-white/82">{number(totals.leaves)}</div><div className="mt-1 text-[9px] text-white/25">left</div></div></div><div className="mt-3 rounded-[14px] border border-white/[0.05] bg-white/[0.018] px-4 py-3 text-[9px] text-white/28">Range: <span className="font-medium text-white/55">{rangeLabel}</span> · Net change <span className="font-medium text-white/65">{signed(netGrowth)}</span></div></section>
        </div>
      </div>
    </DashboardShell>
  );
}
