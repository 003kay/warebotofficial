import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, Trash2, Plus, ChevronDown } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Starfield } from "@/components/Starfield";
import {
  SECURITY_GROUPS,
  PUNISHMENTS,
  LIST_TYPES,
  type SecurityModule,
  type ListType,
} from "@/lib/security-modules";
import {
  getSecurityConfig,
  saveSecuritySettings,
  saveSecurityModule,
  addSecurityListEntry,
  removeSecurityListEntry,
  type SecurityLoadResult,
} from "@/lib/security.functions";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/dashboard/$guildId/security")({
  head: () => ({ meta: [{ title: "Security — ware dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["security", params.guildId],
      queryFn: () => getSecurityConfig({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: SecurityPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">
      {error.message === "You don't manage this server"
        ? "You don't have Manage Server permission for this guild."
        : `Error: ${error.message}`}
    </div>
  ),
});

const LIST_META: Record<ListType, { name: string; description: string; entryType: string; placeholder: string }> = {
  trusted: {
    name: "Trusted users",
    description: "Users the security engine ignores completely.",
    entryType: "user",
    placeholder: "Discord user ID",
  },
  whitelist: {
    name: "Whitelist",
    description: "Users, roles, or bots exempt from every anti module.",
    entryType: "user",
    placeholder: "User / role / bot ID",
  },
  extra_owner: {
    name: "Extra owners",
    description: "Co-owners who bypass antinuke limits.",
    entryType: "user",
    placeholder: "Discord user ID",
  },
  name_filter: {
    name: "Name filter patterns",
    description: "Blocked substrings in usernames or nicknames.",
    entryType: "pattern",
    placeholder: "discord.gg/",
  },
  link_whitelist: {
    name: "Link whitelist",
    description: "Domains always allowed by anti-link.",
    entryType: "domain",
    placeholder: "github.com",
  },
  scam_domain: {
    name: "Scam domains",
    description: "Extra scam / phishing domains to block on top of the built-in list.",
    entryType: "domain",
    placeholder: "steamcommunlty.com",
  },
};

function SecurityPage() {
  const { guildId } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["security", guildId],
    queryFn: () => getSecurityConfig({ data: { guildId } }),
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          {data.guild.iconUrl ? (
            <img src={data.guild.iconUrl} alt="" className="h-14 w-14 rounded-2xl" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold">
              {data.guild.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Security</div>
            <h1 className="truncate text-2xl font-bold">{data.guild.name}</h1>
          </div>
          <Link
            to="/dashboard/$guildId/tickets"
            params={{ guildId }}
            className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-muted-foreground hover:text-white"
          >
            Tickets →
          </Link>
        </div>

        {!data.botInGuild && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              Ware isn't in this server yet, so channel and role pickers are empty. Invite ware to see live options —
              your settings are still saved.
            </div>
          </div>
        )}

        <GlobalSettingsCard data={data} guildId={guildId} />

        <div className="mt-8 space-y-8">
          {SECURITY_GROUPS.map((group) => (
            <section key={group.slug}>
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">{group.name}</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{group.description}</p>
              <div className="grid gap-3 md:grid-cols-2">
                {group.modules.map((mod) => (
                  <ModuleCard key={mod.key} module={mod} data={data} guildId={guildId} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Trust & filter lists</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {LIST_TYPES.map((t) => (
              <ListCard key={t} type={t} entries={data.lists[t]} guildId={guildId} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Recent security events</h2>
          <EventsTable events={data.events} />
        </section>
      </main>
    </div>
  );
}

function GlobalSettingsCard({ data, guildId }: { data: SecurityLoadResult; guildId: string }) {
  const router = useRouter();
  const [s, setS] = useState(data.settings);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save() {
    setSaving(true);
    try {
      await saveSecuritySettings({ data: { guildId, ...s } });
      setSavedAt(Date.now());
      router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pill-surface rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Global settings</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Protection profile" hint="Presets the bot applies as sane defaults for every module.">
          <Select
            value={s.profile}
            onChange={(v) => setS({ ...s, profile: v })}
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "extreme", label: "Extreme" },
            ]}
          />
        </Field>
        <Field label="Log channel" hint="Every security event (verify, quarantine, snapshot, alerts) is posted here.">
          <ChannelSelect
            channels={data.textChannels}
            value={s.log_channel_id}
            onChange={(v) => setS({ ...s, log_channel_id: v })}
          />
        </Field>

        <Field label="Verification mode">
          <Select
            value={s.verification_mode}
            onChange={(v) => setS({ ...s, verification_mode: v })}
            options={[
              { value: "off", label: "Off" },
              { value: "button", label: "Verify button" },
              { value: "captcha", label: "Captcha" },
              { value: "questions", label: "Questions" },
            ]}
          />
        </Field>
        <Field label="Verification role" hint="Role granted once a member passes verification.">
          <RoleSelect
            roles={data.roles}
            value={s.verification_role_id}
            onChange={(v) => setS({ ...s, verification_role_id: v })}
          />
        </Field>

        <Field label="Captcha difficulty">
          <Select
            value={s.captcha_difficulty}
            onChange={(v) => setS({ ...s, captcha_difficulty: v })}
            options={[
              { value: "easy", label: "Easy" },
              { value: "medium", label: "Medium" },
              { value: "hard", label: "Hard" },
            ]}
          />
        </Field>
        <Field label="Quarantine role" hint="Role applied when a member is quarantined.">
          <RoleSelect
            roles={data.roles}
            value={s.quarantine_role_id}
            onChange={(v) => setS({ ...s, quarantine_role_id: v })}
          />
        </Field>

        <Field label="Quarantine channel" hint="Isolated channel quarantined members are directed to.">
          <ChannelSelect
            channels={data.textChannels}
            value={s.quarantine_channel_id}
            onChange={(v) => setS({ ...s, quarantine_channel_id: v })}
          />
        </Field>
        <div className="flex flex-col gap-3">
          <ToggleRow
            label="Global dry-run"
            hint="Detect and log every trip but skip punishments. Overrides every module."
            value={s.dry_run_global}
            onChange={(v) => setS({ ...s, dry_run_global: v })}
          />
          <ToggleRow
            label="Raid mode"
            hint="Kick new joins and tighten verification until you turn it off."
            value={s.raidmode}
            onChange={(v) => setS({ ...s, raidmode: v })}
          />
          <ToggleRow
            label="Panic mode"
            hint="Lock every channel and quarantine recent joiners immediately."
            value={s.panicmode}
            onChange={(v) => setS({ ...s, panicmode: v })}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save global settings"}
        </button>
        {savedAt && <span className="text-xs text-muted-foreground">Saved.</span>}
      </div>
    </div>
  );
}

function ModuleCard({
  module: mod,
  data,
  guildId,
}: {
  module: SecurityModule;
  data: SecurityLoadResult;
  guildId: string;
}) {
  const router = useRouter();
  const initial = data.modules[mod.key];
  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  async function save(next: typeof state) {
    setState(next);
    setSaving(true);
    try {
      await saveSecurityModule({
        data: {
          guildId,
          module_key: mod.key,
          enabled: next.enabled,
          dry_run: next.dry_run,
          punishment: next.punishment,
          threshold_count: next.threshold_count,
          threshold_seconds: next.threshold_seconds,
          extra: next.extra,
        },
      });
      router.invalidate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pill-surface rounded-2xl p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold">{mod.name}</div>
            {state.dry_run && (
              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-medium text-yellow-100">
                DRY-RUN
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{mod.description}</div>
        </div>
        <Toggle value={state.enabled} onChange={(v) => save({ ...state, enabled: v })} />
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-white"
      >
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        {open ? "Hide options" : "Options"}
      </button>

      {open && (
        <div className="mt-3 space-y-3 border-t border-white/5 pt-3">
          <Field label="Punishment">
            <Select
              value={state.punishment}
              onChange={(v) => save({ ...state, punishment: v })}
              options={PUNISHMENTS.map((p) => ({ value: p.value, label: p.label }))}
            />
          </Field>
          {mod.supportsThreshold && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Trip after">
                <NumberInput
                  value={state.threshold_count}
                  onChange={(v) => save({ ...state, threshold_count: v })}
                  min={1}
                />
              </Field>
              <Field label="Within (seconds)">
                <NumberInput
                  value={state.threshold_seconds}
                  onChange={(v) => save({ ...state, threshold_seconds: v })}
                  min={0}
                />
              </Field>
            </div>
          )}
          {mod.extraFields?.map((f) => {
            if (f.kind === "extra_number") {
              const extra = (state.extra as Record<string, unknown>) ?? {};
              const cur = typeof extra[f.key] === "number" ? (extra[f.key] as number) : f.default;
              return (
                <Field key={f.key} label={f.label}>
                  <NumberInput
                    value={cur}
                    min={f.min}
                    max={f.max}
                    onChange={(v) => save({ ...state, extra: { ...extra, [f.key]: v } as Json })}
                  />
                </Field>
              );
            }
            if (f.kind === "extra_text") {
              const extra = (state.extra as Record<string, unknown>) ?? {};
              const cur = typeof extra[f.key] === "string" ? (extra[f.key] as string) : "";
              return (
                <Field key={f.key} label={f.label}>
                  <input
                    className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary"
                    value={cur}
                    placeholder={f.placeholder}
                    onChange={(e) => setState({ ...state, extra: { ...extra, [f.key]: e.target.value } })}
                    onBlur={() => save(state)}
                  />
                </Field>
              );
            }
            return null;
          })}
          <ToggleRow
            label="Dry-run this module"
            hint="Log detections without punishing."
            value={state.dry_run}
            onChange={(v) => save({ ...state, dry_run: v })}
          />
          {saving && <div className="text-xs text-muted-foreground">Saving…</div>}
        </div>
      )}
    </div>
  );
}

function ListCard({
  type,
  entries,
  guildId,
}: {
  type: ListType;
  entries: SecurityLoadResult["lists"][ListType];
  guildId: string;
}) {
  const router = useRouter();
  const meta = LIST_META[type];
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!value.trim()) return;
    setBusy(true);
    try {
      await addSecurityListEntry({
        data: { guildId, list_type: type, entry_type: meta.entryType, value: value.trim(), note: null },
      });
      setValue("");
      router.invalidate();
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await removeSecurityListEntry({ data: { guildId, id } });
    router.invalidate();
  }

  return (
    <div className="pill-surface rounded-2xl p-4">
      <div className="font-semibold">{meta.name}</div>
      <div className="mt-1 text-xs text-muted-foreground">{meta.description}</div>

      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary"
          value={value}
          placeholder={meta.placeholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          onClick={add}
          disabled={busy || !value.trim()}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 space-y-1">
        {entries.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-muted-foreground">
            Empty.
          </div>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-3 py-1.5 text-sm"
          >
            <span className="font-mono text-xs text-muted-foreground">{e.entry_type}</span>
            <span className="min-w-0 flex-1 truncate">{e.value}</span>
            <button
              onClick={() => remove(e.id)}
              className="text-muted-foreground hover:text-red-400"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsTable({ events }: { events: SecurityLoadResult["events"] }) {
  if (events.length === 0) {
    return (
      <div className="pill-surface rounded-2xl p-6 text-center text-sm text-muted-foreground">
        No security events yet. Once the bot posts an event here, it will also appear in your log channel.
      </div>
    );
  }
  return (
    <div className="pill-surface overflow-hidden rounded-2xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2">When</th>
            <th className="px-4 py-2">Module</th>
            <th className="px-4 py-2">Event</th>
            <th className="px-4 py-2">Actor</th>
            <th className="px-4 py-2">Target</th>
            <th className="px-4 py-2">Punishment</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="border-t border-white/5">
              <td className="px-4 py-2 text-xs text-muted-foreground">
                {new Date(e.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-2 font-mono text-xs">{e.module_key ?? "—"}</td>
              <td className="px-4 py-2">
                {e.event_type}
                {e.dry_run && (
                  <span className="ml-2 rounded-full bg-yellow-500/20 px-1.5 py-0.5 text-[10px] text-yellow-100">
                    DRY
                  </span>
                )}
              </td>
              <td className="px-4 py-2 font-mono text-xs">{e.actor_id ?? "—"}</td>
              <td className="px-4 py-2 font-mono text-xs">{e.target_id ?? "—"}</td>
              <td className="px-4 py-2 text-xs">{e.punishment ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Small primitives ---------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      {children}
      {hint && <div className="mt-1 text-[11px] text-muted-foreground/70">{hint}</div>}
    </label>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-primary" : "bg-white/10"}`}
      aria-pressed={value}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          value ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/20 px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-[11px] text-muted-foreground/70">{hint}</div>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-neutral-900">
          {o.label}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        if (!Number.isNaN(n)) onChange(n);
      }}
      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary"
    />
  );
}

function ChannelSelect({
  channels,
  value,
  onChange,
}: {
  channels: { id: string; name: string }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => channels.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 200),
    [channels, q],
  );
  return (
    <div className="space-y-1">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search channels…"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary"
      />
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="" className="bg-neutral-900">— none —</option>
        {filtered.map((c) => (
          <option key={c.id} value={c.id} className="bg-neutral-900">
            #{c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function RoleSelect({
  roles,
  value,
  onChange,
}: {
  roles: { id: string; name: string; color: number }[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-primary"
    >
      <option value="" className="bg-neutral-900">— none —</option>
      {roles.map((r) => (
        <option key={r.id} value={r.id} className="bg-neutral-900">
          @{r.name}
        </option>
      ))}
    </select>
  );
}
