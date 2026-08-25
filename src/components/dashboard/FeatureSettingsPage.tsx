import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { saveDashboardSettings } from "@/lib/dashboard-settings.functions";

type GuildInfo = { id: string; name: string; iconUrl: string | null };

type Field =
  | { key: string; label: string; description?: string; type: "text" | "number"; placeholder?: string }
  | { key: string; label: string; description?: string; type: "toggle" }
  | { key: string; label: string; description?: string; type: "select"; options: { label: string; value: string }[] };

export function FeatureSettingsPage({
  guild,
  guildId,
  active,
  title,
  eyebrow,
  description,
  section,
  fields,
  initial,
}: {
  guild: GuildInfo;
  guildId: string;
  active: string;
  title: string;
  eyebrow: string;
  description: string;
  section: string;
  fields: Field[];
  initial: Record<string, unknown>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (key: string, value: unknown) => {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  };

  async function onSave() {
    setSaving(true);
    try {
      await saveDashboardSettings({ data: { guildId, section, values } });
      setSaved(true);
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell guild={guild} guildId={guildId} active={active}>
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/24">{eyebrow}</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white/94">{title}</h1>
            <p className="mt-2 max-w-2xl text-[12px] leading-5 text-white/35">{description}</p>
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[12px] font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.055] bg-[#101212]">
          {fields.map((field, index) => (
            <div key={field.key} className={`grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_360px] md:items-center ${index ? "border-t border-white/[0.05]" : ""}`}>
              <div>
                <div className="text-[12px] font-medium text-white/80">{field.label}</div>
                {field.description ? <div className="mt-1.5 max-w-xl text-[10px] leading-4 text-white/28">{field.description}</div> : null}
              </div>
              <div>
                {field.type === "toggle" ? (
                  <button
                    type="button"
                    onClick={() => set(field.key, !Boolean(values[field.key]))}
                    className={`relative h-7 w-12 rounded-full border transition ${Boolean(values[field.key]) ? "border-emerald-400/25 bg-emerald-400/18" : "border-white/[0.07] bg-white/[0.035]"}`}
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full transition-all ${Boolean(values[field.key]) ? "left-6 bg-emerald-300" : "left-1 bg-white/45"}`} />
                  </button>
                ) : field.type === "select" ? (
                  <select
                    value={String(values[field.key] ?? "")}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="w-full rounded-xl border border-white/[0.07] bg-[#0b0d0d] px-3.5 py-3 text-[12px] text-white/75 outline-none focus:border-white/[0.16]"
                  >
                    {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={String(values[field.key] ?? "")}
                    placeholder={field.placeholder}
                    onChange={(e) => set(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)}
                    className="w-full rounded-xl border border-white/[0.07] bg-[#0b0d0d] px-3.5 py-3 text-[12px] text-white/75 outline-none placeholder:text-white/15 focus:border-white/[0.16]"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
