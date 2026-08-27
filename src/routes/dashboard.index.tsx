import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Settings2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Starfield } from "@/components/Starfield";
import { getManagedGuildsFn } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — ware" }] }),
  loader: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData({ queryKey:["managedGuilds"], queryFn:()=>getManagedGuildsFn() });
    if (!data.authenticated) throw redirect({ href:"/auth/discord/login" as never });
    return null;
  },
  component: DashboardIndex,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">Failed to load servers: {error.message}</div>,
});

function DashboardIndex() {
  const { data } = useSuspenseQuery({ queryKey:["managedGuilds"], queryFn:()=>getManagedGuildsFn() });
  return <div className="ware-dashboard-index relative min-h-screen overflow-hidden bg-[#050606] text-white">
    <Starfield/>
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-15%,rgba(175,195,205,.10),transparent_38%),linear-gradient(180deg,rgba(255,255,255,.015),transparent_24%)]"/>
    <Navbar dashboardMode/>

    <main className="relative z-10 mx-auto max-w-[1320px] px-6 pb-24 pt-10 md:px-10 md:pt-14">
      <section className="mb-9 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-white/30">Server management</p>
          <h1 className="mt-3 max-w-3xl text-[42px] font-semibold leading-[.95] tracking-[-.055em] text-white md:text-[58px]">Pick a server.<br/><span className="text-white/46">Run everything from Ware.</span></h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/42">Open a workspace to manage protection, tickets, automations, integrations, and server settings.</p>
        </div>
        <div className="rounded-[20px] border border-white/[.075] bg-white/[.025] px-5 py-4 backdrop-blur-xl"><div className="text-[30px] font-semibold tracking-[-.05em] text-white/92">{data.guilds.length}</div><div className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/28">Available servers</div></div>
      </section>

      <div className="mb-5 h-px bg-gradient-to-r from-white/[.10] via-white/[.04] to-transparent"/>

      {data.guilds.length===0 ? (
        <div className="rounded-[28px] border border-dashed border-white/[.09] bg-white/[.018] px-8 py-16 text-center"><h2 className="text-xl font-semibold text-white/82">No manageable servers</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/32">You need Manage Server or Administrator permission before a Discord server appears here.</p></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.guilds.map((g,index)=><article key={g.id} className="ware-server-card group relative overflow-hidden rounded-[26px] border border-white/[.07] bg-[linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012))] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-white/[.15] hover:bg-white/[.035]" style={{animationDelay:`${index*45}ms`}}>
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,.07),transparent_48%)]"/>
            <div className="relative flex items-center gap-4">
              {g.iconUrl?<img src={g.iconUrl} alt="" className="h-16 w-16 rounded-[18px] object-cover ring-1 ring-white/[.10]"/>:<div className="grid h-16 w-16 place-items-center rounded-[18px] border border-white/[.08] bg-white/[.04] text-sm font-semibold text-white/65">{g.name.slice(0,2).toUpperCase()}</div>}
              <div className="min-w-0 flex-1"><div className="truncate text-[17px] font-semibold tracking-[-.025em] text-white/92">{g.name}</div><div className="mt-1 text-[10px] font-medium uppercase tracking-[.13em] text-white/27">{g.owner?"Owner":"Manager"}</div></div>
            </div>

            <div className="relative mt-6 rounded-[18px] border border-white/[.055] bg-black/20 p-3">
              <Link to="/dashboard/$guildId/" params={{guildId:g.id}} className="group/action flex items-center justify-between rounded-[13px] px-3 py-3.5 text-[13px] font-semibold text-white/72 transition hover:bg-white/[.06] hover:text-white"><span className="flex items-center gap-2"><Settings2 className="h-4 w-4 text-white/35"/>Open dashboard</span><ArrowRight className="h-4 w-4 text-white/28 transition group-hover/action:translate-x-1 group-hover/action:text-white/65"/></Link>
              <Link to="/dashboard/$guildId/security" params={{guildId:g.id}} className="group/action mt-1 flex items-center justify-between rounded-[13px] px-3 py-3 text-[12px] font-medium text-white/40 transition hover:bg-white/[.045] hover:text-white/75"><span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5"/>Security center</span><ArrowRight className="h-3.5 w-3.5 text-white/20 transition group-hover/action:translate-x-1"/></Link>
            </div>
          </article>)}
        </div>
      )}
    </main>
  </div>;
}
