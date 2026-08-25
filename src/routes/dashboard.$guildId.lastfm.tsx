import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CircleDot, ExternalLink, Music2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
import { getLastfmConnection } from "@/lib/integration.functions";

export const Route = createFileRoute("/dashboard/$guildId/lastfm")({
  head: () => ({ meta: [{ title: "Last.fm — Ware Dashboard" }] }),
  loader: async ({ context, params }) => { await Promise.all([
    context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }),
    context.queryClient.ensureQueryData({ queryKey: ["lastfmConnection"], queryFn: () => getLastfmConnection() }),
  ]); return null; },
  component: Page,
});

function Page() {
  const { guildId } = Route.useParams();
  const { data: server } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const { data: connection } = useSuspenseQuery({ queryKey: ["lastfmConnection"], queryFn: () => getLastfmConnection() });
  return <DashboardShell guild={server.guild} guildId={guildId} active="lastfm"><div className="mx-auto max-w-[980px]">
    <div className="mb-6"><div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/24"><CircleDot className="h-3.5 w-3.5" /> Integrations</div><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white/94">Last.fm</h1><p className="mt-2 text-[11px] text-white/32">Your Discord account's Last.fm connection used by Ware music commands.</p></div>
    <div className="rounded-2xl border border-white/[0.055] bg-[#101212] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-red-400/10 bg-red-500/[0.07]"><Music2 className="h-5 w-5 text-red-300/75" /></div><div><div className="text-[12px] font-semibold text-white/82">{connection.connected ? connection.username : "Not connected"}</div><div className="mt-1 text-[10px] text-white/28">{connection.connected ? "Ware can use this Last.fm account for your music commands." : "Connect from Discord with your Ware Last.fm login command."}</div></div></div>
        <div className={`rounded-full border px-3 py-1.5 text-[9px] ${connection.connected ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-200/70" : "border-white/[0.07] bg-white/[0.025] text-white/35"}`}>{connection.connected ? "Connected" : "Disconnected"}</div>
      </div>
      <div className="mt-5 border-t border-white/[0.05] pt-5 text-[10px] leading-5 text-white/32">For security, Ware never displays your Last.fm session key here. To change the account, run your server's <span className="rounded bg-white/[0.055] px-1.5 py-1 font-mono text-white/55">lastfm login</span> command in Discord and follow the authorization flow.</div>
      <a href="https://www.last.fm/settings/applications" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-white/45 hover:text-white/75">Last.fm application settings <ExternalLink className="h-3 w-3" /></a>
    </div>
  </div></DashboardShell>;
}
