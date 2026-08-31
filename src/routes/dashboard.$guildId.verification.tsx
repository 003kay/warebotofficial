import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CheckCircle2, Image as ImageIcon, RefreshCw, Save, Send, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ModernSelect } from "@/components/dashboard/ModernSelect";
import { getDashboardSettings, publishVerificationPanel, saveDashboardSettings } from "@/lib/dashboard-settings.functions";
import { getSecurityConfig } from "@/lib/security.functions";

export const Route = createFileRoute("/dashboard/$guildId/verification")({
  head: () => ({ meta: [{ title: "Verification" }] }),
  loader: async ({ context, params }) => {
    await Promise.allSettled([
      context.queryClient.ensureQueryData({
        queryKey: ["dashboardSettings", params.guildId],
        queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["security", params.guildId],
        queryFn: () => getSecurityConfig({ data: { guildId: params.guildId } }),
      }),
    ]);
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

type Option = { label: string; value: string; hint?: string };

const panel = "rounded-[24px] border border-white/[.065] bg-[#0b0e12] shadow-[0_22px_80px_rgba(0,0,0,.24)]";
const input = "h-[50px] w-full rounded-[15px] border border-white/[.075] bg-[#07090d] px-4 text-[12px] font-bold text-white/86 outline-none transition placeholder:text-white/20 focus:border-[#6b7dd4]/38 focus:ring-2 focus:ring-[#6072c9]/10 disabled:cursor-not-allowed disabled:opacity-35";

function Toggle({ value, onChange, disabled = false }: { value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-8 w-[56px] shrink-0 items-center rounded-full border p-[3px] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
        value
          ? "border-[#55d6b2]/30 bg-[#1f725f]/38 shadow-[inset_0_0_0_1px_rgba(88,224,185,.035)]"
          : "border-white/[.09] bg-[#15181c]"
      }`}
    >
      <span
        className={`h-6 w-6 rounded-full shadow-[0_3px_10px_rgba(0,0,0,.35)] transition-transform duration-200 ${
          value ? "translate-x-6 bg-[#72e5c3]" : "translate-x-0 bg-[#71767f]"
        }`}
      />
    </button>
  );
}

function FieldCard({ title, detail, children, disabled = false }: { title: string; detail: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div className={`rounded-[18px] border border-white/[.055] bg-[#090b0f] p-4 transition ${disabled ? "opacity-38" : "hover:border-white/[.085]"}`}>
      <div className="mb-3">
        <div className="text-[12px] font-black tracking-[-.01em] text-white/82">{title}</div>
        <div className="mt-1 text-[9px] font-semibold leading-4 text-white/27">{detail}</div>
      </div>
      {children}
    </div>
  );
}

function ToggleCard({ title, detail, value, onChange, disabled = false }: { title: string; detail: string; value: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <div className={`flex min-h-[112px] items-start justify-between gap-5 rounded-[18px] border border-white/[.055] bg-[#090b0f] p-4 transition ${disabled ? "opacity-38" : "hover:border-white/[.085]"}`}>
      <div className="min-w-0">
        <div className="text-[12px] font-black text-white/82">{title}</div>
        <div className="mt-1.5 max-w-md text-[9px] font-semibold leading-4 text-white/27">{detail}</div>
      </div>
      <Toggle disabled={disabled} value={value} onChange={onChange} />
    </div>
  );
}

function mergeOptions(primary: Option[], secondary: Option[], empty: Option): Option[] {
  const map = new Map<string, Option>();
  for (const option of [...primary, ...secondary]) if (option.value) map.set(option.value, option);
  return [empty, ...map.values()];
}

function VerificationPage() {
  const { guildId } = Route.useParams();
  const dashboardQuery = useQuery({
    queryKey: ["dashboardSettings", guildId],
    queryFn: () => getDashboardSettings({ data: { guildId } }),
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });
  const securityQuery = useQuery({
    queryKey: ["security", guildId],
    queryFn: () => getSecurityConfig({ data: { guildId } }),
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const data = dashboardQuery.data;
  const stored = ((data?.settings?.verification as Record<string, unknown>) ?? {});
  const derived = useMemo<Values>(() => ({
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
  }), [data?.updatedAt]);

  const [values, setValues] = useState<Values>(derived);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!dirty) setValues(derived);
  }, [derived, dirty]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues(current => ({ ...current, [key]: value }));
    setDirty(true);
    setNotice(null);
  };

  if (dashboardQuery.isPending || !data) {
    return <div className="grid min-h-screen place-items-center bg-[#05070a] text-white/40"><RefreshCw className="h-5 w-5 animate-spin" /></div>;
  }

  const security = securityQuery.data;
  const dashboardChannels: Option[] = (data.textChannels ?? []).map(channel => ({ label: `#${channel.name}`, value: channel.id, hint: "Discord text channel" }));
  const securityChannels: Option[] = (security?.textChannels ?? []).map(channel => ({ label: `#${channel.name}`, value: channel.id, hint: "Discord text channel" }));
  const channelOptions = mergeOptions(dashboardChannels, securityChannels, { label: "Choose a verification channel", value: "" });

  const dashboardRoles: Option[] = (data.roles ?? []).map(role => ({ label: role.name, value: role.id, hint: "Server role" }));
  const securityRoles: Option[] = (security?.roles ?? []).map(role => ({ label: role.name, value: role.id, hint: "Server role" }));
  const roleOptions = mergeOptions(dashboardRoles, securityRoles, { label: "No role", value: "" });

  const hasChannels = channelOptions.length > 1;
  const hasRoles = roleOptions.length > 1;
  const locked = !values.enabled;

  async function reloadDiscord() {
    setNotice(null);
    await Promise.allSettled([dashboardQuery.refetch(), securityQuery.refetch()]);
  }

  async function save() {
    setSaving(true);
    setNotice(null);
    try {
      await saveDashboardSettings({ data: { guildId, section: "verification", values } });
      setDirty(false);
      setNotice("Saved. Ware will pick up the changes automatically.");
      await Promise.allSettled([dashboardQuery.refetch(), securityQuery.refetch()]);
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!values.channelId) {
      setNotice("Choose a verification channel first.");
      return;
    }
    setPublishing(true);
    setNotice(null);
    try {
      await saveDashboardSettings({ data: { guildId, section: "verification", values } });
      await publishVerificationPanel({ data: { guildId, channelId: values.channelId } });
      setDirty(false);
      setNotice("Verification panel published to Discord.");
    } catch (error) {
      setNotice((error as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="verification">
      <div className="mx-auto w-full max-w-[1640px] pb-20">
        <section className="rounded-[28px] border border-white/[.065] bg-[linear-gradient(135deg,#10131a,#090b0f)] p-6 md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.20em] text-[#8496df]/60"><BadgeCheck className="h-4 w-4" /> Member access</div>
              <h1 className="mt-2 text-[38px] font-black tracking-[-.055em] text-white/96 md:text-[44px]">Verification</h1>
              <p className="mt-2 max-w-3xl text-[12px] font-semibold leading-5 text-white/34">Control how members prove they are human, which roles change after verification, and how Ware generates each private captcha.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={reloadDiscord} className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-white/[.08] bg-white/[.035] px-4 text-[10px] font-black text-white/58 transition hover:bg-white/[.07] hover:text-white/84"><RefreshCw className={`h-3.5 w-3.5 ${dashboardQuery.isFetching || securityQuery.isFetching ? "animate-spin" : ""}`} />Reload Discord</button>
              <button type="button" onClick={save} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-[14px] border border-white/[.08] bg-white/[.05] px-5 text-[10px] font-black text-white/78 transition hover:bg-white/[.09] disabled:opacity-40"><Save className="h-4 w-4" />{saving ? "Saving…" : "Save changes"}</button>
              <button type="button" onClick={publish} disabled={publishing || !values.enabled || !values.channelId} className="inline-flex h-11 items-center gap-2 rounded-[14px] bg-[#6678d4] px-5 text-[10px] font-black text-white shadow-[0_14px_36px_rgba(74,91,182,.2)] transition hover:bg-[#7486df] disabled:opacity-35"><Send className="h-4 w-4" />{publishing ? "Publishing…" : "Publish Verify panel"}</button>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/[.055] pt-5">
            <span className={`rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] ${values.enabled ? "border-emerald-300/15 bg-emerald-300/[.055] text-emerald-200/70" : "border-white/[.07] bg-white/[.025] text-white/32"}`}>{values.enabled ? "Verification enabled" : "Verification disabled"}</span>
            <span className="rounded-full border border-[#6174cb]/15 bg-[#5364b0]/8 px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] text-[#aeb9ef]/55">All captcha features included</span>
            <span className={`rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] ${hasChannels ? "border-emerald-300/12 bg-emerald-300/[.04] text-emerald-100/55" : "border-amber-300/14 bg-amber-300/[.045] text-amber-100/65"}`}>{hasChannels ? `${channelOptions.length - 1} channels loaded` : "No channels loaded"}</span>
          </div>
          {notice ? <div className="mt-4 rounded-[14px] border border-white/[.06] bg-black/20 px-4 py-3 text-[10px] font-bold text-white/52">{notice}</div> : null}
        </section>

        {!hasChannels ? (
          <section className="mt-4 flex flex-col gap-3 rounded-[18px] border border-amber-300/[.12] bg-amber-300/[.035] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="text-[11px] font-black text-amber-100/76">Ware could not load the server channel list.</div><div className="mt-1 text-[9px] font-semibold text-amber-100/38">Use Reload Discord. If the list stays empty, Ware needs access to this server through the dashboard bot connection.</div></div>
            <button type="button" onClick={reloadDiscord} className="shrink-0 rounded-[12px] border border-amber-200/[.12] bg-amber-100/[.06] px-4 py-2.5 text-[9px] font-black text-amber-100/72">Try again</button>
          </section>
        ) : null}

        <section className={`${panel} mt-4 overflow-visible p-4 md:p-5`}>
          <div className="mb-4 flex items-center justify-between gap-4 px-1">
            <div><div className="text-[15px] font-black text-white/88">Verification setup</div><div className="mt-1 text-[10px] font-semibold text-white/27">The important controls are kept together instead of squeezed into narrow rows.</div></div>
            <ShieldCheck className="h-5 w-5 text-[#8697df]/50" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
            <ToggleCard title="Enable verification" detail="Nothing runs until you turn this on and save it." value={values.enabled} onChange={value => set("enabled", value)} />
            <FieldCard title="Verification mode" detail="Choose an in-server captcha, a DM captcha, or Instant Access." disabled={locked}><ModernSelect disabled={locked} value={values.mode} onChange={value => set("mode", value as VerificationMode)} options={[{ label: "Ware Captcha · Channel", value: "captcha_channel", hint: "Private challenge inside the server" }, { label: "Ware Captcha · DMs", value: "captcha_dm", hint: "Challenge is sent directly to the member" }, { label: "Instant Access", value: "instant", hint: "No captcha; roles change immediately" }]} /></FieldCard>
            <FieldCard title="Verification channel" detail="Where Ware posts the public Verify button." disabled={locked}><ModernSelect disabled={locked || !hasChannels} value={values.channelId} onChange={value => set("channelId", value)} options={channelOptions} placeholder={hasChannels ? "Choose a channel" : "No channels available"} /></FieldCard>
            <FieldCard title="Give role" detail="Role added after the member passes verification." disabled={locked}><ModernSelect disabled={locked || !hasRoles} value={values.giveRoleId} onChange={value => set("giveRoleId", value)} options={roleOptions} placeholder={hasRoles ? "Choose a role" : "No roles available"} /></FieldCard>
            <FieldCard title="Remove role" detail="Usually your Unverified or Locked role. Ware removes it after success." disabled={locked}><ModernSelect disabled={locked || !hasRoles} value={values.removeRoleId} onChange={value => set("removeRoleId", value)} options={roleOptions} placeholder={hasRoles ? "Choose a role" : "No roles available"} /></FieldCard>
            <ToggleCard title="Give unverified role on join" detail="Automatically give the Remove Role to new members until they verify." disabled={locked} value={values.assignRemoveRoleOnJoin} onChange={value => set("assignRemoveRoleOnJoin", value)} />
          </div>
        </section>

        <section className={`${panel} mt-4 overflow-hidden`}>
          <div className="flex flex-col gap-2 border-b border-white/[.055] px-5 py-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div><div className="text-[15px] font-black text-white/88">Captcha designer</div><div className="mt-1 text-[10px] font-semibold text-white/27">Tune the generated image without hiding the controls in a skinny column.</div></div>
            <span className="rounded-full border border-[#56d0ad]/12 bg-[#2d9c80]/7 px-3 py-1.5 text-[8px] font-black uppercase tracking-[.12em] text-[#82dcc3]/58">Included</span>
          </div>

          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(440px,.78fr)]">
            <div className={`p-4 md:p-6 ${locked ? "opacity-38" : ""}`}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <FieldCard title="Answer length" detail="Random characters in each challenge." disabled={locked}><div className="grid grid-cols-[1fr_auto] items-center gap-3"><input className={input} disabled={locked} type="number" min={4} max={8} value={values.captchaLength} onChange={e => set("captchaLength", Math.max(4, Math.min(8, Number(e.target.value))))} /><span className="text-[9px] font-black uppercase tracking-[.1em] text-white/25">chars</span></div></FieldCard>
                <FieldCard title="Challenge lifetime" detail="How long the code stays valid." disabled={locked}><div className="grid grid-cols-[1fr_auto] items-center gap-3"><input className={input} disabled={locked} type="number" min={1} max={60} value={values.timeoutMinutes} onChange={e => set("timeoutMinutes", Math.max(1, Math.min(60, Number(e.target.value))))} /><span className="text-[9px] font-black uppercase tracking-[.1em] text-white/25">min</span></div></FieldCard>
                <FieldCard title="Font size" detail="Size of the real captcha answer." disabled={locked}><div className="grid grid-cols-[1fr_auto] items-center gap-3"><input className={input} disabled={locked} type="number" min={28} max={90} value={values.fontSize} onChange={e => set("fontSize", Math.max(28, Math.min(90, Number(e.target.value))))} /><span className="text-[9px] font-black uppercase tracking-[.1em] text-white/25">px</span></div></FieldCard>
                <FieldCard title="Image width" detail="Width of each generated captcha." disabled={locked}><div className="grid grid-cols-[1fr_auto] items-center gap-3"><input className={input} disabled={locked} type="number" min={280} max={720} value={values.captchaWidth} onChange={e => set("captchaWidth", Math.max(280, Math.min(720, Number(e.target.value))))} /><span className="text-[9px] font-black uppercase tracking-[.1em] text-white/25">px</span></div></FieldCard>
                <FieldCard title="Image height" detail="Height of each generated captcha." disabled={locked}><div className="grid grid-cols-[1fr_auto] items-center gap-3"><input className={input} disabled={locked} type="number" min={100} max={260} value={values.captchaHeight} onChange={e => set("captchaHeight", Math.max(100, Math.min(260, Number(e.target.value))))} /><span className="text-[9px] font-black uppercase tracking-[.1em] text-white/25">px</span></div></FieldCard>
                <ToggleCard title="Case sensitive" detail="Require uppercase and lowercase to match exactly." disabled={locked} value={values.caseSensitive} onChange={value => set("caseSensitive", value)} />
                <ToggleCard title="Colored trace" detail="Draw a faint line through the answer." disabled={locked} value={values.decoyTrace} onChange={value => set("decoyTrace", value)} />
                <ToggleCard title="Mixed decoy characters" detail="Place fake characters around the answer." disabled={locked} value={values.decoyCharacters} onChange={value => set("decoyCharacters", value)} />
                <ToggleCard title="Spread decoys" detail="Add faint dots and shapes across the image." disabled={locked} value={values.decoyDots} onChange={value => set("decoyDots", value)} />
              </div>
            </div>

            <div className="border-t border-white/[.055] bg-[#080a0e] p-5 xl:border-l xl:border-t-0 md:p-6">
              <div className="mb-4"><div className="text-[13px] font-black text-white/84">Live preview</div><div className="mt-1 text-[9px] font-semibold text-white/26">Discord generates a new random image for every member.</div></div>
              <div className="relative grid min-h-[260px] place-items-center overflow-hidden rounded-[20px] border border-white/[.07] bg-[#0a0e14]">
                <div className="pointer-events-none absolute inset-0 opacity-[.15] [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:22px_22px]" />
                {values.decoyDots ? <div className="pointer-events-none absolute inset-0 opacity-[.22] [background-image:radial-gradient(circle_at_25%_30%,#7889d8_1px,transparent_2px),radial-gradient(circle_at_75%_65%,#4fb799_1px,transparent_2px)] [background-size:37px_29px,43px_35px]" /> : null}
                {values.decoyCharacters ? <div className="pointer-events-none absolute inset-x-[12%] top-[34%] flex justify-between font-mono text-[18px] font-black text-white/[.08]"><span>M</span><span>8</span><span>K</span><span>2</span><span>Q</span></div> : null}
                <div className="relative rotate-[-1.5deg] font-mono font-black tracking-[.22em] text-white/88" style={{ fontSize: `${Math.max(34, Math.min(64, values.fontSize))}px` }}>W4R3X9</div>
                {values.decoyTrace ? <div className="pointer-events-none absolute left-[14%] top-1/2 h-[2px] w-[72%] rotate-[6deg] bg-[linear-gradient(90deg,transparent,#667bd8_18%,#65b89f_52%,#667bd8_82%,transparent)] opacity-55" /> : null}
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <div className="rounded-[15px] border border-white/[.055] bg-white/[.018] p-3.5"><div className="text-[10px] font-black text-white/65">Private per member</div><div className="mt-1 text-[9px] font-semibold leading-4 text-white/25">Each click creates a fresh code and expiration window.</div></div>
                <div className="rounded-[15px] border border-white/[.055] bg-white/[.018] p-3.5"><div className="text-[10px] font-black text-white/65">Automatic role handoff</div><div className="mt-1 text-[9px] font-semibold leading-4 text-white/25">Ware gives the verified role and removes the locked role after success.</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${panel} mt-4 p-5 md:p-6`}>
          <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#66d4b5]/62" /><div><div className="text-[12px] font-black text-white/76">Verification flow</div><div className="mt-2 flex flex-wrap gap-2 text-[9px] font-bold text-white/35"><span className="rounded-full border border-white/[.06] px-3 py-2">1 · Member presses Verify</span><span className="rounded-full border border-white/[.06] px-3 py-2">2 · Ware creates a private captcha</span><span className="rounded-full border border-white/[.06] px-3 py-2">3 · Member enters the code</span><span className="rounded-full border border-white/[.06] px-3 py-2">4 · Roles update instantly</span></div></div></div>
        </section>
      </div>
    </DashboardShell>
  );
}
