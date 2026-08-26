import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  BadgeCheck, Bot, ChevronRight, CircleGauge, Filter, Globe2, Hand, Link2,
  LockKeyhole, Save, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal,
  Sparkles, UserRoundCheck, UsersRound, Zap,
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

const panel = "rounded-[22px] border border-white/[0.06] bg-[#0d0f0f] shadow-[0_18px_70px_rgba(0,0,0,.16)]";
const input = "w-full rounded-xl border border-white/[0.075] bg-[#080a0a] px-3 py-2.5 text-[11px] text-white/76 outline-none transition focus:border-white/[0.18] focus:bg-[#0a0c0c]";

const AREAS: { key: Area; label: string; description: string; icon: typeof Shield }[] = [
  { key: "automod", label: "AutoMod", description: "Messages, links, spam and content filters", icon: CircleGauge },
  { key: "antinuke", label: "Anti-Nuke", description: "Protect destructive server actions", icon: ShieldAlert },
  { key: "joins", label: "Server Joins", description: "Join Gate, raids and verification", icon: UserRoundCheck },
];
const SECTIONS: Record<Area, { key: Section; label: string; icon: typeof Shield }[]> = {
  automod: [
    { key: "automod-general", label: "General", icon: Globe2 },
    { key: "automod-filters", label: "Filters", icon: SlidersHorizontal },
    { key: "automod-discord", label: "Discord AutoMod", icon: Bot },
    { key: "automod-whitelist", label: "Whitelist", icon: Hand },
  ],
  antinuke: [
    { key: "antinuke-general", label: "Core protection", icon: ShieldCheck },
    { key: "antinuke-filters", label: "Sensitive actions", icon: Filter },
    { key: "antinuke-panic", label: "Panic mode", icon: ShieldAlert },
  ],
  joins: [
    { key: "joins-gate", label: "Join Gate", icon: LockKeyhole },
    { key: "joins-raid", label: "Join Raid", icon: UsersRound },
    { key: "joins-verification", label: "Verification", icon: BadgeCheck },
  ],
};

function SecurityPage() {
  const { guildId } = Route.useParams();
  const router = useRouter();
  const { data } = useSuspenseQuery({ queryKey: ["security", guildId], queryFn: () => getSecurityConfig({ data: { guildId } }), refetchInterval: 45_000 });
  const [area, setArea] = useState<Area>("automod");
  const [section, setSection] = useState<Section>("automod-general");
  const [core, setCore] = useState<CoreSettings>(data.settings);
  const [savingCore, setSavingCore] = useState(false);
  const [coreNotice, setCoreNotice] = useState<string | null>(null);

  const allModules = useMemo(() => SECURITY_GROUPS.flatMap(group => group.modules), []);
  const byKey = useMemo(() => new Map(allModules.map(module => [module.key, module])), [allModules]);
  const enabledCount = allModules.filter(module => data.modules[module.key]?.enabled).length;
  const filterCount = (data.lists.word_filter?.length ?? 0) + (data.lists.link_whitelist?.length ?? 0);

  function chooseArea(next: Area) { setArea(next); setSection(SECTIONS[next][0].key); }
  async function saveCore() {
    setSavingCore(true); setCoreNotice(null);
    try { await saveSecuritySettings({ data: { guildId, ...core } }); setCoreNotice("Saved"); await router.invalidate(); }
    catch (error) { setCoreNotice((error as Error).message || "Save failed"); }
    finally { setSavingCore(false); }
  }

  const moduleKeys = (() => {
    switch (section) {
      case "automod-general": return ["anti_spam", "anti_flood", "anti_mention", "anti_caps", "anti_emojispam", "anti_stickerspam", "anti_ghostping"];
      case "automod-filters": return ["anti_invite", "anti_link", "anti_scam", "anti_token", "anti_nsfw", "filter_words"];
      case "antinuke-general": return ["anti_channel", "anti_role", "anti_ban", "anti_kick", "anti_prune", "anti_emoji", "anti_server"];
      case "antinuke-filters": return ["anti_permission", "anti_bot", "anti_webhook"];
      case "joins-raid": return ["anti_raid", "anti_impersonation", "anti_selfbot"];
      case "joins-verification": return ["verification", "captcha", "agecheck", "altdetect"];
      default: return [];
    }
  })();
  const visibleModules = moduleKeys.map(key => byKey.get(key)).filter(Boolean) as SecurityModule[];
  const currentArea = AREAS.find(item => item.key === area)!;
  const currentSection = SECTIONS[area].find(item => item.key === section)!;

  return <DashboardShell guild={data.guild} guildId={guildId} active="security">
    <style>{`@keyframes sec-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div className="mx-auto max-w-[1480px] pb-20">
      <section className="relative overflow-hidden rounded-[24px] border border-white/[.065] bg-[linear-gradient(135deg,#0f1111,#0b0d0d)] p-5 md:p-6">
        <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#a8bdc6]/[.04] blur-3xl" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div><div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[.22em] text-white/25"><Shield className="h-3.5 w-3.5" /> Ware protection</div><h1 className="mt-2 text-[32px] font-semibold tracking-[-.055em] text-white/95">Security Center</h1><p className="mt-1.5 max-w-2xl text-[11px] leading-5 text-white/31">Configure server defense without digging through a wall of settings. Pick a protection area, then tune only the rules you need.</p></div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-[9px] ${data.botInGuild ? "border-emerald-400/15 bg-emerald-400/[.055] text-emerald-100/72" : "border-amber-300/15 bg-amber-300/[.05] text-amber-100/70"}`}><span className={`h-1.5 w-1.5 rounded-full ${data.botInGuild ? "bg-emerald-400" : "bg-amber-300"}`} />{data.botInGuild ? "Protection online" : "Bot connection unavailable"}</div>
        </div>
      </section>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Stat label="Active protections" value={`${enabledCount}/${allModules.length}`} detail="Ware security rules enabled" icon={ShieldCheck} />
        <Stat label="Synced filters" value={String(data.automodSynced)} detail="Discord AutoMod rules mirrored" icon={Bot} />
        <Stat label="Custom lists" value={String(filterCount)} detail="Words and allowed domains" icon={SlidersHorizontal} />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {AREAS.map(item => <AreaCard key={item.key} item={item} active={area === item.key} onClick={() => chooseArea(item.key)} />)}
      </div>

      <section className={`${panel} mt-3 overflow-hidden`}>
        <div className="flex gap-1 overflow-x-auto border-b border-white/[.05] bg-black/10 p-2">
          {SECTIONS[area].map(item => <button key={item.key} type="button" onClick={() => setSection(item.key)} className={`inline-flex min-w-fit items-center gap-2 rounded-[11px] px-3.5 py-2.5 text-[10px] font-medium transition-all ${section === item.key ? "bg-white/[.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.07)]" : "text-white/30 hover:bg-white/[.035] hover:text-white/65"}`}><item.icon className="h-3.5 w-3.5" />{item.label}</button>)}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><div className="text-[13px] font-semibold text-white/82">{currentArea.label} · {currentSection.label}</div><div className="mt-1 text-[9px] text-white/25">{currentArea.description}</div></div><div className="flex items-center gap-2 rounded-full border border-white/[.05] bg-white/[.02] px-3 py-1.5 text-[8px] text-white/28"><Sparkles className="h-3 w-3" /> Changes apply directly to Ware</div></div>
      </section>

      <div key={section} className="mt-3 animate-[sec-in_.22s_ease-out] space-y-3">
        {section === "automod-discord" ? <DiscordAutoModPanel count={data.automodSynced} /> : null}
        {section === "automod-whitelist" ? <WhitelistPanel guildId={guildId} rows={data.lists.link_whitelist ?? []} onChanged={() => router.invalidate()} /> : null}
        {section === "antinuke-panic" ? <PanicPanel data={data} core={core} setCore={setCore} saving={savingCore} notice={coreNotice} onSave={saveCore} /> : null}
        {section === "joins-gate" ? <JoinGatePanel guildId={guildId} /> : null}
        {section === "joins-verification" ? <VerificationPanel data={data} core={core} setCore={setCore} saving={savingCore} notice={coreNotice} onSave={saveCore} /> : null}
        {visibleModules.length ? <section className={`${panel} overflow-hidden`}><div className="grid gap-3 p-3 lg:grid-cols-2">{visibleModules.map(module => <ModuleCard key={module.key} guildId={guildId} module={module} stored={data.modules[module.key]} />)}</div></section> : null}
      </div>
    </div>
  </DashboardShell>;
}

function Stat({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Shield }) {
  return <div className="rounded-[18px] border border-white/[.055] bg-[#0d0f0f] p-4 transition hover:-translate-y-0.5 hover:border-white/[.09]"><div className="flex items-start justify-between"><div><div className="text-[8px] uppercase tracking-[.16em] text-white/22">{label}</div><div className="mt-2 text-[22px] font-semibold tracking-[-.04em] text-white/88">{value}</div><div className="mt-1 text-[9px] text-white/24">{detail}</div></div><div className="grid h-9 w-9 place-items-center rounded-xl border border-white/[.055] bg-white/[.025]"><Icon className="h-4 w-4 text-[#a8bcc5]" /></div></div></div>;
}
function AreaCard({ item, active, onClick }: { item: { key: Area; label: string; description: string; icon: typeof Shield }; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button type="button" onClick={onClick} className={`group relative overflow-hidden rounded-[19px] border p-4 text-left transition-all duration-200 ${active ? "border-white/[.13] bg-[linear-gradient(135deg,rgba(255,255,255,.085),rgba(255,255,255,.025))] shadow-[0_16px_45px_rgba(0,0,0,.22)]" : "border-white/[.055] bg-[#0d0f0f] hover:-translate-y-0.5 hover:border-white/[.10] hover:bg-[#101212]"}`}><div className="flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-[13px] border ${active ? "border-white/[.10] bg-white/[.07]" : "border-white/[.055] bg-white/[.02]"}`}><Icon className={`h-[18px] w-[18px] ${active ? "text-white" : "text-white/42"}`} /></span><div className="min-w-0 flex-1"><div className="text-[12px] font-semibold text-white/82">{item.label}</div><div className="mt-1 truncate text-[9px] text-white/25">{item.description}</div></div><ChevronRight className={`h-4 w-4 transition ${active ? "translate-x-0 text-white/55" : "-translate-x-1 text-white/16 group-hover:translate-x-0 group-hover:text-white/40"}`} /></div>{active ? <div className="absolute inset-x-5 bottom-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" /> : null}</button>;
}

function ModuleCard({ guildId, module, stored }: { guildId: string; module: SecurityModule; stored: { enabled: boolean; dry_run: boolean; punishment: string; threshold_count: number; threshold_seconds: number; extra: Json } }) {
  const [enabled, setEnabled] = useState(Boolean(stored.enabled));
  const [punishment, setPunishment] = useState(stored.punishment || module.defaultPunishment);
  const [count, setCount] = useState(Number(stored.threshold_count || module.defaultCount));
  const [seconds, setSeconds] = useState(Number(stored.threshold_seconds || module.defaultSeconds));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  async function save() { setSaving(true); setSaved(false); try { await saveSecurityModule({ data: { guildId, module_key: module.key, enabled, dry_run: false, punishment, threshold_count: count, threshold_seconds: seconds, extra: stored.extra ?? {} } }); setSaved(true); } finally { setSaving(false); } }
  return <div className={`rounded-[17px] border p-4 transition-all ${enabled ? "border-white/[.08] bg-white/[.025]" : "border-white/[.045] bg-black/10 hover:border-white/[.075]"}`}>
    <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-emerald-400" : "bg-white/18"}`} /><div className="text-[11px] font-semibold text-white/76">{module.name}</div></div><div className="mt-1.5 text-[9px] leading-4 text-white/25">{module.description}</div></div><Switch value={enabled} onChange={setEnabled} /></div>
    <div className="mt-4 grid gap-2 sm:grid-cols-2"><label><span className="mb-1.5 block text-[8px] uppercase tracking-[.12em] text-white/22">Action</span><select className={input} value={punishment} onChange={e => setPunishment(e.target.value)}>{PUNISHMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}</select></label>{module.supportsThreshold ? <><label><span className="mb-1.5 block text-[8px] uppercase tracking-[.12em] text-white/22">Trigger count</span><input className={input} type="number" min={1} value={count} onChange={e => setCount(Number(e.target.value))} /></label><label><span className="mb-1.5 block text-[8px] uppercase tracking-[.12em] text-white/22">Window</span><div className="relative"><input className={`${input} pr-16`} type="number" min={1} value={seconds} onChange={e => setSeconds(Number(e.target.value))} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-white/22">seconds</span></div></label></> : null}</div>
    <div className="mt-3 flex items-center justify-between border-t border-white/[.04] pt-3"><span className={`text-[8px] ${saved ? "text-emerald-200/60" : "text-white/22"}`}>{saved ? "Changes saved" : enabled ? "Protection active" : "Protection disabled"}</span><button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/[.08] bg-white/[.035] px-3 py-2 text-[9px] text-white/65 transition hover:bg-white/[.07] disabled:opacity-40"><Save className="h-3 w-3" />{saving ? "Saving…" : "Save"}</button></div>
  </div>;
}

function Switch({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) { return <button type="button" onClick={() => onChange(!value)} className={`relative h-6 w-11 shrink-0 rounded-full border transition-all ${value ? "border-emerald-400/25 bg-emerald-400/15 shadow-[0_0_18px_rgba(52,211,153,.08)]" : "border-white/[.08] bg-white/[.025]"}`}><span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full transition-all ${value ? "left-[20px] bg-emerald-300" : "left-[3px] bg-white/40"}`} /></button>; }

function DiscordAutoModPanel({ count }: { count: number }) { return <section className={`${panel} p-5`}><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><Bot className="h-4 w-4" /> Discord AutoMod sync</div><p className="mt-1.5 max-w-2xl text-[9px] leading-4 text-white/28">Ware mirrors Discord keyword rules into the security workspace, so you do not have to maintain the same blacklist twice.</p></div><span className="rounded-full border border-white/[.07] bg-white/[.025] px-3 py-1.5 text-[9px] text-white/45">{count} synced</span></div></section>; }
function WhitelistPanel({ guildId, rows, onChanged }: { guildId: string; rows: { id: string; entry_type: string; value: string; note: string | null }[]; onChanged: () => void }) { const [value, setValue] = useState(""); const [saving, setSaving] = useState(false); async function add() { if (!value.trim()) return; setSaving(true); try { await addSecurityListEntry({ data: { guildId, list_type: "link_whitelist", entry_type: "domain", value: value.trim(), note: null } }); setValue(""); onChanged(); } finally { setSaving(false); } } return <section className={`${panel} p-5`}><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><Link2 className="h-4 w-4" /> Allowed domains</div><p className="mt-1 text-[9px] text-white/25">Domains here bypass Ware's link filter.</p><div className="mt-4 flex gap-2"><input className={input} value={value} onChange={e => setValue(e.target.value)} placeholder="example.com" /><button onClick={add} disabled={saving || !value.trim()} className="rounded-xl bg-white px-4 text-[10px] font-semibold text-black disabled:opacity-40">Add</button></div><div className="mt-4 flex flex-wrap gap-2">{rows.length ? rows.map(row => <span key={row.id} className="rounded-full border border-white/[.06] bg-white/[.025] px-3 py-1.5 text-[9px] text-white/48">{row.value}</span>) : <span className="text-[9px] text-white/22">No domains whitelisted.</span>}</div></section>; }
function PanicPanel({ data, core, setCore, saving, notice, onSave }: { data: any; core: CoreSettings; setCore: React.Dispatch<React.SetStateAction<CoreSettings>>; saving: boolean; notice: string | null; onSave: () => void }) { return <section className={`${panel} p-5`}><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><ShieldAlert className="h-4 w-4 text-amber-200/60" /> Emergency controls</div><p className="mt-1.5 text-[9px] text-white/27">Fast server-wide protection for an active raid or destructive event.</p><div className="mt-4 grid gap-3 md:grid-cols-2"><CoreToggle label="Panic mode" detail="Lock down and quarantine recent joiners." value={core.panicmode} onChange={v => setCore(s => ({ ...s, panicmode: v }))} /><CoreToggle label="Raid mode" detail="Tighten join handling and suspicious joins." value={core.raidmode} onChange={v => setCore(s => ({ ...s, raidmode: v }))} /><label><span className="mb-1.5 block text-[9px] text-white/30">Protection profile</span><select className={input} value={core.profile} onChange={e => setCore(s => ({ ...s, profile: e.target.value }))}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="extreme">Extreme</option></select></label><label><span className="mb-1.5 block text-[9px] text-white/30">Security log channel</span><select className={input} value={core.log_channel_id ?? ""} onChange={e => setCore(s => ({ ...s, log_channel_id: e.target.value || null }))}><option value="">No log channel</option>{data.textChannels.map((c: any) => <option key={c.id} value={c.id}># {c.name}</option>)}</select></label></div><SaveRow saving={saving} notice={notice} onSave={onSave} label="Save emergency settings" /></section>; }
function VerificationPanel({ data, core, setCore, saving, notice, onSave }: { data: any; core: CoreSettings; setCore: React.Dispatch<React.SetStateAction<CoreSettings>>; saving: boolean; notice: string | null; onSave: () => void }) { return <section className={`${panel} p-5`}><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><BadgeCheck className="h-4 w-4" /> Verification</div><div className="mt-4 grid gap-3 md:grid-cols-3"><label><span className="mb-1.5 block text-[9px] text-white/30">Mode</span><select className={input} value={core.verification_mode} onChange={e => setCore(s => ({ ...s, verification_mode: e.target.value }))}><option value="off">Off</option><option value="button">Button</option><option value="captcha">Captcha</option><option value="questions">Questions</option></select></label><label><span className="mb-1.5 block text-[9px] text-white/30">Verified role</span><select className={input} value={core.verification_role_id ?? ""} onChange={e => setCore(s => ({ ...s, verification_role_id: e.target.value || null }))}><option value="">No role</option>{data.roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label><span className="mb-1.5 block text-[9px] text-white/30">Captcha difficulty</span><select className={input} value={core.captcha_difficulty} onChange={e => setCore(s => ({ ...s, captcha_difficulty: e.target.value }))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div><SaveRow saving={saving} notice={notice} onSave={onSave} label="Save verification" /></section>; }
function JoinGatePanel({ guildId }: { guildId: string }) { return <a href={`/dashboard/${guildId}/join-gate`} className={`${panel} group flex items-center justify-between p-5 transition-all hover:-translate-y-0.5 hover:border-white/[.11] hover:bg-[#111313]`}><div><div className="flex items-center gap-2 text-[12px] font-semibold text-white/80"><LockKeyhole className="h-4 w-4" /> Join Gate controls</div><p className="mt-1.5 text-[9px] text-white/27">Account age, avatar rules, suspicious bot adds, actions and alert channel.</p></div><ChevronRight className="h-4 w-4 text-white/24 transition group-hover:translate-x-1 group-hover:text-white/55" /></a>; }
function CoreToggle({ label, detail, value, onChange }: { label: string; detail: string; value: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between gap-3 rounded-[14px] border border-white/[.05] bg-white/[.018] p-3.5"><div><div className="text-[10px] font-medium text-white/68">{label}</div><div className="mt-1 text-[8px] text-white/24">{detail}</div></div><Switch value={value} onChange={onChange} /></div>; }
function SaveRow({ saving, notice, onSave, label }: { saving: boolean; notice: string | null; onSave: () => void; label: string }) { return <div className="mt-4 flex items-center justify-between border-t border-white/[.04] pt-4"><span className="text-[9px] text-white/28">{notice}</span><button onClick={onSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-40"><Save className="h-3.5 w-3.5" />{saving ? "Saving…" : label}</button></div>; }
