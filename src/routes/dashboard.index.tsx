import { createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Starfield } from "@/components/Starfield";
import { getManagedGuildsFn } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard" }] }),
  loader: async ({ context }) => {
    const data = await context.queryClient.ensureQueryData({ queryKey:["managedGuilds"], queryFn:()=>getManagedGuildsFn() });
    if (!data.authenticated) throw redirect({ href:"/auth/discord/login" as never });
    return null;
  },
  component: DashboardIndex,
  errorComponent: ({ error }) => <div className="grid min-h-screen place-items-center bg-[#05070a] px-6 text-center text-white/60">Failed to load servers: {error.message}</div>,
});

function DashboardIndex() {
  const { data } = useSuspenseQuery({ queryKey:["managedGuilds"], queryFn:()=>getManagedGuildsFn() });

  return <div className="relative min-h-screen overflow-hidden bg-[#05070a] text-white">
    <Starfield/>
    <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(68,84,150,.18),transparent_34%),radial-gradient(circle_at_90%_20%,rgba(23,91,91,.08),transparent_26%),linear-gradient(180deg,rgba(255,255,255,.012),transparent_28%)]"/>
    <Navbar dashboardMode/>

    <main className="relative z-10 mx-auto max-w-[1380px] px-6 pb-24 pt-12 md:px-10 md:pt-16">
      <section className="mb-10 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#6577d6]/15 bg-[#5364b4]/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-[#aeb9f8]/58"><Sparkles className="h-3.5 w-3.5"/>Server workspaces</div>
          <h1 className="mt-5 max-w-3xl text-[42px] font-bold leading-[.96] tracking-[-.055em] text-white md:text-[60px]">Choose a server.<br/><span className="bg-gradient-to-r from-[#8c9ce8] via-[#8da8c8] to-[#73a2a0] bg-clip-text text-transparent">Manage it from Ware.</span></h1>
          <p className="mt-5 max-w-2xl text-[15px] font-medium leading-7 text-white/40">Protection, tickets, logs, embeds, integrations, and server tools all live inside one workspace.</p>
        </div>
        <div className="rounded-[22px] border border-[#6476c8]/12 bg-[linear-gradient(145deg,rgba(44,54,94,.26),rgba(9,12,17,.86))] px-6 py-5 shadow-[0_18px_60px_rgba(0,0,0,.25)]"><div className="text-[34px] font-bold tracking-[-.05em] text-white/94">{data.guilds.length}</div><div className="mt-1 text-[10px] font-bold uppercase tracking-[.15em] text-white/30">Available servers</div></div>
      </section>

      {data.guilds.length===0 ? (
        <div className="rounded-[28px] border border-dashed border-white/[.09] bg-white/[.018] px-8 py-16 text-center"><h2 className="text-xl font-bold text-white/82">No manageable servers</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/32">You need Manage Server or Administrator permission before a Discord server appears here.</p></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.guilds.map((g,index)=><a key={g.id} href={`/dashboard/${g.id}/`} className="group relative block overflow-hidden rounded-[26px] border border-white/[.07] bg-[linear-gradient(145deg,rgba(18,22,31,.96),rgba(8,10,14,.98))] p-5 shadow-[0_22px_70px_rgba(0,0,0,.24)] transition duration-300 hover:-translate-y-1.5 hover:border-[#7183df]/26 hover:shadow-[0_30px_90px_rgba(0,0,0,.34)]" style={{animationDelay:`${index*45}ms`}}>
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_12%_0%,rgba(90,108,194,.18),transparent_42%),radial-gradient(circle_at_90%_100%,rgba(44,111,107,.09),transparent_34%)]"/>
            <div className="relative flex items-center gap-4">
              {g.iconUrl?<img src={g.iconUrl} alt="" className="h-16 w-16 rounded-[18px] object-cover ring-1 ring-white/[.10]"/>:<div className="grid h-16 w-16 place-items-center rounded-[18px] border border-[#6476c8]/14 bg-[#5262aa]/10 text-sm font-bold text-[#b5c0fa]/70">{g.name.slice(0,2).toUpperCase()}</div>}
              <div className="min-w-0 flex-1"><div className="truncate text-[18px] font-bold tracking-[-.025em] text-white/94">{g.name}</div><div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-white/28">{g.owner?<Crown className="h-3 w-3 text-[#9aa9f0]/65"/>:<ShieldCheck className="h-3 w-3 text-[#79a7a3]/58"/>}{g.owner?"Owner":"Manager"}</div></div>
            </div>
            <div className="relative mt-6 flex items-center justify-between rounded-[17px] border border-white/[.055] bg-black/20 px-4 py-3.5 transition group-hover:border-[#7183df]/14 group-hover:bg-[#5465b3]/7"><span className="text-[12px] font-bold text-white/62 group-hover:text-white/88">Open workspace</span><ArrowRight className="h-4 w-4 text-white/28 transition group-hover:translate-x-1 group-hover:text-[#a9b6f4]"/></div>
          </a>)}
        </div>
      )}
    </main>
  </div>;
}
