import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Activity, AlertTriangle, Plus, Save, Shield, ShieldCheck, Trash2 } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SECURITY_GROUPS, PUNISHMENTS, LIST_TYPES, type SecurityModule, type ListType } from "@/lib/security-modules";
import { getSecurityConfig, saveSecuritySettings, saveSecurityModule, addSecurityListEntry, removeSecurityListEntry } from "@/lib/security.functions";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/$guildId/security")({
  head: () => ({ meta: [{ title: "Security Center — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({ queryKey: ["security", params.guildId], queryFn: () => getSecurityConfig({ data: { guildId: params.guildId } }) });
    return null;
  },
  component: SecurityPage,
});

const input = "w-full rounded-xl border border-white/[.07] bg-[#090a0a] px-3 py-2.5 text-[12px] text-white outline-none transition focus:border-white/[.18]";
const card = "rounded-2xl border border-white/[.06] bg-[#101111]";

function SecurityPage() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({ queryKey: ["security", guildId], queryFn: () => getSecurityConfig({ data: { guildId } }), refetchInterval: 45_000 });

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="security">
      <div className="mx-auto max-w-[1480px] pb-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-white/24"><Shield className="h-3 w-3" /> Security</div>
            <h1 className="mt-2 text-[30px] font-semibold tracking-[-.045em] text-white">Security Center</h1>
            <p className="mt-1 max-w-2xl text-[12px] leading-5 text-white/34">Configure verification, anti-nuke, anti-raid, filtering and exemptions. Changes are saved directly for Ware to enforce.</p>
          </div>
          <div className={`rounded-full border px-3 py-1.5 text-[10px] ${data.botInGuild ? "border-emerald-400/15 bg-emerald-400/[.05] text-emerald-200/70" : "border-amber-300/15 bg-amber-300/[.05] text-amber-100/70"}`}>{data.botInGuild ? "Ware connected" : `Bot connection: ${data.botStatus ?? "unavailable"}`}</div>
        </div>

        {!data.botInGuild ? <div className="mb-5 flex gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[.05] px-4 py-3 text-[12px] leading-5 text-amber-100/70"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> Ware cannot validate channels or roles until the bot token/server access is fixed. Security configuration remains visible, but live enforcement needs the bot connected.</div> : null}

        <GlobalSettings data={data} guildId={guildId} />

        <div className="mt-7 space-y-8">
          {SECURITY_GROUPS.map((group) => <section key={group.slug}><div className="mb-4"><h2 className="text-[15px] font-semibold text-white/82">{group.name}</h2><p className="mt-1 text-[11px] text-white/28">{group.description}</p></div><div className="grid gap-3 xl:grid-cols-2">{group.modules.map((mod) => <ModuleCard key={mod.key} guildId={guildId} module={mod} value={data.modules[mod.key]} />)}</div></section>)}
        </div>

        <section className="mt-9"><div className="mb-4"><h2 className="text-[15px] font-semibold text-white/82">Trust & filter lists</h2><p className="mt-1 text-[11px] text-white/28">Exempt trusted members or add names/domains Ware should treat specially.</p></div><div className="grid gap-3 xl:grid-cols-2">{LIST_TYPES.map((type) => <ListCard key={type} guildId={guildId} type={type} entries={data.lists[type]} />)}</div></section>

        <section className={`${card} mt-9 overflow-hidden`}><div className="flex items-center gap-2 border-b border-white/[.05] px-5 py-4"><Activity className="h-4 w-4 text-white/38" /><div><div className="text-[13px] font-semibold text-white/80">Recent security events</div><div className="mt-1 text-[10px] text-white/24">Latest detections and enforcement actions from Ware.</div></div></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="text-[9px] uppercase tracking-[.16em] text-white/22"><tr><th className="px-5 py-3">Time</th><th>Module</th><th>Event</th><th>Actor</th><th>Action</th><th>Reason</th></tr></thead><tbody className="divide-y divide-white/[.045]">{data.events.length ? data.events.map((event) => <tr key={event.id} className="text-[11px] text-white/48"><td className="px-5 py-3 text-white/30">{new Date(event.created_at).toLocaleString()}</td><td>{event.module_key ?? "—"}</td><td>{event.event_type}</td><td>{event.actor_id ?? "—"}</td><td>{event.dry_run ? "Dry run" : event.punishment ?? "Logged"}</td><td className="max-w-[300px] truncate pr-5">{event.reason ?? "—"}</td></tr>) : <tr><td colSpan={6} className="px-5 py-10 text-center text-[11px] text-white/22">No security events have been recorded yet.</td></tr>}</tbody></table></div></section>
      </div>
    </DashboardShell>
  );
}

function GlobalSettings({ data, guildId }: { data: any; guildId: string }) {
  const router = useRouter();
  const [state, setState] = useState(data.settings);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const set = (key: string, value: any) => setState((s: any) => ({ ...s, [key]: value }));
  async function save() { setSaving(true); setNotice(null); try { await saveSecuritySettings({ data: { guildId, ...state } }); setNotice("Security settings saved."); await router.invalidate(); } catch (e) { setNotice((e as Error).message); } finally { setSaving(false); } }
  return <section className={`${card} p-5`}><div className="mb-5 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300/65" /><div><div className="text-[13px] font-semibold text-white/82">Global protection</div><div className="mt-1 text-[10px] text-white/25">Server-wide security behavior and verification.</div></div></div><button onClick={save} disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/[.1] bg-black px-3.5 text-[11px] font-semibold text-white hover:bg-[#111] disabled:opacity-40"><Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save settings"}</button></div>{notice ? <div className="mb-4 rounded-xl border border-white/[.06] bg-white/[.025] px-3 py-2.5 text-[11px] text-white/58">{notice}</div> : null}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <Field label="Protection profile"><select className={input} value={state.profile} onChange={(e) => set("profile", e.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="extreme">Extreme</option></select></Field>
    <Field label="Security log channel"><select className={input} value={state.log_channel_id ?? ""} onChange={(e) => set("log_channel_id", e.target.value || null)}><option value="">No log channel</option>{data.textChannels.map((c: any) => <option key={c.id} value={c.id}># {c.name}</option>)}</select></Field>
    <Field label="Verification mode"><select className={input} value={state.verification_mode} onChange={(e) => set("verification_mode", e.target.value)}><option value="off">Off</option><option value="button">Button</option><option value="captcha">Captcha</option><option value="questions">Questions</option></select></Field>
    <Field label="Verification role"><select className={input} value={state.verification_role_id ?? ""} onChange={(e) => set("verification_role_id", e.target.value || null)}><option value="">No role</option>{data.roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
    <Field label="Quarantine role"><select className={input} value={state.quarantine_role_id ?? ""} onChange={(e) => set("quarantine_role_id", e.target.value || null)}><option value="">No role</option>{data.roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
    <Field label="Quarantine channel"><select className={input} value={state.quarantine_channel_id ?? ""} onChange={(e) => set("quarantine_channel_id", e.target.value || null)}><option value="">No channel</option>{data.textChannels.map((c: any) => <option key={c.id} value={c.id}># {c.name}</option>)}</select></Field>
    <Field label="Captcha difficulty"><select className={input} value={state.captcha_difficulty} onChange={(e) => set("captcha_difficulty", e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></Field>
    <Toggle label="Global dry-run" value={state.dry_run_global} onChange={(v) => set("dry_run_global", v)} />
    <Toggle label="Raid mode" value={state.raidmode} onChange={(v) => set("raidmode", v)} />
    <Toggle label="Panic mode" value={state.panicmode} onChange={(v) => set("panicmode", v)} />
  </div></section>;
}

function ModuleCard({ guildId, module, value }: { guildId: string; module: SecurityModule; value: any }) {
  const router = useRouter();
  const [state, setState] = useState(value);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const extra = (state.extra && typeof state.extra === "object" ? state.extra : {}) as Record<string, any>;
  async function save() { setSaving(true); setNotice(null); try { await saveSecurityModule({ data: { guildId, module_key: module.key, enabled: !!state.enabled, dry_run: !!state.dry_run, punishment: state.punishment, threshold_count: Number(state.threshold_count), threshold_seconds: Number(state.threshold_seconds), extra: state.extra as Json } }); setNotice("Saved"); await router.invalidate(); } catch (e) { setNotice((e as Error).message); } finally { setSaving(false); } }
  return <div className={`${card} p-4`}><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="text-[12px] font-semibold text-white/78">{module.name}</div><p className="mt-1 text-[10px] leading-4 text-white/27">{module.description}</p></div><button onClick={() => setState((s: any) => ({ ...s, enabled: !s.enabled }))} className={`relative h-6 w-11 shrink-0 rounded-full transition ${state.enabled ? "bg-emerald-500/65" : "bg-white/[.08]"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${state.enabled ? "left-6" : "left-1"}`} /></button></div><div className="mt-4 grid gap-3 sm:grid-cols-2">
    <Field label="Punishment"><select className={input} value={state.punishment} onChange={(e) => setState((s: any) => ({ ...s, punishment: e.target.value }))}>{PUNISHMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select></Field>
    <Toggle label="Dry-run only" value={!!state.dry_run} onChange={(v) => setState((s: any) => ({ ...s, dry_run: v }))} compact />
    {module.supportsThreshold ? <><Field label="Actions"><input type="number" min={1} className={input} value={state.threshold_count} onChange={(e) => setState((s: any) => ({ ...s, threshold_count: Number(e.target.value) }))} /></Field><Field label="Window (seconds)"><input type="number" min={1} className={input} value={state.threshold_seconds} onChange={(e) => setState((s: any) => ({ ...s, threshold_seconds: Number(e.target.value) }))} /></Field></> : null}
    {module.extraFields?.map((field) => field.kind === "extra_number" ? <Field key={field.key} label={field.label}><input type="number" min={field.min} max={field.max} className={input} value={extra[field.key] ?? field.default} onChange={(e) => setState((s: any) => ({ ...s, extra: { ...extra, [field.key]: Number(e.target.value) } }))} /></Field> : field.kind === "extra_text" ? <Field key={field.key} label={field.label}><input className={input} placeholder={field.placeholder} value={extra[field.key] ?? ""} onChange={(e) => setState((s: any) => ({ ...s, extra: { ...extra, [field.key]: e.target.value } }))} /></Field> : null)}
  </div><div className="mt-4 flex items-center justify-between"><span className={`text-[9px] ${notice === "Saved" ? "text-emerald-300/65" : "text-rose-200/65"}`}>{notice}</span><button onClick={save} disabled={saving} className="rounded-lg border border-white/[.08] bg-black px-3 py-2 text-[10px] font-semibold text-white/72 hover:bg-[#111] disabled:opacity-40">{saving ? "Saving…" : "Save module"}</button></div></div>;
}

const LIST_LABELS: Record<ListType, string> = { trusted: "Trusted users", whitelist: "Whitelist", extra_owner: "Extra owners", name_filter: "Name filters", link_whitelist: "Allowed domains", scam_domain: "Scam domains" };
function ListCard({ guildId, type, entries }: { guildId: string; type: ListType; entries: any[] }) {
  const router = useRouter(); const [value, setValue] = useState(""); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState<string | null>(null);
  async function add() { if (!value.trim()) return; setBusy(true); setNotice(null); try { await addSecurityListEntry({ data: { guildId, list_type: type, entry_type: type.includes("domain") ? "domain" : type === "name_filter" ? "pattern" : "user", value, note: null } }); setValue(""); await router.invalidate(); } catch (e) { setNotice((e as Error).message); } finally { setBusy(false); } }
  async function remove(id: string) { setBusy(true); try { await removeSecurityListEntry({ data: { guildId, id } }); await router.invalidate(); } catch (e) { setNotice((e as Error).message); } finally { setBusy(false); } }
  return <div className={`${card} p-4`}><div className="text-[12px] font-semibold text-white/76">{LIST_LABELS[type]}</div><div className="mt-3 flex gap-2"><input className={input} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} placeholder={type.includes("domain") ? "example.com" : "Discord ID or pattern"} /><button onClick={add} disabled={busy || !value.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[.08] bg-black text-white/70 disabled:opacity-35"><Plus className="h-4 w-4" /></button></div>{notice ? <div className="mt-2 text-[9px] text-rose-200/65">{notice}</div> : null}<div className="mt-3 space-y-1.5">{entries.length ? entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/[.025] px-3 py-2"><span className="min-w-0 truncate text-[10px] text-white/52">{entry.value}</span><button onClick={() => remove(entry.id)} disabled={busy} className="text-white/24 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button></div>) : <div className="py-3 text-center text-[10px] text-white/20">No entries.</div>}</div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-2 block text-[9px] font-medium text-white/31">{label}</span>{children}</label>; }
function Toggle({ label, value, onChange, compact = false }: { label: string; value: boolean; onChange: (value: boolean) => void; compact?: boolean }) { return <button type="button" onClick={() => onChange(!value)} className={`${compact ? "min-h-[62px]" : "min-h-[68px]"} flex items-center justify-between gap-3 rounded-xl border border-white/[.06] bg-white/[.018] px-3 text-left`}><span className="text-[10px] text-white/48">{label}</span><span className={`relative h-5 w-9 shrink-0 rounded-full transition ${value ? "bg-emerald-500/65" : "bg-white/[.08]"}`}><span className={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${value ? "left-5" : "left-1"}`} /></span></button>; }
