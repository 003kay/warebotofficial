import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ModernSelect } from "@/components/dashboard/ModernSelect";
import { SECURITY_GROUPS, type SecurityModule } from "@/lib/security-modules";
import { runtimeSecurityKeys, runtimePunishments } from "@/lib/runtime-security";
import { getSecurityConfig, saveSecurityModule } from "@/lib/security.functions";
export const Route = createFileRoute("/dashboard/$guildId/security")({ component: Page });
function Page() {
 const {guildId}=Route.useParams();
 const {data}=useSuspenseQuery({queryKey:["security",guildId],queryFn:()=>getSecurityConfig({data:{guildId}})});
 const modules=SECURITY_GROUPS.flatMap(group=>group.modules).filter(module=>runtimeSecurityKeys.has(module.key));
 return <DashboardShell guild={data.guild} guildId={guildId} active="security"><h1 className="text-3xl font-semibold tracking-tight">Antinuke</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">Configure Stained’s active protection modules. The server owner can save changes here; use antinuke commands in Discord to manage trusted administrators and exemptions.</p><div className="my-6 flex flex-wrap gap-3">{[["join-gate","Join Gate"],["verification","Verification"],["filters","Message filters"]].map(([path,title])=><a key={path} href={`/dashboard/${guildId}/${path}`} className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/60">{title}</a>)}</div><div className="grid gap-4 lg:grid-cols-2">{modules.map(module=><ModuleCard key={module.key} guildId={guildId} module={module} initial={data.modules[module.key]}/>)}</div></DashboardShell>;
}
function ModuleCard({guildId,module,initial}:{guildId:string;module:SecurityModule;initial:any}) {
 const client=useQueryClient(); const [enabled,setEnabled]=useState(Boolean(initial?.enabled));
 const [punishment,setPunishment]=useState(initial?.punishment ?? module.defaultPunishment);
 const [count,setCount]=useState(initial?.threshold_count ?? module.defaultCount);
 const [seconds,setSeconds]=useState(initial?.threshold_seconds ?? module.defaultSeconds);
 const [saving,setSaving]=useState(false); const [notice,setNotice]=useState("");
 async function save(){setSaving(true);setNotice("");try{await saveSecurityModule({data:{guildId,module_key:module.key,enabled,punishment,threshold_count:count,threshold_seconds:seconds,dry_run:false,extra:initial?.extra ?? {}}});setNotice("Saved. Waiting for the bot to acknowledge the change.");await client.invalidateQueries({queryKey:["botSync",guildId]});}catch(error){setNotice((error as Error).message)}finally{setSaving(false)}}
 return <section className="rounded-2xl border border-white/[.08] bg-[#0d1011] p-5"><div className="flex items-center justify-between gap-4"><h2 className="text-sm font-semibold">{module.name.replace(/ \+ restore| restore/g,"")}</h2><button type="button" aria-label={`Enable ${module.name}`} aria-pressed={enabled} onClick={()=>setEnabled(!enabled)} className={`rounded-full px-3 py-1.5 text-xs ${enabled?"bg-emerald-400/15 text-emerald-300":"bg-white/5 text-white/40"}`}>{enabled?"Enabled":"Disabled"}</button></div><p className="mt-3 text-xs leading-6 text-white/40">Detect configured actions and apply the selected response when the threshold is reached.</p><div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs text-white/50">Action count<input type="number" min={1} max={1000} value={count} onChange={event=>setCount(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white"/></label><label className="text-xs text-white/50">Window (seconds)<input type="number" min={1} max={86400} value={seconds} onChange={event=>setSeconds(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-white"/></label></div><div className="mt-3"><ModernSelect value={punishment} onChange={setPunishment} options={runtimePunishments}/></div><div className="mt-4 flex items-center gap-4"><button type="button" disabled={saving} onClick={save} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black disabled:opacity-40">{saving?"Saving…":"Save module"}</button><p role="status" className="text-xs leading-5 text-white/50">{notice}</p></div></section>;
}
