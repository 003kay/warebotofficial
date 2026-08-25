import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BarChart3, Hash, Mic2, TerminalSquare } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
import { getGuildAnalytics } from "@/lib/analytics.functions";

export const Route = createFileRoute("/dashboard/$guildId/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await Promise.all([
    context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }),
    context.queryClient.ensureQueryData({ queryKey: ["guildAnalytics", params.guildId], queryFn: () => getGuildAnalytics({ data: { guildId: params.guildId } }) }),
  ]); return null; },
  component: Page,
});

function Board({ title, icon: Icon, rows, unit }: { title: string; icon: typeof Hash; rows: { id?: string; name: string; value: number }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => Number(r.value || 0)));
  return <section className="overflow-hidden rounded-2xl border border-white/[0.055] bg-[#101212]">
    <div className="flex items-center gap-2 border-b border-white/[0.05] px-5 py-4"><Icon className="h-4 w-4 text-white/35" /><h2 className="text-[12px] font-semibold text-white/75">{title}</h2></div>
    <div className="p-3">{rows.length ? rows.slice(0, 15).map((row, i) => <div key={`${row.id || row.name}-${i}`} className="mb-1.5 flex items-center gap-3 rounded-xl bg-white/[0.02] px-3 py-3 last:mb-0">
      <div className={`grid h-7 w-7 place-items-center rounded-lg text-[10px] font-bold ${i === 0 ? "bg-amber-300/12 text-amber-200" : i === 1 ? "bg-white/[0.06] text-white/60" : i === 2 ? "bg-orange-300/10 text-orange-200/70" : "text-white/25"}`}>{i + 1}</div>
      <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className="truncate text-[11px] font-medium text-white/65">{row.name}</span><span className="shrink-0 text-[10px] text-white/32">{new Intl.NumberFormat().format(row.value)} {unit}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.04]"><div className="h-full rounded-full bg-[#a9c0cb]/55" style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} /></div></div>
    </div>) : <div className="grid min-h-48 place-items-center text-[10px] text-white/22">Waiting for Ware telemetry.</div>}</div>
  </section>;
}

function Page() {
  const { guildId } = Route.useParams();
  const { data: server } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const { data: analytics } = useSuspenseQuery({ queryKey: ["guildAnalytics", guildId], queryFn: () => getGuildAnalytics({ data: { guildId } }), refetchInterval: 60000 });
  const p = analytics.payload;
  return <DashboardShell guild={server.guild} guildId={guildId} active="leaderboard"><div className="mx-auto max-w-[1320px]">
    <div className="mb-6"><div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/24"><BarChart3 className="h-3.5 w-3.5" /> Server activity</div><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white/94">Leaderboard</h1><p className="mt-2 text-[11px] text-white/32">Live rankings from Ware's synced Discord telemetry — no fake dashboard numbers.</p></div>
    <div className="grid gap-5 lg:grid-cols-3"><Board title="Message channels" icon={Hash} rows={p?.top_message_channels ?? []} unit="messages" /><Board title="Voice channels" icon={Mic2} rows={p?.top_voice_channels ?? []} unit="seconds" /><Board title="Commands" icon={TerminalSquare} rows={p?.top_commands ?? []} unit="uses" /></div>
  </div></DashboardShell>;
}
