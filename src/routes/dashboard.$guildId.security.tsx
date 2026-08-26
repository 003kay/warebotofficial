import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  BadgeCheck, Bot, Check, ChevronRight, CircleGauge, Filter, Globe2, Hand, Link2,
  LockKeyhole, Save, Shield, ShieldAlert, SlidersHorizontal, UserRoundCheck, UsersRound, X,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PUNISHMENTS, SECURITY_GROUPS, type SecurityModule } from "@/lib/security-modules";
import { addSecurityListEntry, getSecurityConfig, saveSecurityModule, saveSecuritySettings } from "@/lib/security.functions";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/$guildId/security")({
  head: () => ({ meta: [{ title: "Security Center — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({ queryKey: ["security", params.guildId], queryFn: () => getSecurityConfig({ data: { guildId: params.guildId } }) });
    return null;
  },
  component: SecurityPage,
});

type Area = "automod" | "antinuke" | "joins";
type Section = "automod-general" | "automod-filters" | "automod-discord" | "automod-whitelist" | "antinuke-general" | "antinuke-filters" | "antinuke-panic" | "joins-gate" | "joins-raid" | "joins-verification";
type CoreSettings = { log_channel_id: string | null; dry_run_global: boolean; profile: string; raidmode: boolean; panicmode: boolean; verification_mode: string; verification_role_id: string | null; captcha_difficulty: string; quarantine_role_id: string | null; quarantine_channel_id: string | null };
type ModuleDraft = { enabled: boolean; dry_run: boolean; punishment: string; threshold_count: number; threshold_seconds: number; extra: Json };

const shell = "rounded-[20px] border border-white/[0.06] bg-[#0d0f0f]";
const input = "w-full rounded-xl border border-white/[0.07] bg-[#090a0a] px-3 py-2.5 text-[11px] text-white/76 outline-none transition focus:border-white/[0.17] focus:ring-2 focus:ring-white/[0.025]";

const SECTIONS: Record<Area, { key: Section; label: string; icon: typeof Shield }[]> = {
  automod: [
    { key: "automod-general", label: "General", icon: Globe2 }, { key: "automod-filters", label: "Filters", icon: SlidersHorizontal },
    { key: "automod-discord", label: "Discord AutoMod", icon: Bot }, { key: "automod-whitelist", label: "Whitelist", icon: Hand },
  ],
  antinuke: [
    { key: "antinuke-general", label: "Core protection", icon: Globe2 }, { key: "antinuke-filters", label: "Sensitive actions", icon: Filter }, { key: "antinuke-panic", label: "Panic mode", icon: ShieldAlert },
  ],
  joins: [
    { key: "joins-gate", label: "Join Gate", icon: LockKeyhole }, { key: "joins-raid", label: "Join Raid", icon: UsersRound }, { key: "joins-verification", label: "Verification", icon: BadgeCheck },
  ],
};

function cloneModules(modules: Record<string, ModuleDraft>) {
  return Object.fromEntries(Object.entries(modules).map(([key, value]) => [key, { ...value, extra: value.extra ?? {} }])) as Record<string, ModuleDraft>;
}

function SecurityPage() {
  const { guildId } = Route.useParams();
  const router = useRouter();
  const { data } = useSuspenseQuery({ queryKey: ["security", guildId], queryFn: () => getSecurityConfig({ data: { guildId } }), refetchInterval: 45_000 });
  const [area, setArea] = useState<Area>("automod");
  const [section, setSection] = useState<Section>("automod-general");
  const [core, setCore] = useState<CoreSettings>(data.settings);
  const [savedCore, setSavedCore] = useState<CoreSettings>(data.settings);
  const [modules, setModules] = useState<Record<string, ModuleDraft>>(() => cloneModules(data.modules as Record<string, ModuleDraft>));
  const [savedModules, setSavedModules] = useState<Record<string, ModuleDraft>>(() => cloneModules(data.modules as Record<string, ModuleDraft>));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const allModules = useMemo(() => SECURITY_GROUPS.flatMap(group => group.modules), []);
  const byKey = useMemo(() => new Map(allModules.map(module => [module.key, module])), [allModules]);
  const dirty = JSON.stringify(core) !== JSON.stringify(savedCore) || JSON.stringify(modules) !== JSON.stringify(savedModules);

  const chooseArea = (next: Area) => { setArea(next); setSection(SECTIONS[next][0].key); };
  const moduleKeys = section === "automod-general" ? ["anti_spam", "anti_flood", "anti_mention", "anti_caps", "anti_emojispam", "anti_stickerspam", "anti_ghostping"]
    : section === "automod-filters" ? ["anti_invite", "anti_link", "anti_scam", "anti_token", "anti_nsfw", "filter_words"]
    : section === "antinuke-general" ? ["anti_channel", "anti_role", "anti_ban", "anti_kick", "anti_prune", "anti_emoji", "anti_server"]
    : section === "antinuke-filters" ? ["anti_permission", "anti_bot", "anti_webhook"]
    : section === "joins-raid" ? ["anti_raid", "anti_impersonation", "anti_selfbot"]
    : section === "joins-verification" ? ["verification", "captcha", "agecheck", "altdetect"] : [];
  const visibleModules = moduleKeys.map(key => byKey.get(key)).filter(Boolean) as SecurityModule[];

  function cancelAll() {
    setCore(savedCore);
    setModules(cloneModules(savedModules));
    setNotice(null);
  }

  async function saveAll() {
    setSaving(true); setNotice(null);
    try {
      const coreChanged = JSON.stringify(core) !== JSON.stringify(savedCore);
      const changedKeys = Object.keys(modules).filter(key => JSON.stringify(modules[key]) !== JSON.stringify(savedModules[key]));
      const jobs: Promise<unknown>[] = [];
      if (coreChanged) jobs.push(saveSecuritySettings({ data: { guildId, ...core } }));
      for (const key of changedKeys) {
        const draft = modules[key];
        jobs.push(saveSecurityModule({ data: { guildId, module_key: key, enabled: draft.enabled, dry_run: draft.dry_run, punishment: draft.punishment, threshold_count: draft.threshold_count, threshold_seconds: draft.threshold_seconds, extra: draft.extra ?? {} } }));
      }
      await Promise.all(jobs);
      setSavedCore({ ...core });
      setSavedModules(cloneModules(modules));
      setNotice("All security changes saved");
      await router.invalidate();
    } catch (error) {
      setNotice((error as Error).message || "Could not save changes");
    } finally { setSaving(false); }
  }

  return <DashboardShell guild={data.guild} guildId={guildId} active="security">
    <div className="mx-auto max-w-[1500px] pb-28">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.2em] text-white/24"><Shield className="h-3.5 w-3.5" /> Security workspace</div><h1 className="mt-2 text-[32px] font-semibold tracking-[-.05em] text-white/95">Protection Center</h1><p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-white/31">Configure Ware's protection stack, then save everything together when you're done.</p></div>
        <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] ${data.botInGuild ? "border-emerald-400/15 bg-emerald-400/[.05] text-emerald-100/70" : "border-amber-300/15 bg-amber-300/[.05] text-amber-100/70"}`}><span className={`h-1.5 w-1.5 rounded-full ${data.botInGuild ? "bg-emerald-400" : "bg-amber-300"}`} />{data.botInGuild ? "Ware connected" : "Bot connection unavailable"}</div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <AreaCard active={area === "automod"} icon={CircleGauge} title="AutoMod" detail="Spam, content and message filters" onClick={() => chooseArea("automod")} />
        <AreaCard active={area === "antinuke"} icon={ShieldAlert} title="Anti-Nuke" detail="Destructive action and staff protection" onClick={() => chooseArea("antinuke")} />
        <AreaCard active={area === "joins"} icon={UserRoundCheck} title="Server Joins" detail="Join gate, raids and verification" onClick={() => chooseArea("joins")} />
      </div>

      <div className={`${shell} mb-4 flex gap-1 overflow-x-auto p-1.5`}>{SECTIONS[area].map(item => <button key={item.key} type="button" onClick={() => setSection(item.key)} className={`inline-flex min-w-fit items-center gap-2 rounded-xl px-4 py-2.5 text-[10px] transition ${section === item.key ? "bg-white/[.085] text-white/82 shadow-[inset_0_0_0_1px_rgba(255,255,255,.05)]" : "text-white/31 hover:bg-white/[.035] hover:text-white/65"}`}><item.icon className="h-3.5 w-3.5" />{item.label}</button>)}</div>

      <main className="min-w-0 space-y-4">
        {section === "automod-discord" ? <DiscordAutoModPanel count={data.automodSynced} /> : null}
        {section === "automod-whitelist" ? <WhitelistPanel guildId={guildId} rows={data.lists.link_whitelist ?? []} onChanged={() => router.invalidate()} /> : null}
        {section === "antinuke-panic" ? <PanicPanel data={data} core={core} setCore={setCore} /> : null}
        {section === "joins-gate" ? <JoinGatePanel guildId={guildId} /> : null}
        {section === "joins-verification" ? <VerificationPanel data={data} core={core} setCore={setCore} /> : null}
        {visibleModules.length ? <section className={`${shell} overflow-hidden`}><div className="border-b border-white/[.05] px-5 py-4"><div className="text-[13px] font-semibold text-white/82">{SECTIONS[area].find(item => item.key === section)?.label}</div><div className="mt-1 text-[9px] text-white/25">Changes stay local until you press Save changes.</div></div><div className="grid gap-3 p-3 lg:grid-cols-2">{visibleModules.map(module => <ModuleCard key={module.key} module={module} draft={modules[module.key]} onChange={next => setModules(current => ({ ...current, [module.key]: next }))} />)}</div></section> : null}
      </main>
    </div>

    {dirty ? <div className="fixed bottom-4 right-4 z-[90] w-[min(430px,calc(100vw-32px))] animate-[ware-security-bar_.18s_ease-out]"><style>{`@keyframes ware-security-bar{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style><div className="rounded-[16px] border border-white/[.10] bg-[#0a0b0b]/95 p-3 shadow-[0_20px_70px_rgba(0,0,0,.65)] backdrop-blur-2xl"><div className="flex items-center gap-3"><div className="min-w-0 flex-1"><div className="text-[10px] font-semibold text-white/82">Unsaved security changes</div><div className={`mt-1 truncate text-[8px] ${notice && !notice.includes("saved") ? "text-red-200/55" : "text-white/26"}`}>{notice || "Save once to apply every change on this page."}</div></div><button onClick={cancelAll} disabled={saving} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[.08] px-3 text-[9px] text-white/48 transition hover:bg-white/[.04] hover:text-white/75"><X className="h-3.5 w-3.5" />Cancel</button><button onClick={saveAll} disabled={saving} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-4 text-[9px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-45"><Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save changes"}</button></div></div></div> : notice ? <div className="fixed bottom-4 right-4 z-[90] rounded-xl border border-emerald-400/10 bg-[#0a0b0b]/95 px-4 py-3 text-[9px] text-emerald-200/65 shadow-xl"><Check className="mr-2 inline h-3.5 w-3.5" />{notice}</div> : null}
  </DashboardShell>;
}

function AreaCard({ active, icon: Icon, title, detail, onClick }: { active: boolean; icon: typeof Shield; title: string; detail: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`group relative overflow-hidden rounded-[18px] border p-4 text-left transition-all duration-200 ${active ? "border-white/[.12] bg-gradient-to-br from-white/[.075] to-white/[.025] shadow-[0_14px_35px_rgba(0,0,0,.20)]" : "border-white/[.055] bg-[#0d0f0f] hover:-translate-y-0.5 hover:border-white/[.10] hover:bg-[#111313]"}`}><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-xl border ${active ? "border-white/[.10] bg-white/[.07]" : "border-white/[.05] bg-white/[.025]"}`}><Icon className="h-[18px] w-[18px] text-white/60" /></span><div><div className="text-[12px] font-semibold text-white/78">{title}</div><div className="mt-1 text-[9px] text-white/25">{detail}</div></div><ChevronRight className={`ml-auto h-4 w-4 transition ${active ? "rotate-90 text-white/55" : "text-white/18 group-hover:translate-x-0.5 group-hover:text-white/45"}`} /></div></button>;
}

function ModuleCard({ module, draft, onChange }: { module: SecurityModule; draft: ModuleDraft; onChange: (value: ModuleDraft) => void }) {
  if (!draft) return null;
  return <div className={`rounded-[16px] border p-4 transition-all duration-200 ${draft.enabled ? "border-emerald-400/[.13] bg-gradient-to-br from-emerald-400/[.035] to-white/[.012]" : "border-white/[.05] bg-white/[.015] hover:border-white/[.085]"}`}>
    <div className="flex items-start justify-between gap-3"><button type="button" className="min-w-0 flex-1 text-left" onClick={() => onChange({ ...draft, enabled: !draft.enabled })}><div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${draft.enabled ? "bg-emerald-400" : "bg-white/20"}`} /><div className="text-[11px] font-semibold text-white/76">{module.name}</div></div><div className="mt-1.5 text-[9px] leading-4 text-white/25">{module.description}</div></button><Toggle value={draft.enabled} onChange={enabled => onChange({ ...draft, enabled })} />
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2"><label><span className="mb-1.5 block text-[8px] uppercase tracking-[.12em] text-white/22">Action</span><select className={input} value={draft.punishment} onChange={e => onChange({ ...draft, punishment: e.target.value })}>{PUNISHMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>{module.supportsThreshold ? <><label><span className="mb-1.5 block text-[8px] uppercase tracking-[.12em] text-white/22">Trigger count</span><input className={input} type="number" min={1} value={draft.threshold_count} onChange={e => onChange({ ...draft, threshold_count: Number(e.target.value) })} /></label><label><span className="mb-1.5 block text-[8px] uppercase tracking-[.12em] text-white/22">Window</span><div className="relative"><input className={`${input} pr-16`} type="number" min={1} value={draft.threshold_seconds} onChange={e => onChange({ ...draft, threshold_seconds: Number(e.target.value) })} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-white/20">seconds</span></div></label></> : null}</div>
  </div>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" aria-pressed={value} aria-label={value ? "Disable protection" : "Enable protection"} onClick={() => onChange(!value)} className={`group/toggle relative h-7 w-12 shrink-0 cursor-pointer rounded-full border outline-none transition-all duration-200 hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-white/30 ${value ? "border-emerald-300/30 bg-emerald-400/20 hover:bg-emerald-400/27" : "border-white/[.11] bg-white/[.035] hover:border-white/[.20] hover:bg-white/[.07]"}`}><span className={`absolute top-[3px] h-[19px] w-[19px] rounded-full shadow-[0_2px_8px_rgba(0,0,0,.35)] transition-all duration-200 ${value ? "left-[25px] bg-emerald-300" : "left-[3px] bg-white/48 group-hover/toggle:bg-white/68"}`} /></button>;
}

function DiscordAutoModPanel({ count }: { count: number }) { return <section className={`${shell} p-5`}><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><Bot className="h-4 w-4" /> Discord AutoMod</div><p className="mt-1.5 text-[9px] leading-4 text-white/28">Ware mirrors Discord keyword AutoMod rules so your filters stay in one workspace.</p></div><span className="rounded-full border border-white/[.07] bg-white/[.025] px-3 py-1.5 text-[9px] text-white/45">{count} synced</span></div></section>; }

function WhitelistPanel({ guildId, rows, onChanged }: { guildId: string; rows: { id: string; entry_type: string; value: string; note: string | null }[]; onChanged: () => void }) {
  const [value, setValue] = useState(""); const [saving, setSaving] = useState(false);
  async function add() { if (!value.trim()) return; setSaving(true); try { await addSecurityListEntry({ data: { guildId, list_type: "link_whitelist", entry_type: "domain", value: value.trim(), note: null } }); setValue(""); onChanged(); } finally { setSaving(false); } }
  return <section className={`${shell} p-5`}><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><Link2 className="h-4 w-4" /> Allowed domains</div><p className="mt-1 text-[9px] text-white/25">Domains here bypass Ware's link filter.</p><div className="mt-4 flex gap-2"><input className={input} value={value} onChange={e => setValue(e.target.value)} placeholder="example.com" /><button onClick={add} disabled={saving || !value.trim()} className="rounded-xl bg-white px-4 text-[10px] font-semibold text-black disabled:opacity-40">Add</button></div><div className="mt-4 flex flex-wrap gap-2">{rows.length ? rows.map(row => <span key={row.id} className="rounded-full border border-white/[.06] bg-white/[.025] px-3 py-1.5 text-[9px] text-white/48">{row.value}</span>) : <span className="text-[9px] text-white/22">No domains whitelisted.</span>}</div></section>;
}

function PanicPanel({ data, core, setCore }: { data: any; core: CoreSettings; setCore: React.Dispatch<React.SetStateAction<CoreSettings>> }) {
  return <section className={`${shell} p-5`}><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><ShieldAlert className="h-4 w-4 text-amber-200/60" /> Emergency controls</div><p className="mt-1.5 text-[9px] text-white/27">Use these when the server is actively being raided or damaged.</p><div className="mt-4 grid gap-3 md:grid-cols-2"><CoreToggle label="Panic mode" detail="Lock down and quarantine recent joiners." value={core.panicmode} onChange={v => setCore(s => ({ ...s, panicmode: v }))} /><CoreToggle label="Raid mode" detail="Tighten join handling and suspicious joins." value={core.raidmode} onChange={v => setCore(s => ({ ...s, raidmode: v }))} /><label><span className="mb-1.5 block text-[9px] text-white/30">Protection profile</span><select className={input} value={core.profile} onChange={e => setCore(s => ({ ...s, profile: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="extreme">Extreme</option></select></label><label><span className="mb-1.5 block text-[9px] text-white/30">Security log channel</span><select className={input} value={core.log_channel_id ?? ""} onChange={e => setCore(s => ({ ...s, log_channel_id: e.target.value || null }))}><option value="">No log channel</option>{data.textChannels.map((c: any) => <option key={c.id} value={c.id}># {c.name}</option>)}</select></label></div></section>;
}

function VerificationPanel({ data, core, setCore }: { data: any; core: CoreSettings; setCore: React.Dispatch<React.SetStateAction<CoreSettings>> }) {
  return <section className={`${shell} p-5`}><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><BadgeCheck className="h-4 w-4" /> Verification</div><div className="mt-4 grid gap-3 md:grid-cols-3"><label><span className="mb-1.5 block text-[9px] text-white/30">Mode</span><select className={input} value={core.verification_mode} onChange={e => setCore(s => ({ ...s, verification_mode: e.target.value }))}><option value="off">Off</option><option value="button">Button</option><option value="captcha">Captcha</option><option value="questions">Questions</option></select></label><label><span className="mb-1.5 block text-[9px] text-white/30">Verified role</span><select className={input} value={core.verification_role_id ?? ""} onChange={e => setCore(s => ({ ...s, verification_role_id: e.target.value || null }))}><option value="">No role</option>{data.roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label><span className="mb-1.5 block text-[9px] text-white/30">Captcha difficulty</span><select className={input} value={core.captcha_difficulty} onChange={e => setCore(s => ({ ...s, captcha_difficulty: e.target.value }))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div></section>;
}

function JoinGatePanel({ guildId }: { guildId: string }) { return <a href={`/dashboard/${guildId}/join-gate`} className={`${shell} group flex items-center justify-between p-5 transition hover:border-white/[.11] hover:bg-[#111313]`}><div><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><LockKeyhole className="h-4 w-4" /> Join Gate</div><p className="mt-1.5 text-[9px] text-white/27">Account age, avatar requirements, bot filtering, actions and alerts.</p></div><ChevronRight className="h-4 w-4 text-white/24 transition group-hover:translate-x-1 group-hover:text-white/55" /></a>; }

function CoreToggle({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3 rounded-[14px] border border-white/[.05] bg-white/[.018] p-3.5"><button type="button" onClick={() => onChange(!value)} className="min-w-0 text-left"><div className="text-[10px] font-medium text-white/68">{label}</div><div className="mt-1 text-[8px] text-white/24">{detail}</div></button><Toggle value={value} onChange={onChange} /></div>; }
