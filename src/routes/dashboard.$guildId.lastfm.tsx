import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, CalendarDays, Command, ExternalLink, Headphones, Link2, Music2, Radio, UserRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
import { getLastfmConnection } from "@/lib/integration.functions";

export const Route = createFileRoute("/dashboard/$guildId/lastfm")({
  head: () => ({ meta: [{ title: "Last.fm — Stained Dashboard" }] }),
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

function LastFmLogo({ small = false }: { small?: boolean }) {
  return <div className={`${small ? "h-9 w-9 rounded-xl" : "h-16 w-16 rounded-[19px]"} grid shrink-0 place-items-center border border-[#ff3b45]/15 bg-[#ff3b45]/[.07] shadow-[inset_0_0_30px_rgba(255,45,55,.025)]`}><span className={`${small ? "text-[13px]" : "text-[20px]"} font-black italic tracking-[-.09em] text-[#ff3b45]`}>fm</span></div>;
}

function ActionLink({ href, title, detail, external = false, icon: Icon }: { href: string; title: string; detail: string; external?: boolean; icon: typeof Music2 }) {
  return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="group flex items-center gap-3 rounded-[15px] border border-white/[.055] bg-white/[.018] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[.10] hover:bg-white/[.035]"><span className="grid h-9 w-9 place-items-center rounded-xl border border-white/[.05] bg-black/20"><Icon className="h-4 w-4 text-white/42" /></span><span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-white/70">{title}</span><span className="mt-1 block truncate text-[8px] text-white/24">{detail}</span></span><ArrowUpRight className="h-3.5 w-3.5 text-white/18 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/52" /></a>;
}

function Page() {
  const { guildId } = Route.useParams();
  const { data: server } = useSuspenseQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }) });
  const { data: connection } = useSuspenseQuery({ queryKey: ["lastfmConnection"], queryFn: () => getLastfmConnection(), refetchInterval: 30_000 });
  const profileUrl = connection.username ? `https://www.last.fm/user/${encodeURIComponent(connection.username)}` : null;

  return <DashboardShell guild={server.guild} guildId={guildId} active="lastfm">
    <div className="mx-auto max-w-[1220px] pb-14">
      <section className="relative overflow-hidden rounded-[24px] border border-white/[.065] bg-[linear-gradient(125deg,#101111_0%,#0c0d0d_58%,rgba(31,8,10,.75)_100%)] p-6 md:p-7">
        <div className="pointer-events-none absolute -right-24 -top-36 h-96 w-96 rounded-full bg-[#ff3b45]/[.055] blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5"><LastFmLogo /><div><div className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[.22em] text-white/25"><Headphones className="h-3 w-3" /> Music integration</div><h1 className="mt-2 text-[31px] font-semibold tracking-[-.055em] text-white/95">Last.fm</h1><p className="mt-1.5 max-w-xl text-[10px] leading-5 text-white/30">Your music identity for now-playing cards, crowns, scrobbles, artist stats and Stained's Last.fm commands.</p></div></div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-[9px] font-medium ${connection.connected ? "border-emerald-400/15 bg-emerald-400/[.065] text-emerald-200/72" : "border-white/[.08] bg-white/[.025] text-white/35"}`}><span className={`h-1.5 w-1.5 rounded-full ${connection.connected ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.45)]" : "bg-white/25"}`} />{connection.connected ? "Account connected" : "Not connected"}</div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-[22px] border border-white/[.06] bg-[#0f1111] p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex min-w-0 items-center gap-4"><LastFmLogo small /><div className="min-w-0"><div className="text-[8px] font-semibold uppercase tracking-[.18em] text-white/22">Linked account</div><div className="mt-1 truncate text-[21px] font-semibold tracking-[-.035em] text-white/90">{connection.connected ? connection.username : "No account linked"}</div><div className="mt-1 text-[9px] text-white/27">{connection.connected ? "Ready for Stained music commands." : "Use lastfm login in Discord to connect."}</div></div></div>{profileUrl ? <a href={profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-2 text-[9px] text-white/50 transition hover:bg-white/[.05] hover:text-white/75">View profile <ExternalLink className="h-3 w-3" /></a> : null}</div>

          {connection.connected ? <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-[15px] border border-white/[.05] bg-white/[.018] p-4"><div className="flex items-center gap-2 text-[8px] uppercase tracking-[.12em] text-white/22"><UserRound className="h-3.5 w-3.5" /> Discord account</div><div className="mt-2.5 font-mono text-[10px] text-white/55">{connection.discordUserId}</div></div><div className="rounded-[15px] border border-white/[.05] bg-white/[.018] p-4"><div className="flex items-center gap-2 text-[8px] uppercase tracking-[.12em] text-white/22"><CalendarDays className="h-3.5 w-3.5" /> Connected</div><div className="mt-2.5 text-[10px] font-medium text-white/55">{connectedDate(connection.connectedAt)}</div></div></div> : null}

          <div className="mt-6 rounded-[15px] border border-white/[.05] bg-black/20 p-4"><div className="flex items-start gap-3"><Link2 className="mt-0.5 h-4 w-4 shrink-0 text-white/28" /><div><div className="text-[9px] font-medium text-white/55">Switching accounts</div><p className="mt-1 text-[9px] leading-4 text-white/25">Run <span className="rounded-md bg-white/[.055] px-1.5 py-0.5 font-mono text-white/55">lastfm login</span> in Discord. Stained never displays your Last.fm session key in the dashboard.</p></div></div></div>
        </section>

        <section className="rounded-[22px] border border-white/[.06] bg-[#0f1111] p-5">
          <div className="flex items-center gap-2"><Radio className="h-4 w-4 text-[#a9bcc5]" /><div><div className="text-[11px] font-semibold text-white/72">Music shortcuts</div><div className="mt-0.5 text-[8px] text-white/23">Jump straight to the tools you need.</div></div></div>
          <div className="mt-4 space-y-2.5"><ActionLink href="/commands?category=lastfm" title="Browse Last.fm commands" detail="See every Stained music command and syntax" icon={Command} />{profileUrl ? <ActionLink href={profileUrl} title="Open Last.fm profile" detail={connection.username || "Your connected profile"} external icon={UserRound} /> : null}<ActionLink href="https://www.last.fm/settings/applications" title="Last.fm applications" detail="Manage authorized Last.fm applications" external icon={ExternalLink} /></div>
        </section>
      </div>

      <section className="mt-4 overflow-hidden rounded-[22px] border border-white/[.06] bg-[#0f1111]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.05] px-5 py-4"><div><div className="flex items-center gap-2 text-[11px] font-semibold text-white/70"><Music2 className="h-4 w-4 text-[#ff5961]/70" /> Command starter</div><div className="mt-1 text-[8px] text-white/23">Common Last.fm commands to try in Discord.</div></div><a href="/commands?category=lastfm" className="text-[9px] text-white/35 transition hover:text-white/70">View all commands →</a></div>
        <div className="grid gap-px bg-white/[.045] sm:grid-cols-2 lg:grid-cols-4">{[["lastfm login","Connect or switch account"],["fm","Show now playing"],["fm topartists","View top artists"],["fm crowns","View server crowns"]].map(([command, detail]) => <div key={command} className="bg-[#0f1111] p-4 transition hover:bg-[#121414]"><div className="font-mono text-[10px] text-white/67">{command}</div><div className="mt-1.5 text-[8px] text-white/24">{detail}</div></div>)}</div>
      </section>
    </div>
  </DashboardShell>;
}

