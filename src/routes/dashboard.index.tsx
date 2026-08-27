import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
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
    <div className="pointer-events-none fixed inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_55%_-8%,rgba(170,190,201,.08),transparent_62%)]"/>
    <Navbar dashboardMode/>
    <main className="relative z-10 mx-auto max-w-[1220px] px-6 pb-20 pt-8 md:px-10 md:pt-12">
      <section className="mb-10 flex flex-col gap-6 border-b border-white/[.06] pb-8 md:flex-row md:items-end md:justify-between">
        <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/[.07] bg-white/[.025] px-3 py-1.5 text-[9px] uppercase tracking-[.16em] text-white/35"><Sparkles className="h-3 w-3"/>Server workspace</div><h1 className="text-4xl font-semibold tracking-[-.055em] text-white md:text-5xl">Choose a server</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/38">Manage protection, tickets, automations, integrations, and server settings from one place.</p></div>
        <div className="rounded-2xl border border-white/[.06] bg-white/[.02] px-4 py-3 text-right"><div className="text-2xl font-semibold tracking-[-.04em] text-white/85">{data.guilds.length}</div><div className="mt-1 text-[8px] uppercase tracking-[.16em] text-white/22">manageable servers</div></div>
      </section>

      {data.guilds.length===0 ? <div className="rounded-[24px] border border-dashed border-white/[.08] bg-white/[.018] p-12 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/[.06] bg-white/[.025]"><SlidersHorizontal className="h-5 w-5 text-white/35"/></div><h2 className="mt-4 text-lg font-semibold text-white/80">No manageable servers</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/30">You need Manage Server or Administrator permission in a Discord server before it appears here.</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.guilds.map(g=><article key={g.id} className="ware-server-card group relative overflow-hidden rounded-[24px] border border-white/[.065] bg-[#0b0d0d]/95 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/[.13] hover:bg-[#0e1010]"><div className="pointer-events-none absolute -right-14 -top-16 h-40 w-40 rounded-full bg-white/[.025] blur-3xl transition group-hover:bg-white/[.045]"/><div className="relative flex items-center gap-4">{g.iconUrl?<img src={g.iconUrl} alt="" className="h-14 w-14 rounded-[17px] object-cover ring-1 ring-white/[.08]"/>:<div className="grid h-14 w-14 place-items-center rounded-[17px] border border-white/[.06] bg-white/[.035] text-sm font-semibold text-white/60">{g.name.slice(0,2).toUpperCase()}</div>}<div className="min-w-0 flex-1"><div className="truncate text-[15px] font-semibold tracking-[-.02em] text-white/90">{g.name}</div><div className="mt-1 flex items-center gap-2 text-[9px] text-white/28"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80"/>{g.owner?"Owner":"Manager"}</div></div></div><div className="relative mt-6 grid grid-cols-2 gap-2"><Link to="/dashboard/$guildId/" params={{guildId:g.id}} className="group/action flex items-center justify-between rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-3 text-[10px] font-medium text-white/58 transition hover:border-white/[.13] hover:bg-white/[.055] hover:text-white"><span>Overview</span><ArrowRight className="h-3.5 w-3.5 transition group-hover/action:translate-x-0.5"/></Link><Link to="/dashboard/$guildId/security" params={{guildId:g.id}} className="group/action flex items-center justify-between rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-3 text-[10px] font-medium text-white/58 transition hover:border-white/[.13] hover:bg-white/[.055] hover:text-white"><span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5"/>Security</span><ArrowRight className="h-3.5 w-3.5 transition group-hover/action:translate-x-0.5"/></Link></div></article>)}</div>}
    </main>
  </div>;
}
