import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ExternalLink, Headphones, Link2, Music2, Radio, UserRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
import { getLastfmConnection } from "@/lib/integration.functions";

export const Route = createFileRoute("/dashboard/$guildId/lastfm")({
  head: () => ({ meta: [{ title: "Last.fm — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) }),
      context.queryClient.ensureQueryData({ queryKey: ["lastfmConnection"], queryFn: () => getLastfmConnection() }),
    ]);
    return null;
  },
  component: Page,
});

function connectedDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function Page() {
  const { guildId } = Route.useParams();
  const { data: server } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const { data: connection } = useSuspenseQuery({ queryKey: ["lastfmConnection"], queryFn: () => getLastfmConnection(), refetchInterval: 30_000 });

  const profileUrl = connection.username ? `https://www.last.fm/user/${encodeURIComponent(connection.username)}` : null;

  return (
    <DashboardShell guild={server.guild} guildId={guildId} active="lastfm">
      <div className="mx-auto max-w-[1120px] pb-12">
        <section className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#0e1010] p-5 md:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-500/[0.045] blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/27"><Headphones className="h-3.5 w-3.5" /> Music integration</div>
              <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.045em] text-white/94">Last.fm</h1>
              <p className="mt-2 max-w-2xl text-[11px] leading-5 text-white/32">The Last.fm identity Ware uses for now-playing cards, crowns, scrobbles, artist stats, and music commands.</p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[9px] font-medium ${connection.connected ? "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-200/75" : "border-white/[0.08] bg-white/[0.025] text-white/35"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connection.connected ? "bg-emerald-400" : "bg-white/25"}`} />
              {connection.connected ? "Connected" : "Not connected"}
            </div>
          </div>
        </section>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-[20px] border border-white/[0.06] bg-[#101212] p-5 md:p-6">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-[17px] border border-red-400/10 bg-red-500/[0.07]"><Music2 className="h-6 w-6 text-red-300/75" /></div>
              <div className="min-w-0">
                <div className="text-[9px] uppercase tracking-[0.15em] text-white/25">Linked account</div>
                <div className="mt-1 truncate text-[18px] font-semibold text-white/88">{connection.connected ? connection.username : "No Last.fm account linked"}</div>
                <div className="mt-1 text-[10px] text-white/30">{connection.connected ? "Ware can use this account immediately." : "Run the Last.fm login command in Discord to connect."}</div>
              </div>
            </div>

            {connection.connected ? (
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.018] p-3.5"><div className="flex items-center gap-2 text-[9px] text-white/27"><UserRound className="h-3.5 w-3.5" /> Discord account</div><div className="mt-2 font-mono text-[10px] text-white/55">{connection.discordUserId}</div></div>
                <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.018] p-3.5"><div className="flex items-center gap-2 text-[9px] text-white/27"><Link2 className="h-3.5 w-3.5" /> Connected</div><div className="mt-2 text-[10px] font-medium text-white/55">{connectedDate(connection.connectedAt)}</div></div>
              </div>
            ) : null}

            <div className="mt-5 border-t border-white/[0.05] pt-5 text-[10px] leading-5 text-white/31">
              Ware never displays your Last.fm session key in the dashboard. To switch accounts, run <span className="rounded-md bg-white/[0.055] px-1.5 py-1 font-mono text-white/58">lastfm login</span> in Discord and finish the Last.fm authorization flow.
            </div>
          </section>

          <section className="rounded-[20px] border border-white/[0.06] bg-[#101212] p-5">
            <div className="flex items-center gap-2 text-[10px] font-medium text-white/65"><Radio className="h-4 w-4 text-[#a7bdc7]" /> Quick links</div>
            <div className="mt-4 space-y-2">
              {profileUrl ? <a href={profileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[13px] border border-white/[0.05] bg-white/[0.018] px-3.5 py-3 text-[10px] text-white/55 hover:bg-white/[0.03] hover:text-white/80"><span>Open Last.fm profile</span><ExternalLink className="h-3.5 w-3.5" /></a> : null}
              <a href="https://www.last.fm/settings/applications" target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-[13px] border border-white/[0.05] bg-white/[0.018] px-3.5 py-3 text-[10px] text-white/55 hover:bg-white/[0.03] hover:text-white/80"><span>Last.fm applications</span><ExternalLink className="h-3.5 w-3.5" /></a>
            </div>
            {!connection.connected ? <div className="mt-4 rounded-[13px] border border-amber-300/10 bg-amber-300/[0.03] px-3.5 py-3 text-[9px] leading-4 text-amber-100/45">If Discord already says you are linked, refresh after the deployment finishes. This page now reads the same stored Discord-to-Last.fm connection instead of failing on a nonexistent database field.</div> : null}
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
