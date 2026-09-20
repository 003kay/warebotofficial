import { useQuery } from "@tanstack/react-query";
import { getBotSyncStatus } from "@/lib/dashboard-settings.functions";
import { WARE_COMMAND_COUNT } from "@/lib/canonicalCommands";

export function BotSyncStatus({ guildId }: { guildId: string }) {
  const { data: sync, isError } = useQuery({ queryKey: ["botSync", guildId],
    queryFn: () => getBotSyncStatus({ data: { guildId } }), refetchInterval: 15000 });
  const online = Boolean(sync && Date.now() - Date.parse(sync.updatedAt) < 120000);
  const errors = Object.entries(sync?.errors ?? {}) as [string, string][];
  const pending = Object.entries(sync?.revisions ?? {}).filter(([key, revision]) => Number(sync?.applied?.[key] ?? -1) < Number(revision));
  const label = isError ? "Connection status unavailable" : !sync ? "Waiting for the updated bot" : !online ? "Bot connection is stale" : errors.length ? "Some settings need attention" : pending.length ? "Applying your changes" : "Bot connected · settings synchronized";
  return <section aria-live="polite" className="mb-6 rounded-2xl border border-white/10 bg-white/[.025] p-4 text-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-white/80"><span className={`h-2 w-2 rounded-full ${online && !errors.length ? "bg-emerald-400" : "bg-amber-400"}`} />{label}</p><span className="text-xs text-white/45">{WARE_COMMAND_COUNT.toLocaleString()} website commands{sync ? ` · ${sync.commandCount.toLocaleString()} bot commands` : ""}</span></div>
    {!sync && <p className="mt-2 text-xs leading-5 text-white/45">Upload the latest main.py to your bot host and restart it. Saved settings will be applied after it connects.</p>}
    {sync && <p className="mt-2 text-xs text-white/45">Last received: {new Date(sync.updatedAt).toLocaleString()} · {sync.version}{pending.length ? ` · ${pending.length} pending sections` : ""}</p>}
    {sync && sync.commandCount !== WARE_COMMAND_COUNT && <p className="mt-2 text-xs text-amber-200">The running script and website catalog are different versions. Upload the latest script.</p>}
    {errors.map(([section, error]) => <p key={section} className="mt-2 text-xs text-amber-200">{section}: {error}</p>)}
    {sync && <details className="mt-3 border-t border-white/5 pt-3"><summary className="cursor-pointer text-xs text-white/55">View configuration reported by the bot</summary><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(sync.modules).map(([key,value]) => <div key={key} className="rounded-xl bg-black/20 p-3"><p className="text-xs text-white/45">{key}</p><p className="mt-1 break-words text-xs text-white/80">{typeof value === "object" ? JSON.stringify(value) : String(value)}</p></div>)}</div></details>}
  </section>;
}
