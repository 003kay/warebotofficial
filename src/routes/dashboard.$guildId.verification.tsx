import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BadgeCheck, CheckCircle2, Hash, Image as ImageIcon, KeyRound, LockKeyhole, RefreshCw, Save, Send, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ModernSelect } from "@/components/dashboard/ModernSelect";
import { getDashboardSettings, publishVerificationPanel, saveDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/verification")({
  head: () => ({ meta: [{ title: "Verification" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({ queryKey: ["dashboardSettings", params.guildId], queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }) });
    return null;
  },
  component: VerificationPage,
});

type VerificationMode = "captcha_channel" | "captcha_dm" | "instant";
type Values = {
  enabled: boolean;
  mode: VerificationMode;
  channelId: string;
  giveRoleId: string;
  removeRoleId: string;
  assignRemoveRoleOnJoin: boolean;
  captchaLength: number;
  timeoutMinutes: number;
  captchaWidth: number;
  captchaHeight: number;
  fontSize: number;
  caseSensitive: boolean;
  decoyTrace: boolean;
  decoyCharacters: boolean;
  decoyDots: boolean;
};

const panel = "rounded-[22px] border border-white/[.065] bg-[linear-gradient(145deg,#0d1014,#090b0e)] shadow-[0_20px_70px_rgba(0,0,0,.20)]";
const input = "w-full rounded-[14px] border border-white/[.075] bg-[#07090c] px-4 py-3 text-[12px] font-bold text-white/82 outline-none transition focus:border-[#6d7fd2]/35 focus:ring-2 focus:ring-[#596cc4]/10";

function Toggle({ value, onChange, disabled = false }: { value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={() => onChange(!value)} className={`relative h-7 w-12 rounded-full border transition disabled:opacity-35 ${value ? "border-[#5fe2ba]/25 bg-[#2d9d7f]/20" : "border-white/[.09] bg-white/[.035]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full transition-all ${value ? "left-6 bg-[#71e8c4] shadow-[0_0_18px_rgba(95,226,186,.22)]" : "left-1 bg-white/42"}`} /></button>;
}

function Row({ title, detail, children, locked = false }: { title: string; detail: string; children: React.ReactNode; locked?: boolean }) {
  return <div className={`grid gap-4 border-t border-white/[.05] px-5 py-5 first:border-0 md:grid-cols-[minmax(0,1fr)_420px] md:items-center ${locked ? "opacity-35" : ""}`}><div><div className="flex items-center gap-2"><div className="text-[12px] font-black text-white/84">{title}</div><span className="rounded-full border border-[#6c7dd1]/15 bg-[#5364b0]/10 px-2 py-0.5 text-[7px] font-black uppercase tracking-[.12em] text-[#adb8f4]/55">Included</span></div><div className="mt-1.5 max-w-2xl text-[10px] font-semibold leading-4 text-white/28">{detail}</div></div><div>{children}</div></div>;
}

function VerificationPage() {
  const { guildId } = Route.useParams();
  const query = useQuery({ queryKey: ["dashboardSettings", guildId], queryFn: () => getDashboardSettings({ data: { guildId } }), staleTime: 10_000 });
  const data = query.data;
  const stored = ((data?.settings?.verification as Record<string, unknown>) ?? {});
  const initial = useMemo<Values>(() => ({
    enabled: Boolean(stored.enabled ?? false),
    mode: String(stored.mode ?? "captcha_channel") as VerificationMode,
    channelId: String(stored.channelId ?? ""),
    giveRoleId: String(stored.giveRoleId ?? ""),
    removeRoleId: String(stored.removeRoleId ?? ""),
    assignRemoveRoleOnJoin: Boolean(stored.assignRemoveRoleOnJoin ?? true),
    captchaLength: Math.max(4, Math.min(8, Number(stored.captchaLength ?? 6))),
    timeoutMinutes: Math.max(1, Math.min(60, Number(stored.timeoutMinutes ?? 5))),
    captchaWidth: Math.max(280, Math.min(720, Number(stored.captchaWidth ?? 420))),
    captchaHeight: Math.max(100, Math.min(260, Number(stored.captchaHeight ?? 150))),
    fontSize: Math.max(28, Math.min(90, Number(stored.fontSize ?? 52))),
    caseSensitive: Boolean(stored.caseSensitive ?? false),
    decoyTrace: Boolean(stored.decoyTrace ?? true),
    decoyCharacters: Boolean(stored.decoyCharacters ?? true),
    decoyDots: Boolean(stored.decoyDots ?? true),
  }), [query.dataUpdatedAt]);
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const set = <K extends keyof Values>(key: K, value: Values[K]) => { setValues(current => ({ ...current, [key]: value })); setNotice(null); };

  if (query.isPending || !data) return <div className="grid min-h-screen place-items-center bg-[#05070a] text-white/40"><RefreshCw className="h-5 w-5 animate-spin" /></div>;

  const channelOptions = [{ label: "Select verification channel", value: "" }, ...data.textChannels.map(channel => ({ label: `#${channel.name}`, value: channel.id }))];
  const roleOptions = [{ label: "No role", value: "" }, ...data.roles.map(role => ({ label: role.name, value: role.id }))];
  const locked = !values.enabled;

  async function save() {
    setSaving(true); setNotice(null);
    try {
      await saveDashboardSettings({ data: { guildId, section: "verification", values } });
      setNotice("Saved — Ware will sync this configuration automatically.");
      await query.refetch();
    } catch (error) { setNotice((error as Error).message); }
    finally { setSaving(false); }
  }

  async function publish() {
    if (!values.channelId) { setNotice("Choose a verification channel first."); return; }
    setPublishing(true); setNotice(null);
    try {
      await saveDashboardSettings({ data: { guildId, section: "verification", values } });
      await publishVerificationPanel({ data: { guildId, channelId: values.channelId } });
      setNotice("Verification panel published to Discord.");
    } catch (error) { setNotice((error as Error).message); }
    finally { setPublishing(false); }
  }

  return <DashboardShell guild={data.guild} guildId={guildId} active="verification"><div className="mx-auto w-full max-w-[1480px] pb-20">
    <section className="overflow-hidden rounded-[26px] border border-[#6174c9]/12 bg-[radial-gradient(circle_at_78%_0%,rgba(84,103,190,.16),transparent_32%),linear-gradient(135deg,#10131a,#090b0e)] p-6 md:p-7">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.19em] text-[#9aa9ed]/55"><BadgeCheck className="h-4 w-4" /> Member access</div><h1 className="mt-2 text-[36px] font-black tracking-[-.055em] text-white/95">Verification</h1><p className="mt-2 max-w-2xl text-[12px] font-semibold leading-5 text-white/34">Captcha verification, role handoff, and private challenges. Every verification feature is included with Ware.</p></div><div className="flex gap-2"><button onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-[13px] border border-white/[.08] bg-white/[.045] px-4 text-[10px] font-black text-white/72 hover:bg-white/[.08] disabled:opacity-40"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save"}</button><button onClick={publish} disabled={publishing || !values.enabled} className="inline-flex h-10 items-center gap-2 rounded-[13px] bg-[#6577d2] px-4 text-[10px] font-black text-white shadow-[0_12px_34px_rgba(71,88,177,.18)] hover:bg-[#7183dc] disabled:opacity-35"><Send className="h-4 w-4" />{publishing ? "Publishing…" : "Publish panel"}</button></div></div>
      {notice ? <div className="mt-5 rounded-[13px] border border-white/[.06] bg-black/20 px-4 py-3 text-[10px] font-bold text-white/50">{notice}</div> : null}
    </section>

    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,.72fr)]">
      <div className="space-y-4">
        <section className={`${panel} overflow-visible`}><div className="flex items-center gap-3 border-b border-white/[.055] px-5 py-4"><span className="grid h-9 w-9 place-items-center rounded-[11px] border border-[#6375c9]/12 bg-[#5364b0]/10"><ShieldCheck className="h-4 w-4 text-[#9eace8]/65" /></span><div><div className="text-[13px] font-black text-white/84">General</div><div className="mt-0.5 text-[9px] font-semibold text-white/26">Choose who verifies and what Ware changes after success.</div></div></div>
          <Row title="Enable verification" detail="Nothing happens until you turn this on yourself."><Toggle value={values.enabled} onChange={value => set("enabled", value)} /></Row>
          <Row title="Verification mode" detail="Channel captcha keeps the challenge private in the server. DM captcha sends it directly to the member. Instant Access skips the captcha." locked={locked}><ModernSelect disabled={locked} value={values.mode} onChange={value => set("mode", value as VerificationMode)} options={[{label:"Ware Captcha (Channel)",value:"captcha_channel"},{label:"Ware Captcha (DMs)",value:"captcha_dm"},{label:"Instant Access",value:"instant"}]} /></Row>
          <Row title="Verification channel" detail="Where the public Verify panel is posted." locked={locked}><ModernSelect disabled={locked} value={values.channelId} onChange={value => set("channelId", value)} options={channelOptions} /></Row>
          <Row title="Give role" detail="Role Ware adds after the member passes verification." locked={locked}><ModernSelect disabled={locked} value={values.giveRoleId} onChange={value => set("giveRoleId", value)} options={roleOptions} /></Row>
          <Row title="Remove role" detail="Role Ware removes after verification. This is normally your Unverified / Locked role." locked={locked}><ModernSelect disabled={locked} value={values.removeRoleId} onChange={value => set("removeRoleId", value)} options={roleOptions} /></Row>
          <Row title="Give unverified role on join" detail="When enabled, Ware automatically gives the Remove Role to new members until they verify." locked={locked}><Toggle disabled={locked} value={values.assignRemoveRoleOnJoin} onChange={value => set("assignRemoveRoleOnJoin", value)} /></Row>
        </section>

        <section className={`${panel} overflow-hidden`}><div className="flex items-center justify-between border-b border-white/[.055] px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-[11px] border border-[#6375c9]/12 bg-[#5364b0]/10"><ImageIcon className="h-4 w-4 text-[#9eace8]/65" /></span><div><div className="text-[13px] font-black text-white/84">Ware Captcha</div><div className="mt-0.5 text-[9px] font-semibold text-white/26">Image challenges generated separately for each member.</div></div></div><span className="rounded-full border border-[#59d4af]/15 bg-[#2f9d80]/8 px-2.5 py-1 text-[7px] font-black uppercase tracking-[.14em] text-[#83dfc6]/65">Free</span></div>
          <Row title="Captcha answer length" detail="How many characters appear in each random challenge." locked={locked}><div className="grid grid-cols-[1fr_auto] items-center gap-3"><input className={input} disabled={locked} type="number" min={4} max={8} value={values.captchaLength} onChange={e => set("captchaLength", Math.max(4, Math.min(8, Number(e.target.value))))} /><span className="text-[10px] font-bold text-white/28">Characters</span></div></Row>
          <Row title="Verification duration" detail="How long a generated challenge remains valid." locked={locked}><div className="grid grid-cols-[1fr_auto] items-center gap-3"><input className={input} disabled={locked} type="number" min={1} max={60} value={values.timeoutMinutes} onChange={e => set("timeoutMinutes", Math.max(1, Math.min(60, Number(e.target.value))))} /><span className="text-[10px] font-bold text-white/28">Minutes</span></div></Row>
          <Row title="Captcha size" detail="Control the generated image dimensions." locked={locked}><div className="grid grid-cols-2 gap-2"><input className={input} disabled={locked} type="number" min={280} max={720} value={values.captchaWidth} onChange={e => set("captchaWidth", Number(e.target.value))} /><input className={input} disabled={locked} type="number" min={100} max={260} value={values.captchaHeight} onChange={e => set("captchaHeight", Number(e.target.value))} /></div></Row>
          <Row title="Font size" detail="Make the real answer large enough to read while decoys stay subtle." locked={locked}><input className={input} disabled={locked} type="number" min={28} max={90} value={values.fontSize} onChange={e => set("fontSize", Number(e.target.value))} /></Row>
          <Row title="Case sensitive" detail="Require the member to match uppercase/lowercase exactly." locked={locked}><Toggle disabled={locked} value={values.caseSensitive} onChange={value => set("caseSensitive", value)} /></Row>
          <Row title="Colored trace" detail="Draw a soft line through the answer to make automated OCR harder." locked={locked}><Toggle disabled={locked} value={values.decoyTrace} onChange={value => set("decoyTrace", value)} /></Row>
          <Row title="Mixed decoy characters" detail="Place faint fake characters under and around the answer." locked={locked}><Toggle disabled={locked} value={values.decoyCharacters} onChange={value => set("decoyCharacters", value)} /></Row>
          <Row title="Spread decoys" detail="Add subtle dots and shapes around the challenge." locked={locked}><Toggle disabled={locked} value={values.decoyDots} onChange={value => set("decoyDots", value)} /></Row>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-[88px] xl:self-start">
        <section className={`${panel} overflow-hidden`}><div className="flex items-center justify-between border-b border-white/[.055] px-5 py-4"><div><div className="text-[13px] font-black text-white/84">Captcha preview</div><div className="mt-1 text-[9px] font-semibold text-white/25">Actual Discord challenges are randomized.</div></div><Sparkles className="h-4 w-4 text-[#98a6e8]/55" /></div><div className="p-5"><div className="relative grid min-h-[190px] place-items-center overflow-hidden rounded-[18px] border border-[#6477cd]/16 bg-[radial-gradient(circle_at_25%_20%,rgba(80,105,190,.15),transparent_26%),linear-gradient(135deg,#0b1016,#12151b)]"><div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:19px_19px]" /><div className="relative rotate-[-2deg] font-mono text-[42px] font-black tracking-[.22em] text-white/85 drop-shadow-[0_0_18px_rgba(117,139,225,.18)]">W4R3X9</div><div className="absolute left-[15%] top-1/2 h-px w-[70%] rotate-[7deg] bg-[linear-gradient(90deg,transparent,#697fd9,transparent)] opacity-55" /></div><div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-[14px] border border-white/[.055] bg-white/[.018] p-3"><KeyRound className="h-4 w-4 text-[#94a5ed]/55" /><div className="mt-2 text-[10px] font-black text-white/66">Private challenge</div><div className="mt-1 text-[9px] text-white/25">Each user receives their own code.</div></div><div className="rounded-[14px] border border-white/[.055] bg-white/[.018] p-3"><UserRoundCheck className="h-4 w-4 text-[#71dabd]/55" /><div className="mt-2 text-[10px] font-black text-white/66">Role handoff</div><div className="mt-1 text-[9px] text-white/25">Give + remove roles instantly.</div></div></div></div></section>
        <section className={`${panel} p-5`}><div className="flex items-center gap-2 text-[11px] font-black text-white/72"><CheckCircle2 className="h-4 w-4 text-[#70d9bb]/65" />How it works</div><div className="mt-4 space-y-3 text-[10px] font-semibold leading-5 text-white/32"><div><b className="text-white/62">1.</b> Member presses Verify.</div><div><b className="text-white/62">2.</b> Ware creates a private captcha image.</div><div><b className="text-white/62">3.</b> Member types the code into Ware's modal.</div><div><b className="text-white/62">4.</b> Ware gives the verified role and removes the unverified role.</div></div></section>
      </aside>
    </div>
  </div></DashboardShell>;
}
