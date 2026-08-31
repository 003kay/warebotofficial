import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Activity, AlertTriangle, ArrowUpRight, Bot, CalendarDays, Command, Gauge, Hash,
  MessageSquare, Mic2, Radio, ShieldCheck, Sparkles, TicketCheck, UserMinus,
  UserPlus, UsersRound, X,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getTicketPanel } from "@/lib/dashboard.functions";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
import {
  getGuildAnalytics, getAnalyticsMemberProfile, removeAnalyticsMemberRole,
  type AnalyticsDay, type AnalyticsRankRow, type AnalyticsMemberProfile,
} from "@/lib/analytics.functions";

export const Route = createFileRoute("/dashboard/$guildId/")({
  head: () => ({ meta: [{ title: "Overview" }] }),
  loader: async ({ context, params }) => {
    await Promise.allSettled([
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
  { key: "today", label: "Today", days: 1 }, { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 }, { key: "90d", label: "3M", days: 90 },
  { key: "6m", label: "6M", days: 183 }, { key: "1y", label: "1Y", days: 365 },
  { key: "all", label: "All", days: null },
];

const nf = new Intl.NumberFormat("en-US");
const number = (value: number) => nf.format(Math.max(0, Math.round(Number(value || 0))));

function duration(seconds: number) {
  let total = Math.max(0, Math.round(Number(seconds || 0)));
  const days = Math.floor(total / 86400); total %= 86400;
  const hours = Math.floor(total / 3600); total %= 3600;
  const minutes = Math.floor(total / 60);
  if (days) return `${days}d ${hours}h${minutes ? ` ${minutes}m` : ""}`;
  if (hours) return `${hours}h${minutes ? ` ${minutes}m` : ""}`;
  return `${Math.max(1, minutes)}m`;
}

function fullDate(value: string | null | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function timeSince(value: string | null | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));
  if (days >= 365) { const years = Math.floor(days / 365); return `${years} year${years === 1 ? "" : "s"}`; }
  if (days >= 30) { const months = Math.floor(days / 30); return `${months} month${months === 1 ? "" : "s"}`; }
  return `${days} day${days === 1 ? "" : "s"}`;
}

function selectedDays(all: AnalyticsDay[], range: RangeKey) {
  const count = RANGES.find((entry) => entry.key === range)?.days;
  return count == null ? all : all.slice(-count);
}

function chartRows(days: AnalyticsDay[], range: RangeKey) {
  if (!days.length) return [];
  const maxPoints = range === "today" ? 1 : 22;
  const bucket = Math.max(1, Math.ceil(days.length / maxPoints));
  const output: Array<Record<string, number | string>> = [];
  for (let index = 0; index < days.length; index += bucket) {
    const chunk = days.slice(index, index + bucket);
    const sum = chunk.reduce((a, d) => ({ messages: a.messages + Number(d.messages || 0), reactions: a.reactions + Number(d.reactions || 0), commands: a.commands + Number(d.commands || 0), voice_seconds: a.voice_seconds + Number(d.voice_seconds || 0), joins: a.joins + Number(d.joins || 0), leaves: a.leaves + Number(d.leaves || 0) }), { messages: 0, reactions: 0, commands: 0, voice_seconds: 0, joins: 0, leaves: 0 });
    const date = new Date(`${chunk[0].date}T00:00:00Z`);
    output.push({ ...sum, label: Number.isNaN(date.getTime()) ? chunk[0].date : date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }), voice_hours: sum.voice_seconds / 3600, net_members: sum.joins - sum.leaves });
  }
  return output;
}

function StatCard({ icon: Icon, label, value, hint, accent = false }: { icon: typeof Activity; label: string; value: string; hint: string; accent?: boolean }) {
  return <div className={`group rounded-[20px] border p-5 transition-all duration-300 hover:-translate-y-1 ${accent ? "border-[#6677d2]/18 bg-[linear-gradient(145deg,rgba(73,88,160,.13),rgba(13,24,28,.55))]" : "border-white/[.06] bg-[#0d0f0f] hover:border-white/[.11] hover:bg-[#101313]"}`}>
    <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-white/30">{label}</span><span className="grid h-9 w-9 place-items-center rounded-[11px] border border-white/[.06] bg-white/[.03]"><Icon className={`h-4 w-4 ${accent ? "text-[#9aaaf0]" : "text-[#99b4bd]/70"}`} /></span></div>
    <div className="mt-4 text-[31px] font-bold tracking-[-.05em] text-white/95">{value}</div><div className="mt-1.5 text-[10px] font-medium text-white/28">{hint}</div>
  </div>;
}

function RankPanel({ title, subtitle, rows, kind, member = false, onMemberClick }: { title: string; subtitle: string; rows: AnalyticsRankRow[]; kind: "messages" | "voice"; member?: boolean; onMemberClick?: (row: AnalyticsRankRow) => void }) {
  const max = Math.max(1, ...rows.slice(0, 3).map((row) => Number(row.value || 0)));
  return <section className="rounded-[22px] border border-white/[.065] bg-[#0d0f0f] p-5">
    <div className="mb-4 flex items-start justify-between gap-3"><div><div className="text-[14px] font-bold text-white/82">{title}</div><div className="mt-1 text-[10px] font-medium text-white/28">{subtitle}</div></div><span className="rounded-full border border-white/[.06] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-white/28">Top 3</span></div>
    <div className="space-y-3">{rows.slice(0, 3).map((row, index) => {
      const rowId = row.id || (/^\d{15,22}$/.test(String(row.name || "")) ? String(row.name) : undefined);
      const interactive = Boolean(member && rowId && onMemberClick);
      return <div key={`${rowId || row.name}-${index}`} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined} onClick={() => interactive && onMemberClick?.({ ...row, id: rowId })} onKeyDown={(event) => { if (interactive && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onMemberClick?.({ ...row, id: rowId }); } }} className={`group/row relative overflow-hidden rounded-[16px] border border-white/[.055] bg-white/[.018] transition-all duration-250 ${interactive ? "cursor-pointer hover:-translate-y-0.5 hover:scale-[1.008] hover:border-[#7080d5]/25 hover:bg-[#5363af]/[.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7182dd]/35" : ""}`}>
        <div className="flex items-center gap-3 p-3.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white/[.04] text-[9px] font-bold text-white/35">0{index + 1}</span>{member ? (row.avatar_url ? <img src={row.avatar_url} alt="" className={`h-11 w-11 rounded-full object-cover ring-1 ring-white/[.10] transition duration-300 ${interactive ? "group-hover/row:scale-110 group-hover/row:ring-[#8c9ae7]/35" : ""}`} /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-white/[.04] ring-1 ring-white/[.07]"><UsersRound className="h-4 w-4 text-white/30" /></span>) : <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-white/[.03]"><Hash className="h-4 w-4 text-white/28" /></span>}<div className="min-w-0 flex-1"><div className={`truncate text-[12px] font-bold transition ${interactive ? "text-white/78 group-hover/row:text-white" : "text-white/72"}`}>{member ? row.name : row.name === "deleted-channel" ? "#deleted-channel" : `#${row.name}`}</div>{rowId ? <div className="mt-0.5 truncate font-mono text-[8px] text-white/20">{rowId}</div> : null}</div><div className="text-[10px] font-bold text-white/44">{kind === "messages" ? `${number(row.value)} msgs` : duration(row.value)}</div>{interactive ? <ArrowUpRight className="h-4 w-4 -translate-x-1 text-white/0 transition duration-250 group-hover/row:translate-x-0 group-hover/row:text-[#a8b4ef]/70" /> : null}</div>
        <div className="mx-3.5 mb-3.5 h-1.5 overflow-hidden rounded-full bg-white/[.04]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#7383d4,#6f9ea4)] opacity-65 transition-all duration-500" style={{ width: `${Math.max(5, (Number(row.value || 0) / max) * 100)}%` }} /></div>
      </div>;
    })}{!rows.length ? <div className="grid min-h-28 place-items-center rounded-[13px] border border-dashed border-white/[.06] text-[10px] text-white/22">No ranking data yet</div> : null}</div>
  </section>;
}

function MemberProfileModal({ profile, loading, error, onClose, onRemoveRole }: { profile: AnalyticsMemberProfile | null; loading: boolean; error: string | null; onClose: () => void; onRemoveRole: (roleId: string) => Promise<void> }) {
  const [removing, setRemoving] = useState<string | null>(null);
  return <div className="fixed inset-0 z-[800] grid place-items-center bg-black/82 p-4 backdrop-blur-lg" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="w-full max-w-[640px] overflow-hidden rounded-[30px] border border-white/[.10] bg-[#090b0d] shadow-[0_40px_150px_rgba(0,0,0,.78)]">
      <div className="relative h-24 border-b border-white/[.055] bg-[radial-gradient(circle_at_18%_0%,rgba(91,105,188,.24),transparent_42%),linear-gradient(110deg,#10131a,#0b1114)]"><div className="absolute left-6 top-5"><div className="text-[9px] font-bold uppercase tracking-[.20em] text-white/28">Ware member profile</div><div className="mt-1 text-[11px] font-semibold text-white/38">Live Discord server data</div></div><button type="button" onClick={onClose} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/[.09] bg-black/20 text-white/45 transition hover:rotate-90 hover:bg-white/[.07] hover:text-white"><X className="h-4 w-4" /></button></div>
      {loading ? <div className="grid min-h-[330px] place-items-center"><div className="text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-[#8492df]" /><div className="mt-3 text-[11px] font-semibold text-white/32">Loading Discord profile…</div></div></div> : error ? <div className="grid min-h-[300px] place-items-center px-8 text-center"><div><AlertTriangle className="mx-auto h-7 w-7 text-amber-300/75" /><div className="mt-3 text-[15px] font-bold text-white/82">Couldn’t load this user</div><div className="mt-1 text-[11px] font-medium text-white/34">{error}</div></div></div> : profile ? <div className="px-6 pb-6">
        <div className="-mt-8 flex items-end gap-4">{profile.avatarUrl ? <img src={profile.avatarUrl} className="h-[82px] w-[82px] rounded-full border-[5px] border-[#090b0d] object-cover ring-1 ring-white/[.12]" alt="" /> : <div className="grid h-[82px] w-[82px] place-items-center rounded-full border-[5px] border-[#090b0d] bg-[#16191d] ring-1 ring-white/[.10]"><UsersRound className="h-7 w-7 text-white/28" /></div>}<div className="min-w-0 flex-1 pb-1"><div className="truncate text-[23px] font-black tracking-[-.035em] text-white/95">{profile.displayName}</div><div className="mt-0.5 text-[12px] font-bold text-white/45">@{profile.username}</div></div><span className={`mb-2 rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] ${profile.inGuild ? "border-emerald-400/[.16] bg-emerald-400/[.055] text-emerald-300/75" : "border-amber-300/[.16] bg-amber-300/[.055] text-amber-200/75"}`}>{profile.inGuild ? "In server" : "Left server"}</span></div>
        {!profile.inGuild ? <div className="mt-5 rounded-[16px] border border-amber-300/[.16] bg-amber-300/[.045] px-4 py-3.5 text-[12px] font-bold text-amber-100/80">⚠️ {profile.username} is not in this server anymore.</div> : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-[15px] border border-white/[.06] bg-white/[.02] p-4"><div className="text-[9px] font-bold uppercase tracking-[.12em] text-white/25">User ID</div><div className="mt-2 break-all font-mono text-[10px] font-semibold text-white/58">{profile.id}</div></div><div className="rounded-[15px] border border-white/[.06] bg-white/[.02] p-4"><div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-white/25"><CalendarDays className="h-3 w-3" />Discord since</div><div className="mt-2 text-[11px] font-bold text-white/68">{fullDate(profile.joinedDiscordAt)}</div><div className="mt-1 text-[9px] text-white/25">{timeSince(profile.joinedDiscordAt)}</div></div><div className="rounded-[15px] border border-white/[.06] bg-white/[.02] p-4"><div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-white/25"><CalendarDays className="h-3 w-3" />Server since</div><div className="mt-2 text-[11px] font-bold text-white/68">{profile.inGuild ? fullDate(profile.joinedServerAt) : "Not in server"}</div><div className="mt-1 text-[9px] text-white/25">{profile.inGuild ? timeSince(profile.joinedServerAt) : "Historical data"}</div></div></div>
        <div className="mt-5 border-t border-white/[.06] pt-5"><div className="mb-3 flex items-center justify-between"><div><div className="text-[14px] font-black text-white/80">Server roles</div><div className="mt-0.5 text-[9px] text-white/25">Role icons and colors are pulled live from Discord</div></div><span className="rounded-full border border-white/[.06] bg-white/[.025] px-2.5 py-1 text-[9px] font-bold text-white/35">{profile.roles.length}</span></div><div className="flex max-h-[250px] flex-wrap gap-2 overflow-y-auto pr-1">{profile.roles.map((role) => <div key={role.id} className="group/role inline-flex items-center gap-2 rounded-full border border-white/[.075] bg-white/[.025] px-3 py-2 text-[10px] font-bold text-white/67 transition hover:border-white/[.13] hover:bg-white/[.045]">{role.iconUrl ? <img src={role.iconUrl} className="h-4 w-4 rounded object-contain" alt="" /> : role.unicodeEmoji ? <span>{role.unicodeEmoji}</span> : <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: role.color ? `#${role.color.toString(16).padStart(6, "0")}` : "#55585c" }} />}<span>{role.name}</span>{profile.inGuild && !role.managed ? <button type="button" disabled={removing === role.id} onClick={async () => { setRemoving(role.id); try { await onRemoveRole(role.id); } finally { setRemoving(null); } }} className="ml-1 grid h-5 w-5 place-items-center rounded-full text-white/25 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30" title="Remove role"><X className="h-3 w-3" /></button> : null}</div>)}{!profile.roles.length ? <div className="rounded-[14px] border border-dashed border-white/[.06] px-4 py-5 text-[10px] text-white/27">No server roles to show.</div> : null}</div></div>
      </div> : null}
    </div>
  </div>;
}

function GuildDashboardHome() {
  const { guildId } = Route.useParams();
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeKey>("7d");
  const [mode, setMode] = useState<ChartMode>("messages");
  const [profile, setProfile] = useState<AnalyticsMemberProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const ticketsQuery = useQuery({ queryKey: ["ticketPanel", guildId], queryFn: () => getTicketPanel({ data: { guildId } }), retry: 3 });
  const settingsQuery = useQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }), retry: 3 });
  const analyticsQuery = useQuery({ queryKey: ["guildAnalytics", guildId], queryFn: () => getGuildAnalytics({ data: { guildId } }), refetchInterval: 1000, refetchIntervalInBackground: true, refetchOnWindowFocus: true, staleTime: 0, retry: 2 });

  if (!ticketsQuery.data || !settingsQuery.data || !analyticsQuery.data) return <div className="grid min-h-[65vh] place-items-center"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#8492df]" /><div className="mt-3 text-[11px] font-bold text-white/35">Loading dashboard…</div></div></div>;

  const tickets = ticketsQuery.data;
  const settings = settingsQuery.data;
  const analytics = analyticsQuery.data;
  const payload = analytics.payload;
  const all = useMemo(() => [...(payload?.days ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [payload?.days]);
  const days = useMemo(() => selectedDays(all, range), [all, range]);
  const rows = useMemo(() => chartRows(days, range), [days, range]);
  const totals = useMemo(() => days.reduce((a, d) => ({ messages: a.messages + d.messages, reactions: a.reactions + d.reactions, voice_seconds: a.voice_seconds + d.voice_seconds, joins: a.joins + d.joins, leaves: a.leaves + d.leaves, commands: a.commands + d.commands }), { messages: 0, reactions: 0, voice_seconds: 0, joins: 0, leaves: 0, commands: 0 }), [days]);
  const joinGate = (settings.settings.joinGate as Record<string, unknown> | undefined) ?? {};
  const yKey = mode === "messages" ? "messages" : mode === "voice" ? "voice_hours" : "net_members";
  const chartName = mode === "messages" ? "Messages" : mode === "voice" ? "Voice hours" : "Net members";

  async function openMember(row: AnalyticsRankRow) {
    const userId = row.id || (/^\d{15,22}$/.test(String(row.name || "")) ? String(row.name) : "");
    if (!userId) return;
    setProfileOpen(true); setProfileLoading(true); setProfile(null); setProfileError(null);
    try { setProfile(await getAnalyticsMemberProfile({ data: { guildId, userId } })); }
    catch (error) { setProfileError(error instanceof Error ? error.message : "Could not load this member."); }
    finally { setProfileLoading(false); }
  }

  async function removeRole(roleId: string) {
    if (!profile) return;
    try { await removeAnalyticsMemberRole({ data: { guildId, userId: profile.id, roleId } }); setProfile({ ...profile, roles: profile.roles.filter((role) => role.id !== roleId) }); }
    catch (error) { setProfileError(error instanceof Error ? error.message : "Could not remove that role."); }
  }

  const go = (path: string) => navigate({ to: path as never });
  return <DashboardShell guild={tickets.guild} guildId={guildId} active="home">
    <div className="mx-auto max-w-[1580px] space-y-5 pb-12">
      <section className="relative overflow-hidden rounded-[25px] border border-white/[.07] bg-[linear-gradient(135deg,#0f1218,#0a0d10_55%,#0b1113)] p-6 md:p-7"><div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#5968ba]/10 blur-[95px]" /><div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="flex items-center gap-4">{tickets.guild.iconUrl ? <img src={tickets.guild.iconUrl} alt="" className="h-[68px] w-[68px] rounded-[20px] object-cover ring-1 ring-white/[.11]" /> : <div className="grid h-[68px] w-[68px] place-items-center rounded-[20px] border border-white/[.07] bg-white/[.03]"><Bot className="h-7 w-7 text-white/38" /></div>}<div><div className="flex items-center gap-2 text-[10px] font-bold text-white/30"><Radio className="h-3 w-3" /><span className={`h-1.5 w-1.5 rounded-full ${analytics.connected ? "bg-emerald-400" : "bg-amber-300"}`} />{analytics.connected ? "Live telemetry · refreshing every second" : "Waiting for Ware telemetry"}</div><h1 className="mt-1.5 text-[34px] font-black tracking-[-.055em] text-white/95">{tickets.guild.name}</h1><p className="mt-1 text-[11px] font-medium text-white/30">Everything Ware knows about your server, live.</p></div></div><div className="flex flex-wrap gap-1 rounded-[14px] border border-white/[.065] bg-black/25 p-1">{RANGES.map((item) => <button type="button" key={item.key} onClick={() => setRange(item.key)} className={`rounded-[9px] px-3.5 py-2.5 text-[10px] font-bold transition ${range === item.key ? "bg-[#5c6abb]/18 text-[#c8d0ff]" : "text-white/28 hover:bg-white/[.04] hover:text-white/62"}`}>{item.label}</button>)}</div></div></section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={MessageSquare} label="Messages" value={number(totals.messages)} hint="Messages in selected range" accent /><StatCard icon={Mic2} label="Voice activity" value={duration(totals.voice_seconds)} hint="Completed voice time" /><StatCard icon={UsersRound} label="Members" value={number(payload?.member_count ?? 0)} hint="Current server population" /><StatCard icon={Gauge} label="Engagement" value={number(totals.messages + totals.reactions + totals.commands)} hint="Messages + reactions + commands" /></div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_.55fr]"><section className="overflow-hidden rounded-[22px] border border-white/[.065] bg-[#0d0f0f]"><div className="flex flex-col gap-3 border-b border-white/[.05] px-5 py-4 md:flex-row md:items-center md:justify-between"><div><div className="text-[14px] font-bold text-white/80">Activity</div><div className="mt-1 text-[10px] font-medium text-white/28">Live server telemetry for the selected period</div></div><div className="flex w-fit rounded-[10px] border border-white/[.06] bg-black/20 p-1">{(["messages", "voice", "members"] as ChartMode[]).map((item) => <button type="button" key={item} onClick={() => setMode(item)} className={`rounded-[7px] px-3.5 py-2 text-[10px] font-bold capitalize transition ${mode === item ? "bg-[#5c6abb]/16 text-[#c5cdfc]" : "text-white/28 hover:text-white/55"}`}>{item}</button>)}</div></div><div className="h-[340px] px-2 pb-3 pt-4 md:px-4">{rows.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={rows} margin={{ top: 10, right: 12, left: -22, bottom: 0 }}><defs><linearGradient id="wareOverviewFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7282d1" stopOpacity={0.28} /><stop offset="100%" stopColor="#7282d1" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(255,255,255,.03)" /><XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={34} tick={{ fill: "rgba(255,255,255,.24)", fontSize: 9 }} dy={8} /><YAxis axisLine={false} tickLine={false} width={48} tick={{ fill: "rgba(255,255,255,.20)", fontSize: 9 }} /><Tooltip animationDuration={0} cursor={{ stroke: "rgba(255,255,255,.06)" }} contentStyle={{ background: "#101216", border: "1px solid rgba(255,255,255,.07)", borderRadius: 11, fontSize: 10 }} /><Area type="monotone" dataKey={yKey} name={chartName} stroke="#8290db" strokeWidth={2} fill="url(#wareOverviewFill)" dot={false} activeDot={{ r: 3, fill: "#ccd3ff" }} isAnimationActive={false} /></AreaChart></ResponsiveContainer> : <div className="grid h-full place-items-center text-[10px] text-white/22">No analytics in this range yet</div>}</div></section><section className="rounded-[22px] border border-white/[.065] bg-[#0d0f0f] p-5"><div className="mb-4"><div className="text-[14px] font-bold text-white/80">Server controls</div><div className="mt-1 text-[10px] text-white/28">Open tools without a hard page refresh</div></div><div className="space-y-2.5">{[[ShieldCheck,"Security Center","Protection, AutoMod and anti-nuke",`/dashboard/${guildId}/security`],[Activity,"Join Gate",`Screen new members · ${Boolean(joinGate.enabled) ? "On" : "Off"}`,`/dashboard/${guildId}/join-gate`],[TicketCheck,"Ticket Designer","Panels, routing and support flows",`/dashboard/${guildId}/tickets`],[Radio,"Logging","Audit events and destinations",`/dashboard/${guildId}/logging`]].map(([Icon,title,detail,path]) => { const IconComponent = Icon as typeof Activity; return <button type="button" key={String(title)} onClick={() => go(String(path))} className="group flex w-full items-center gap-3 rounded-[16px] border border-white/[.06] bg-white/[.02] p-4 text-left transition hover:-translate-y-0.5 hover:border-[#6677d2]/18 hover:bg-[#5363af]/[.07]"><span className="grid h-10 w-10 place-items-center rounded-[12px] border border-white/[.06] bg-white/[.03]"><IconComponent className="h-4 w-4 text-[#9ba9e7]/65" /></span><div className="min-w-0 flex-1"><div className="text-[12px] font-bold text-white/76">{String(title)}</div><div className="mt-1 truncate text-[10px] text-white/28">{String(detail)}</div></div><ArrowUpRight className="h-4 w-4 text-white/22 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/60" /></button>; })}</div></section></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Command} label="Commands" value={number(totals.commands)} hint="Successful command uses" /><StatCard icon={UserPlus} label="Joined" value={number(totals.joins)} hint="Members joined" /><StatCard icon={UserMinus} label="Left" value={number(totals.leaves)} hint="Members left" /><StatCard icon={Activity} label="Net growth" value={`${totals.joins - totals.leaves >= 0 ? "+" : "-"}${number(Math.abs(totals.joins - totals.leaves))}`} hint="Join / leave difference" /></div>

      <div id="leaderboard" className="scroll-mt-24 space-y-4"><div className="flex items-end justify-between px-1"><div><div className="text-[16px] font-black text-white/82">Leaderboards</div><div className="mt-1 text-[10px] font-medium text-white/28">Hover a member card — the motion and arrow show it can be opened.</div></div></div><div className="grid gap-4 xl:grid-cols-2"><RankPanel title="Top message channels" subtitle="Channels carrying the most conversation" rows={payload?.top_message_channels ?? []} kind="messages" /><RankPanel title="Top voice channels" subtitle="Voice channels with the most completed time" rows={payload?.top_voice_channels ?? []} kind="voice" /></div><div className="grid gap-4 xl:grid-cols-2"><RankPanel title="Most active members" subtitle="Click a member to open their live Discord profile" rows={payload?.top_message_members ?? []} kind="messages" member onMemberClick={openMember} /><RankPanel title="Most voice time" subtitle="Click a member to open their live Discord profile" rows={payload?.top_voice_members ?? []} kind="voice" member onMemberClick={openMember} /></div></div>
    </div>
    {profileOpen ? <MemberProfileModal profile={profile} loading={profileLoading} error={profileError} onClose={() => { setProfileOpen(false); setProfileError(null); }} onRemoveRole={removeRole} /> : null}
  </DashboardShell>;
}
