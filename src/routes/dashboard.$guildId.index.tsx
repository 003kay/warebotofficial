import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Activity, ArrowUpRight, Bot, Command, Gauge, Hash, MessageSquare, Mic2,
  Radio, ShieldCheck, Sparkles, TicketCheck, UserMinus, UserPlus, UsersRound, X,
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
  head: () => ({ meta: [{ title: "Overview — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey:["ticketPanel",params.guildId], queryFn:()=>getTicketPanel({ data:{ guildId:params.guildId } }) }),
      context.queryClient.ensureQueryData({ queryKey:["guildAnalytics",params.guildId], queryFn:()=>getGuildAnalytics({ data:{ guildId:params.guildId } }) }),
      context.queryClient.ensureQueryData({ queryKey:["dashboardSettings",params.guildId], queryFn:()=>getDashboardSettings({ data:{ guildId:params.guildId } }) }),
    ]);
    return null;
  },
  component: GuildDashboardHome,
});

type RangeKey = "today" | "7d" | "30d" | "90d" | "6m" | "1y" | "all";
type ChartMode = "messages" | "voice" | "members";
const RANGES: { key:RangeKey; label:string; days:number|null }[] = [
  { key:"today", label:"Today", days:1 }, { key:"7d", label:"7D", days:7 }, { key:"30d", label:"30D", days:30 },
  { key:"90d", label:"3M", days:90 }, { key:"6m", label:"6M", days:183 }, { key:"1y", label:"1Y", days:365 }, { key:"all", label:"All", days:null },
];
const nf = new Intl.NumberFormat("en-US");
const number = (v:number) => nf.format(Math.max(0,Math.round(Number(v||0))));
const hours = (v:number) => `${(Math.max(0,Number(v||0))/3600).toFixed(1)}h`;
const minutes = (v:number) => `${number(Number(v||0)/60)}m`;

function selectedDays(all:AnalyticsDay[], range:RangeKey) {
  const n = RANGES.find(r=>r.key===range)?.days;
  return n == null ? all : all.slice(-n);
}
function labelDate(value:string, year=false) {
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US",{month:"short",day:"numeric",year:year?"2-digit":undefined,timeZone:"UTC"});
}
function chartRows(days:AnalyticsDay[], range:RangeKey) {
  if (!days.length) return [];
  const maxPoints = range === "today" ? 1 : 22;
  const bucket = Math.max(1,Math.ceil(days.length/maxPoints));
  const out:any[] = [];
  for (let i=0;i<days.length;i+=bucket) {
    const chunk = days.slice(i,i+bucket);
    const sum = chunk.reduce((a,d)=>({ messages:a.messages+Number(d.messages||0), reactions:a.reactions+Number(d.reactions||0), commands:a.commands+Number(d.commands||0), voice_seconds:a.voice_seconds+Number(d.voice_seconds||0), joins:a.joins+Number(d.joins||0), leaves:a.leaves+Number(d.leaves||0) }),{messages:0,reactions:0,commands:0,voice_seconds:0,joins:0,leaves:0});
    out.push({...sum,label:labelDate(chunk[0].date,range==="1y"||range==="all"),voice_hours:sum.voice_seconds/3600,net_members:sum.joins-sum.leaves});
  }
  return out;
}

function StatCard({ icon:Icon, label, value, hint, emphasis=false }: { icon:typeof Activity; label:string; value:string; hint:string; emphasis?:boolean }) {
  return <div className={`group relative overflow-hidden rounded-[20px] border p-5 transition-all duration-200 hover:-translate-y-0.5 ${emphasis?"border-[#a9bec7]/[.13] bg-[linear-gradient(145deg,rgba(169,190,199,.065),rgba(255,255,255,.014))]":"border-white/[.06] bg-[#0d0f0f] hover:border-white/[.10] hover:bg-[#101212]"}`}>
    <div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/30">{label}</span><span className="grid h-9 w-9 place-items-center rounded-[11px] border border-white/[.06] bg-white/[.03]"><Icon className="h-4 w-4 text-[#aec1ca]/70"/></span></div>
    <div className="mt-4 text-[30px] font-semibold tracking-[-.05em] text-white/94">{value}</div>
    <div className="mt-1.5 text-[10px] text-white/28">{hint}</div>
  </div>;
}

function QuickAction({ href, icon:Icon, title, detail, status }: { href:string; icon:typeof Activity; title:string; detail:string; status?:string }) {
  return <a href={href} className="group flex items-center gap-3 rounded-[16px] border border-white/[.06] bg-white/[.02] p-4 transition hover:-translate-y-0.5 hover:border-white/[.10] hover:bg-white/[.04]">
    <span className="grid h-10 w-10 place-items-center rounded-[12px] border border-white/[.06] bg-white/[.03]"><Icon className="h-4 w-4 text-white/50"/></span>
    <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[12px] font-semibold text-white/74">{title}</span>{status?<span className="rounded-full border border-white/[.06] bg-white/[.03] px-2 py-0.5 text-[8px] uppercase tracking-[.08em] text-white/32">{status}</span>:null}</div><div className="mt-1 truncate text-[10px] text-white/28">{detail}</div></div>
    <ArrowUpRight className="h-4 w-4 text-white/22 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/55"/>
  </a>;
}

function RankPanel({ title, subtitle, rows, kind, member=false, onMemberClick }: { title:string; subtitle:string; rows:AnalyticsRankRow[]; kind:"messages"|"voice"; member?:boolean; onMemberClick?:(row:AnalyticsRankRow)=>void }) {
  const max = Math.max(1,...rows.slice(0,3).map(r=>Number(r.value||0)));
  return <section className="rounded-[20px] border border-white/[.06] bg-[#0d0f0f] p-5">
    <div className="mb-4 flex items-start justify-between gap-3"><div><div className="text-[14px] font-semibold text-white/78">{title}</div><div className="mt-1 text-[10px] text-white/28">{subtitle}</div></div><span className="rounded-full border border-white/[.06] px-2.5 py-1 text-[8px] uppercase tracking-[.12em] text-white/28">Top 3</span></div>
    <div className="space-y-3">{rows.slice(0,3).map((row,i)=><div key={`${row.id||row.name}-${i}`} className="group rounded-[15px] border border-white/[.05] bg-white/[.017] p-3.5 transition hover:border-white/[.08] hover:bg-white/[.03]">
      <div className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-white/[.04] text-[9px] font-semibold text-white/35">0{i+1}</span>{member ? <button type="button" onClick={()=>onMemberClick?.(row)} disabled={!row.id} className="shrink-0 rounded-full transition hover:scale-105 disabled:cursor-default disabled:hover:scale-100">{row.avatar_url?<img src={row.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/[.10]"/>:<span className="grid h-10 w-10 place-items-center rounded-full bg-white/[.04] ring-1 ring-white/[.07]"><UsersRound className="h-4 w-4 text-white/30"/></span>}</button>:<span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-white/[.03]"><Hash className="h-4 w-4 text-white/28"/></span>}<div className="min-w-0 flex-1"><div className="truncate text-[12px] font-semibold text-white/72">{member?row.name:`#${row.name}`}</div>{row.id?<div className="mt-0.5 truncate font-mono text-[8px] text-white/20">{row.id}</div>:null}</div><div className="text-[10px] font-medium text-white/42">{kind==="messages"?`${number(row.value)} msgs`:member?minutes(row.value):hours(row.value)}</div></div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[.04]"><div className="h-full rounded-full bg-[#9eb4be]/55 transition-all duration-500" style={{width:`${Math.max(5,(Number(row.value||0)/max)*100)}%`}}/></div>
    </div>)}{!rows.length?<div className="grid min-h-28 place-items-center rounded-[13px] border border-dashed border-white/[.06] text-[10px] text-white/22">No ranking data yet</div>:null}</div>
  </section>;
}

function MemberProfileModal({ profile, loading, error, onClose, onRemoveRole }: { profile:AnalyticsMemberProfile|null; loading:boolean; error:string|null; onClose:()=>void; onRemoveRole:(roleId:string)=>Promise<void> }) {
  const [removing,setRemoving] = useState<string|null>(null);
  return <div className="fixed inset-0 z-[800] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-white/[.10] bg-[#0b0c0d] shadow-[0_36px_120px_rgba(0,0,0,.65)]">
      <div className="flex items-center justify-between border-b border-white/[.06] px-5 py-4"><div><div className="text-[11px] uppercase tracking-[.14em] text-white/30">Member profile</div><div className="mt-1 text-[13px] text-white/55">Discord information from this server</div></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl border border-white/[.07] bg-white/[.025] text-white/45 hover:bg-white/[.06] hover:text-white"><X className="h-4 w-4"/></button></div>
      {loading?<div className="grid min-h-[300px] place-items-center text-sm text-white/35">Loading member…</div>:error?<div className="grid min-h-[260px] place-items-center px-6 text-center text-sm text-red-300/70">{error}</div>:profile?<div className="p-5">
        <div className="flex items-center gap-4">{profile.avatarUrl?<img src={profile.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover ring-1 ring-white/[.10]"/>:<div className="grid h-16 w-16 place-items-center rounded-full bg-white/[.04]"><UsersRound className="h-6 w-6 text-white/30"/></div>}<div className="min-w-0"><div className="truncate text-xl font-semibold text-white/90">{profile.displayName}</div><div className="mt-1 text-sm text-white/45">@{profile.username}</div><div className="mt-1 font-mono text-[10px] text-white/25">{profile.id}</div></div><span className={`ml-auto rounded-full border px-2.5 py-1 text-[9px] ${profile.inGuild?"border-emerald-400/15 bg-emerald-400/[.06] text-emerald-300/65":"border-white/[.06] bg-white/[.025] text-white/32"}`}>{profile.inGuild?"In server":"Left server"}</span></div>
        <div className="mt-6 border-t border-white/[.06] pt-5"><div className="mb-3 flex items-center justify-between"><div className="text-sm font-semibold text-white/72">Roles</div><div className="text-[10px] text-white/28">{profile.roles.length} role{profile.roles.length===1?"":"s"}</div></div><div className="flex max-h-[260px] flex-wrap gap-2 overflow-y-auto pr-1">{profile.roles.map(role=><div key={role.id} className="inline-flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2 text-[11px] text-white/62">{role.iconUrl?<img src={role.iconUrl} alt="" className="h-4 w-4 rounded object-contain"/>:role.unicodeEmoji?<span className="text-sm">{role.unicodeEmoji}</span>:<span className="h-2.5 w-2.5 rounded-full border border-white/[.08]" style={{backgroundColor:role.color?`#${role.color.toString(16).padStart(6,"0")}`:"#4b4d50"}}/>}<span>{role.name}</span>{profile.inGuild&&!role.managed?<button disabled={removing===role.id} onClick={async()=>{setRemoving(role.id);try{await onRemoveRole(role.id);}finally{setRemoving(null);}}} title="Remove role" className="ml-1 grid h-5 w-5 place-items-center rounded-md text-white/28 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-30"><X className="h-3 w-3"/></button>:null}</div>)}{!profile.roles.length?<div className="text-xs text-white/28">No server roles to show.</div>:null}</div></div>
      </div>:null}
    </div>
  </div>;
}

function GuildDashboardHome() {
  const { guildId } = Route.useParams();
  const [range,setRange] = useState<RangeKey>("7d");
  const [mode,setMode] = useState<ChartMode>("messages");
  const [profile,setProfile] = useState<AnalyticsMemberProfile|null>(null);
  const [profileOpen,setProfileOpen] = useState(false);
  const [profileLoading,setProfileLoading] = useState(false);
  const [profileError,setProfileError] = useState<string|null>(null);
  const { data:tickets } = useSuspenseQuery({ queryKey:["ticketPanel",guildId], queryFn:()=>getTicketPanel({data:{guildId}}) });
  const { data:analytics } = useSuspenseQuery({ queryKey:["guildAnalytics",guildId], queryFn:()=>getGuildAnalytics({data:{guildId}}), refetchInterval:60_000 });
  const { data:settings } = useSuspenseQuery({ queryKey:["dashboardSettings",guildId], queryFn:()=>getDashboardSettings({data:{guildId}}) });
  const payload = analytics.payload;
  const all = useMemo(()=>[...(payload?.days??[])].sort((a,b)=>a.date.localeCompare(b.date)),[payload?.days]);
  const days = useMemo(()=>selectedDays(all,range),[all,range]);
  const rows = useMemo(()=>chartRows(days,range),[days,range]);
  const totals = useMemo(()=>days.reduce((a,d)=>({messages:a.messages+d.messages,reactions:a.reactions+d.reactions,voice_seconds:a.voice_seconds+d.voice_seconds,joins:a.joins+d.joins,leaves:a.leaves+d.leaves,commands:a.commands+d.commands}),{messages:0,reactions:0,voice_seconds:0,joins:0,leaves:0,commands:0}),[days]);
  const joinGate = (settings.settings.joinGate as Record<string,unknown>|undefined)??{};
  const yKey = mode==="messages"?"messages":mode==="voice"?"voice_hours":"net_members";
  const chartName = mode==="messages"?"Messages":mode==="voice"?"Voice hours":"Net members";
  const engagement = totals.messages + totals.reactions + totals.commands;

  const openMember = async (row:AnalyticsRankRow) => {
    if (!row.id) return;
    setProfileOpen(true); setProfileLoading(true); setProfile(null); setProfileError(null);
    try { setProfile(await getAnalyticsMemberProfile({data:{guildId,userId:row.id}})); }
    catch (e) { setProfileError(e instanceof Error?e.message:"Could not load this member."); }
    finally { setProfileLoading(false); }
  };
  const removeRole = async (roleId:string) => {
    if (!profile) return;
    try {
      await removeAnalyticsMemberRole({data:{guildId,userId:profile.id,roleId}});
      setProfile({...profile,roles:profile.roles.filter(r=>r.id!==roleId)});
    } catch(e) { setProfileError(e instanceof Error?e.message:"Could not remove that role."); }
  };

  return <DashboardShell guild={tickets.guild} guildId={guildId} active="home">
    <style>{`@keyframes overviewIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}.overview-in{animation:overviewIn .28s ease both}@media(prefers-reduced-motion:reduce){.overview-in{animation:none!important;transition:none!important}}`}</style>
    <div className="mx-auto max-w-[1560px] space-y-5 pb-12">
      <section className="overview-in relative overflow-hidden rounded-[24px] border border-white/[.065] bg-[linear-gradient(135deg,#0d0f0f,#090b0b)] p-6 md:p-7"><div className="pointer-events-none absolute right-[-80px] top-[-90px] h-72 w-72 rounded-full bg-[#a8bec8]/[.05] blur-[90px]"/><div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="flex items-center gap-4">{tickets.guild.iconUrl?<img src={tickets.guild.iconUrl} alt="" className="h-16 w-16 rounded-[18px] object-cover ring-1 ring-white/[.10]"/>:<div className="grid h-16 w-16 place-items-center rounded-[18px] border border-white/[.07] bg-white/[.03]"><Bot className="h-6 w-6 text-white/38"/></div>}<div><div className="flex items-center gap-2 text-[10px] text-white/30"><Radio className="h-3 w-3"/><span className={`h-1.5 w-1.5 rounded-full ${analytics.connected?"bg-emerald-400":"bg-amber-300"}`}/>{analytics.connected?"Live telemetry connected":"Waiting for telemetry"}</div><h1 className="mt-1.5 text-[32px] font-semibold tracking-[-.05em] text-white/94">{tickets.guild.name}</h1><p className="mt-1 text-[11px] text-white/28">Activity, growth, protection and community health in one place.</p></div></div><div className="flex flex-wrap gap-1 rounded-[13px] border border-white/[.06] bg-black/20 p-1">{RANGES.map(item=><button key={item.key} onClick={()=>setRange(item.key)} className={`rounded-[9px] px-3.5 py-2.5 text-[10px] font-medium transition ${range===item.key?"bg-white/[.09] text-white/80 shadow-sm":"text-white/28 hover:bg-white/[.035] hover:text-white/58"}`}>{item.label}</button>)}</div></div></section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={MessageSquare} label="Messages" value={number(totals.messages)} hint="Messages in selected range" emphasis/><StatCard icon={Mic2} label="Voice activity" value={hours(totals.voice_seconds)} hint="Completed voice time"/><StatCard icon={UsersRound} label="Members" value={number(payload?.member_count??0)} hint="Current server population"/><StatCard icon={Gauge} label="Engagement" value={number(engagement)} hint="Messages + reactions + commands"/></div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_.55fr]"><section className="overview-in overflow-hidden rounded-[22px] border border-white/[.065] bg-[#0d0f0f]"><div className="flex flex-col gap-3 border-b border-white/[.05] px-5 py-4 md:flex-row md:items-center md:justify-between"><div><div className="text-[14px] font-semibold text-white/78">Activity</div><div className="mt-1 text-[10px] text-white/28">Telemetry trend for the selected period</div></div><div className="flex w-fit rounded-[10px] border border-white/[.06] bg-black/20 p-1">{(["messages","voice","members"] as ChartMode[]).map(item=><button key={item} onClick={()=>setMode(item)} className={`rounded-[7px] px-3.5 py-2 text-[10px] capitalize transition ${mode===item?"bg-white/[.09] text-white/75":"text-white/28 hover:text-white/52"}`}>{item}</button>)}</div></div><div className="h-[350px] px-2 pb-3 pt-4 md:px-4">{rows.length?<ResponsiveContainer width="100%" height="100%"><AreaChart data={rows} margin={{top:10,right:12,left:-22,bottom:0}}><defs><linearGradient id="wareOverviewFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a9bec7" stopOpacity={0.18}/><stop offset="100%" stopColor="#a9bec7" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(255,255,255,.03)"/><XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={34} tick={{fill:"rgba(255,255,255,.24)",fontSize:9}} dy={8}/><YAxis axisLine={false} tickLine={false} width={48} tick={{fill:"rgba(255,255,255,.20)",fontSize:9}}/><Tooltip animationDuration={0} cursor={{stroke:"rgba(255,255,255,.06)"}} contentStyle={{background:"#101212",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,fontSize:10,boxShadow:"0 18px 50px rgba(0,0,0,.35)"}} labelStyle={{color:"rgba(255,255,255,.45)"}}/><Area type="monotone" dataKey={yKey} name={chartName} stroke="#a9bec7" strokeWidth={1.8} fill="url(#wareOverviewFill)" dot={false} activeDot={{r:3,fill:"#d7e0e4"}} isAnimationActive={false}/></AreaChart></ResponsiveContainer>:<div className="grid h-full place-items-center"><div className="text-center"><Sparkles className="mx-auto h-5 w-5 text-white/14"/><div className="mt-2 text-[10px] text-white/22">No analytics in this range yet</div></div></div>}</div></section><section className="overview-in rounded-[22px] border border-white/[.065] bg-[#0d0f0f] p-5"><div className="mb-4"><div className="text-[14px] font-semibold text-white/78">Server controls</div><div className="mt-1 text-[10px] text-white/28">Jump into the areas that matter</div></div><div className="space-y-2.5"><QuickAction href={`/dashboard/${guildId}/security`} icon={ShieldCheck} title="Security Center" detail="Protection, AutoMod and anti-nuke" status="Protected"/><QuickAction href={`/dashboard/${guildId}/join-gate`} icon={Activity} title="Join Gate" detail="Screen new members before access" status={Boolean(joinGate.enabled)?"On":"Off"}/><QuickAction href={`/dashboard/${guildId}/tickets`} icon={TicketCheck} title="Ticket Designer" detail="Panels, routing and support flows"/><QuickAction href={`/dashboard/${guildId}/logging`} icon={Radio} title="Logging" detail="Audit server events and destinations"/></div></section></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={Command} label="Commands" value={number(totals.commands)} hint="Successful command uses"/><StatCard icon={UserPlus} label="Joined" value={number(totals.joins)} hint="Members joined"/><StatCard icon={UserMinus} label="Left" value={number(totals.leaves)} hint="Members left"/><StatCard icon={Activity} label="Net growth" value={`${totals.joins-totals.leaves>=0?"+":""}${number(Math.abs(totals.joins-totals.leaves))}`} hint="Join / leave difference"/></div>

      <div className="grid gap-4 xl:grid-cols-2"><RankPanel title="Top message channels" subtitle="Channels carrying the most conversation" rows={payload?.top_message_channels??[]} kind="messages"/><RankPanel title="Top voice channels" subtitle="Voice channels with the most completed time" rows={payload?.top_voice_channels??[]} kind="voice"/></div>
      <div className="grid gap-4 xl:grid-cols-2"><RankPanel title="Most active members" subtitle="Members with the most messages" rows={payload?.top_message_members??[]} kind="messages" member onMemberClick={openMember}/><RankPanel title="Most voice time" subtitle="Members spending the most time in voice" rows={payload?.top_voice_members??[]} kind="voice" member onMemberClick={openMember}/></div>
    </div>
    {profileOpen?<MemberProfileModal profile={profile} loading={profileLoading} error={profileError} onClose={()=>{setProfileOpen(false);setProfileError(null);}} onRemoveRole={removeRole}/>:null}
  </DashboardShell>;
}