import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Activity, Bot, Command, Heart, MessageSquare, Mic2, Radio, ShieldCheck, TicketCheck, UserMinus, UserPlus, UsersRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTicketPanel } from "@/lib/dashboard.functions";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
import { getGuildAnalytics, type AnalyticsDay, type AnalyticsRankRow } from "@/lib/analytics.functions";

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
type ChartMode = "messages" | "voice" | "members";

const RANGES: { key: RangeKey; label: string; days: number | null }[] = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "3M", days: 90 },
  { key: "6m", label: "6M", days: 183 },
  { key: "1y", label: "1Y", days: 365 },
  { key: "all", label: "All", days: null },
];

const nf = new Intl.NumberFormat("en-US");
const number = (value: number) => nf.format(Math.max(0, Math.round(Number(value || 0))));
const minutes = (seconds: number) => `${number(Number(seconds || 0) / 60)} min`;
const hours = (seconds: number) => `${(Math.max(0, Number(seconds || 0)) / 3600).toFixed(1)}h`;

function labelDate(value: string, includeYear = false) {
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: includeYear ? "2-digit" : undefined, timeZone: "UTC" });
}

function selectedDays(all: AnalyticsDay[], range: RangeKey) {
  const days = RANGES.find((item) => item.key === range)?.days;
  return days == null ? all : all.slice(-days);
}

function chartRows(days: AnalyticsDay[], range: RangeKey) {
  if (!days.length) return [];
  const targetPoints = 28;
  const bucket = Math.max(1, Math.ceil(days.length / targetPoints));
  const rows: any[] = [];
  for (let i = 0; i < days.length; i += bucket) {
    const chunk = days.slice(i, i + bucket);
    const sum = chunk.reduce((a, d) => ({
      messages: a.messages + Number(d.messages || 0),
      reactions: a.reactions + Number(d.reactions || 0),
      commands: a.commands + Number(d.commands || 0),
      voice_seconds: a.voice_seconds + Number(d.voice_seconds || 0),
      joins: a.joins + Number(d.joins || 0),
      leaves: a.leaves + Number(d.leaves || 0),
    }), { messages: 0, reactions: 0, commands: 0, voice_seconds: 0, joins: 0, leaves: 0 });
    rows.push({
      ...sum,
      label: labelDate(chunk[0].date, range === "1y" || range === "all"),
      voice_hours: sum.voice_seconds / 3600,
      net_members: sum.joins - sum.leaves,
    });
  }
  return rows;
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof Activity; label: string; value: string; detail: string }) {
  return <div className="ware-rise rounded-[18px] border border-white/[.055] bg-[#0e1010] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-white/[.10] hover:bg-[#111313]">
    <div className="flex items-start justify-between gap-3"><div><div className="text-[8px] font-semibold uppercase tracking-[.15em] text-white/24">{label}</div><div className="mt-2 text-[24px] font-semibold tracking-[-.045em] text-white/92">{value}</div><div className="mt-1 text-[9px] text-white/25">{detail}</div></div><div className="grid h-9 w-9 place-items-center rounded-[11px] border border-white/[.06] bg-white/[.025]"><Icon className="h-4 w-4 text-[#a9bec7]" /></div></div>
  </div>;
}

function Podium({ title, rows, kind }: { title: string; rows: AnalyticsRankRow[]; kind: "messages" | "voice" }) {
  return <section className="ware-rise rounded-[20px] border border-white/[.055] bg-[#0e1010] p-4">
    <div className="mb-3 flex items-center justify-between"><div className="text-[11px] font-semibold text-white/72">{title}</div><div className="text-[8px] uppercase tracking-[.16em] text-white/20">Top 3</div></div>
    <div className="space-y-2">{rows.slice(0, 3).map((row, i) => <div key={`${row.id || row.name}-${i}`} className="flex items-center gap-3 rounded-[14px] border border-white/[.04] bg-white/[.018] px-3 py-3">
      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-[9px] bg-white/[.04] text-[9px] font-semibold text-white/35">{i + 1}</div>
      {row.avatar_url ? <img src={row.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" /> : null}
      <div className="min-w-0 flex-1"><div className="truncate text-[10px] font-semibold text-white/68">{row.name}</div>{row.id ? <div className="mt-0.5 truncate font-mono text-[8px] text-white/18">{row.id}</div> : null}</div>
      <div className="text-[9px] font-medium text-white/38">{kind === "messages" ? `${number(row.value)} msgs` : minutes(row.value)}</div>
    </div>)}{!rows.length ? <div className="grid min-h-32 place-items-center rounded-[14px] border border-dashed border-white/[.055] text-[9px] text-white/20">Waiting for ranking data</div> : null}</div>
  </section>;
}

function ChannelTop({ title, rows, kind }: { title: string; rows: AnalyticsRankRow[]; kind: "messages" | "voice" }) {
  return <section className="ware-rise rounded-[20px] border border-white/[.055] bg-[#0e1010] p-4">
    <div className="mb-3 flex items-center justify-between"><div className="text-[11px] font-semibold text-white/72">{title}</div><div className="text-[8px] uppercase tracking-[.16em] text-white/20">Top 3</div></div>
    <div className="space-y-2">{rows.slice(0, 3).map((row, i) => <div key={`${row.id || row.name}-${i}`} className="rounded-[14px] border border-white/[.04] bg-white/[.018] px-3 py-3">
      <div className="flex items-center gap-3"><div className="grid h-7 w-7 place-items-center rounded-[9px] bg-white/[.04] text-[9px] text-white/30">{i + 1}</div><div className="min-w-0 flex-1"><div className="truncate text-[10px] font-semibold text-white/68"># {row.name}</div><div className="mt-0.5 truncate font-mono text-[8px] text-white/18">{row.id}</div></div><div className="text-[9px] text-white/38">{kind === "messages" ? `${number(row.value)} msgs` : hours(row.value)}</div></div>
    </div>)}</div>
  </section>;
}

function GuildDashboardHome() {
  const { guildId } = Route.useParams();
  const [range, setRange] = useState<RangeKey>("7d");
  const [mode, setMode] = useState<ChartMode>("messages");
  const { data: tickets } = useSuspenseQuery({ queryKey: ["ticketPanel", guildId], queryFn: () => getTicketPanel({ data: { guildId } }) });
  const { data: analytics } = useSuspenseQuery({ queryKey: ["guildAnalytics", guildId], queryFn: () => getGuildAnalytics({ data: { guildId } }), refetchInterval: 60_000 });
  const { data: settings } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });

  const payload = analytics.payload;
  const all = useMemo(() => [...(payload?.days ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [payload?.days]);
  const days = useMemo(() => selectedDays(all, range), [all, range]);
  const rows = useMemo(() => chartRows(days, range), [days, range]);
  const totals = useMemo(() => days.reduce((a, d) => ({ messages: a.messages + d.messages, reactions: a.reactions + d.reactions, voice_seconds: a.voice_seconds + d.voice_seconds, joins: a.joins + d.joins, leaves: a.leaves + d.leaves, commands: a.commands + d.commands }), { messages: 0, reactions: 0, voice_seconds: 0, joins: 0, leaves: 0, commands: 0 }), [days]);
  const joinGate = (settings.settings.joinGate as Record<string, unknown> | undefined) ?? {};
  const yKey = mode === "messages" ? "messages" : mode === "voice" ? "voice_hours" : "net_members";
  const chartName = mode === "messages" ? "Messages" : mode === "voice" ? "Voice hours" : "Net members";

  return <DashboardShell guild={tickets.guild} guildId={guildId} active="home">
    <style>{`@keyframes wareRise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} .ware-rise{animation:wareRise .34s ease both} @media (prefers-reduced-motion:reduce){.ware-rise{animation:none!important;transition:none!important}}`}</style>
    <div className="mx-auto max-w-[1480px] space-y-4 pb-12">
      <section className="ware-rise relative overflow-hidden rounded-[22px] border border-white/[.06] bg-[#0d0f0f] p-5 md:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#a9bec7]/[.035] blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5"><div className="flex items-center gap-4">{tickets.guild.iconUrl ? <img src={tickets.guild.iconUrl} alt="" className="h-12 w-12 rounded-[14px] object-cover" /> : <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white/[.03]"><Bot className="h-5 w-5 text-white/35" /></div>}<div><div className="flex items-center gap-2 text-[9px] text-white/27"><Radio className="h-3 w-3" /><span className={`h-1.5 w-1.5 rounded-full ${analytics.connected ? "bg-emerald-400" : "bg-amber-300"}`} />{analytics.connected ? "Live telemetry" : "Waiting for telemetry"}</div><h1 className="mt-1.5 text-[28px] font-semibold tracking-[-.05em] text-white/94">{tickets.guild.name}</h1><p className="mt-1 text-[10px] text-white/25">Community health, activity, security and tickets.</p></div></div><div className="flex flex-wrap gap-1 rounded-[12px] border border-white/[.06] bg-black/20 p-1">{RANGES.map((item) => <button key={item.key} onClick={() => setRange(item.key)} className={`rounded-[8px] px-3 py-2 text-[9px] transition ${range === item.key ? "bg-white/[.09] text-white/80" : "text-white/25 hover:text-white/55"}`}>{item.label}</button>)}</div></div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric icon={MessageSquare} label="Messages" value={number(totals.messages)} detail="Selected range" />
        <Metric icon={Mic2} label="Voice" value={hours(totals.voice_seconds)} detail="Completed sessions" />
        <Metric icon={UsersRound} label="Members" value={number(payload?.member_count ?? 0)} detail="Current server size" />
        <Metric icon={Command} label="Commands" value={number(totals.commands)} detail="Successful uses" />
        <Metric icon={UserPlus} label="Joined" value={number(totals.joins)} detail="Selected range" />
        <Metric icon={UserMinus} label="Left" value={number(totals.leaves)} detail="Selected range" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr]">
        <a href={`/dashboard/${guildId}/security`} className="ware-rise flex items-center gap-3 rounded-[16px] border border-white/[.055] bg-[#0e1010] p-4 hover:border-white/[.1]"><ShieldCheck className="h-4 w-4 text-emerald-300/65" /><div><div className="text-[10px] font-medium text-white/68">Security Center</div><div className="mt-1 text-[9px] text-white/24">Protection modules and events</div></div></a>
        <a href={`/dashboard/${guildId}/join-gate`} className="ware-rise flex items-center gap-3 rounded-[16px] border border-white/[.055] bg-[#0e1010] p-4 hover:border-white/[.1]"><Activity className="h-4 w-4 text-[#a9bec7]" /><div><div className="text-[10px] font-medium text-white/68">Join Gate · {Boolean(joinGate.enabled) ? "On" : "Off"}</div><div className="mt-1 text-[9px] text-white/24">New-member screening</div></div></a>
        <a href={`/dashboard/${guildId}/tickets`} className="ware-rise flex items-center gap-3 rounded-[16px] border border-white/[.055] bg-[#0e1010] p-4 hover:border-white/[.1]"><TicketCheck className="h-4 w-4 text-[#a9bec7]" /><div><div className="text-[10px] font-medium text-white/68">Tickets</div><div className="mt-1 text-[9px] text-white/24">Panels, routing and support</div></div></a>
      </div>

      <section className="ware-rise overflow-hidden rounded-[20px] border border-white/[.06] bg-[#0e1010]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[.05] px-5 py-4"><div><div className="text-[12px] font-semibold text-white/78">Activity trend</div><div className="mt-1 text-[9px] text-white/24">Reduced point count and chart animations disabled for smoother dashboard performance.</div></div><div className="flex rounded-[10px] border border-white/[.055] bg-black/20 p-1">{(["messages", "voice", "members"] as ChartMode[]).map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-[7px] px-3 py-1.5 text-[9px] capitalize ${mode === item ? "bg-white/[.08] text-white/75" : "text-white/25"}`}>{item}</button>)}</div></div>
        <div className="h-[340px] px-2 pb-3 pt-4 md:px-4">{rows.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={rows} margin={{ top: 12, right: 16, left: -18, bottom: 0 }}><defs><linearGradient id="overviewFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a9bec7" stopOpacity={0.18}/><stop offset="100%" stopColor="#a9bec7" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(255,255,255,.035)" strokeDasharray="2 7"/><XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={34} tick={{ fill:"rgba(255,255,255,.20)", fontSize:8 }} dy={9}/><YAxis axisLine={false} tickLine={false} width={48} tick={{ fill:"rgba(255,255,255,.16)", fontSize:8 }}/><Tooltip animationDuration={0} contentStyle={{ background:"#121414", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, fontSize:10 }} labelStyle={{ color:"rgba(255,255,255,.42)" }}/><Area type="linear" dataKey={yKey} name={chartName} stroke="#a9bec7" strokeWidth={1.7} fill="url(#overviewFill)" dot={false} activeDot={{ r:3 }} isAnimationActive={false}/></AreaChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-[10px] text-white/20">No analytics in this range yet.</div>}</div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2"><ChannelTop title="Top message channels" rows={payload?.top_message_channels ?? []} kind="messages"/><ChannelTop title="Top voice channels" rows={payload?.top_voice_channels ?? []} kind="voice"/></div>
      <div className="grid gap-4 xl:grid-cols-2"><Podium title="Most active members" rows={payload?.top_message_members ?? []} kind="messages"/><Podium title="Most voice time" rows={payload?.top_voice_members ?? []} kind="voice"/></div>
    </div>
  </DashboardShell>;
}
