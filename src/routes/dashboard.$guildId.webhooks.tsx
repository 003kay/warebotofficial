import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings } from "@/lib/dashboard-settings.functions";
export const Route=createFileRoute("/dashboard/$guildId/webhooks")({component:Page});
function Page(){const {guildId}=Route.useParams();const {data}=useSuspenseQuery({queryKey:["dashboardSettings",guildId],queryFn:()=>getDashboardSettings({data:{guildId}})});return <DashboardShell guild={data.guild} guildId={guildId} active="webhooks"><h1 className="text-3xl font-bold">Webhooks</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">Create and manage webhooks in Discord. Identifiers stay on the bot host; webhook tokens are never exposed in the dashboard.</p><div className="mt-6 flex flex-wrap gap-3">{["webhook create", "webhook list", "webhook send", "webhook edit", "webhook delete"].map(command=><a key={command} href={`/commands?search=${encodeURIComponent(command)}`} className="rounded-xl border border-white/10 px-4 py-3 font-mono text-sm">,{command}</a>)}</div></DashboardShell>}
