import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bot, CheckCircle2, Clock3, Hash, Save, ShieldCheck, UserRoundCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardSettings, saveDashboardSettings } from "@/lib/dashboard-settings.functions";

export const Route = createFileRoute("/dashboard/$guildId/join-gate")({
  head: () => ({ meta: [{ title: "Join Gate — Stained Dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["dashboardSettings", params.guildId],
      queryFn: () => getDashboardSettings({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: Page,
});

type Unit = "minutes" | "hours" | "days";
type JoinAction = "log" | "timeout" | "kick" | "ban";

type JoinGateValues = {
  enabled: boolean;
  minimumAccountAgeAmount: number;
  minimumAccountAgeUnit: Unit;
  minimumAccountAgeHours: number;
  action: JoinAction;
  requireAvatar: boolean;
  blockBotAdds: boolean;
  blockUnverifiedBots: boolean;
  blockInviteNames: boolean;
  usernameFilterEnabled: boolean;
  alertChannelId: string;
};

function normalizeHours(amount: number, unit: Unit) {
  const safe = Math.max(0, Number(amount || 0));
  if (unit === "minutes") return safe / 60;
  if (unit === "days") return safe * 24;
  return safe;
}

function Toggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      aria-pressed={value}
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 rounded-full border transition ${value ? "border-emerald-400/25 bg-emerald-400/20" : "border-white/[0.08] bg-white/[0.035]"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full transition-all ${value ? "left-6 bg-emerald-300" : "left-1 bg-white/45"}`} />
    </button>
  );
}

function SettingRow({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-5 border-t border-white/[0.05] px-5 py-5 first:border-t-0 md:grid-cols-[minmax(0,1fr)_420px] md:items-center md:px-6">
      <div>
        <div className="text-[12px] font-medium text-white/82">{title}</div>
        <div className="mt-1.5 max-w-2xl text-[10px] leading-4 text-white/30">{detail}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Page() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["dashboardSettings", guildId],
    queryFn: () => getDashboardSettings({ data: { guildId } }),
  });

  const stored = ((data.settings.joinGate as Record<string, unknown>) ?? {});
  const legacyHours = Number(stored.minimumAccountAgeHours ?? 24);
  const initial = useMemo<JoinGateValues>(() => ({
    enabled: Boolean(stored.enabled ?? false),
    minimumAccountAgeAmount: Number(stored.minimumAccountAgeAmount ?? (legacyHours >= 24 && legacyHours % 24 === 0 ? legacyHours / 24 : legacyHours)),
    minimumAccountAgeUnit: String(stored.minimumAccountAgeUnit ?? (legacyHours >= 24 && legacyHours % 24 === 0 ? "days" : "hours")) as Unit,
    minimumAccountAgeHours: legacyHours,
    action: String(stored.action ?? (stored.blockNewAccounts === false ? "log" : "kick")) as JoinAction,
    requireAvatar: Boolean(stored.requireAvatar ?? false),
    blockBotAdds: Boolean(stored.blockBotAdds ?? true),
    blockUnverifiedBots: Boolean(stored.blockUnverifiedBots ?? false),
    blockInviteNames: Boolean(stored.blockInviteNames ?? false),
    usernameFilterEnabled: Boolean(stored.usernameFilterEnabled ?? false),
    alertChannelId: String(stored.alertChannelId ?? ""),
  }), [legacyHours]);

  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof JoinGateValues>(key: K, value: JoinGateValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  async function save() {
    setSaving(true);
    try {
      const minimumAccountAgeHours = normalizeHours(values.minimumAccountAgeAmount, values.minimumAccountAgeUnit);
      await saveDashboardSettings({
        data: {
          guildId,
          section: "joinGate",
          values: {
            ...values,
            minimumAccountAgeHours,
            blockNewAccounts: values.action !== "log",
          },
        },
      });
      setValues((current) => ({ ...current, minimumAccountAgeHours }));
      setSaved(true);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="joinGate">
      <div className="mx-auto max-w-[1220px] pb-12">
        <section className="mb-4 rounded-[22px] border border-white/[0.06] bg-[#0e1010] p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300/55"><ShieldCheck className="h-3.5 w-3.5" /> Entrance security</div>
              <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.045em] text-white/94">Join Gate</h1>
              <p className="mt-2 max-w-2xl text-[11px] leading-5 text-white/32">Screen new members before they receive normal server access. Configure account-age rules, suspicious-account filters, enforcement, and where Stained reports events.</p>
            </div>
            <button type="button" onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[11px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
              {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
            </button>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[17px] border border-white/[0.06] bg-[#101212] p-4"><div className="flex items-center gap-2 text-[10px] text-white/40"><UserRoundCheck className="h-4 w-4" /> Account screening</div><div className="mt-2 text-[13px] font-medium text-white/75">Age + avatar checks</div></div>
          <div className="rounded-[17px] border border-white/[0.06] bg-[#101212] p-4"><div className="flex items-center gap-2 text-[10px] text-white/40"><Bot className="h-4 w-4" /> Bot protection</div><div className="mt-2 text-[13px] font-medium text-white/75">Unauthorized bot filters</div></div>
          <div className="rounded-[17px] border border-white/[0.06] bg-[#101212] p-4"><div className="flex items-center gap-2 text-[10px] text-white/40"><Hash className="h-4 w-4" /> Event routing</div><div className="mt-2 text-[13px] font-medium text-white/75">Choose a real channel</div></div>
        </div>

        <section className="mt-3 overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#101212]">
          <SettingRow title="Enable Join Gate" detail="Run the configured entrance checks whenever a new member joins."><Toggle value={values.enabled} onChange={(value) => set("enabled", value)} /></SettingRow>

          <SettingRow title="Minimum account age" detail="Accounts younger than this threshold trigger the action below. Use minutes for testing, hours for short gates, or days for normal production protection.">
            <div className="grid grid-cols-[1fr_140px] gap-2">
              <div className="relative"><Clock3 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" /><input type="number" min={0} step={1} value={values.minimumAccountAgeAmount} onChange={(e) => set("minimumAccountAgeAmount", Math.max(0, Number(e.target.value)))} className="w-full rounded-xl border border-white/[0.07] bg-[#0a0c0c] py-3 pl-10 pr-3 text-[12px] text-white/75 outline-none focus:border-white/[0.16]" /></div>
              <select value={values.minimumAccountAgeUnit} onChange={(e) => set("minimumAccountAgeUnit", e.target.value as Unit)} className="rounded-xl border border-white/[0.07] bg-[#0a0c0c] px-3 py-3 text-[12px] text-white/75 outline-none focus:border-white/[0.16]"><option value="minutes">Minutes</option><option value="hours">Hours</option><option value="days">Days</option></select>
            </div>
          </SettingRow>

          <SettingRow title="Triggered-account action" detail="Choose what Stained does when a member fails the account-age or profile checks. Log is the safest testing mode.">
            <select value={values.action} onChange={(e) => set("action", e.target.value as JoinAction)} className="w-full rounded-xl border border-white/[0.07] bg-[#0a0c0c] px-3.5 py-3 text-[12px] text-white/75 outline-none focus:border-white/[0.16]"><option value="log">Log only</option><option value="timeout">Timeout</option><option value="kick">Kick</option><option value="ban">Ban</option></select>
          </SettingRow>

          <SettingRow title="Require a profile avatar" detail="Flag members still using Discord's default avatar. Useful against low-effort raid accounts."><Toggle value={values.requireAvatar} onChange={(value) => set("requireAvatar", value)} /></SettingRow>
          <SettingRow title="Unauthorized bot additions" detail="Treat newly added bots as suspicious unless they were added through an approved path."><Toggle value={values.blockBotAdds} onChange={(value) => set("blockBotAdds", value)} /></SettingRow>
          <SettingRow title="Unverified bot filter" detail="Flag Discord bots that are not verified. Keep this separate from the general bot-addition rule."><Toggle value={values.blockUnverifiedBots} onChange={(value) => set("blockUnverifiedBots", value)} /></SettingRow>
          <SettingRow title="Invite / advertising usernames" detail="Flag accounts whose visible identity appears to advertise Discord invites or server links."><Toggle value={values.blockInviteNames} onChange={(value) => set("blockInviteNames", value)} /></SettingRow>
          <SettingRow title="Username filter" detail="Enable Stained's username-pattern checks for suspicious or server-defined terms."><Toggle value={values.usernameFilterEnabled} onChange={(value) => set("usernameFilterEnabled", value)} /></SettingRow>

          <SettingRow title="Join Gate alert channel" detail="Select the channel where Join Gate actions and suspicious-member reports should be posted.">
            <select value={values.alertChannelId} onChange={(e) => set("alertChannelId", e.target.value)} disabled={!data.botInGuild} className="w-full rounded-xl border border-white/[0.07] bg-[#0a0c0c] px-3.5 py-3 text-[12px] text-white/75 outline-none focus:border-white/[0.16] disabled:opacity-45">
              <option value="">No alert channel</option>
              {data.textChannels.map((channel) => <option key={channel.id} value={channel.id}># {channel.name}</option>)}
            </select>
            {!data.botInGuild ? <div className="mt-2 text-[9px] text-amber-200/45">Stained could not load this server's channels. Confirm the website bot token and that Stained is still in the server.</div> : null}
          </SettingRow>
        </section>
      </div>
    </DashboardShell>
  );
}

