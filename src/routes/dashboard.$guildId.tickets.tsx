import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Starfield } from "@/components/Starfield";
import {
  getTicketPanel,
  saveTicketPanel,
  publishTicketPanel,
} from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/$guildId/tickets")({
  head: () => ({ meta: [{ title: "Tickets — ware dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["ticketPanel", params.guildId],
      queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: TicketsPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-muted-foreground">
      {error.message === "You don't manage this server"
        ? "You don't have Manage Server permission for this guild."
        : `Error: ${error.message}`}
    </div>
  ),
});

const DEFAULTS = {
  title: "Support",
  description: "Click the button below to open a ticket.",
  color: "#5865F2",
  button_label: "Open Ticket",
  button_emoji: "🎫",
  button_style: "primary",
  welcome_message: "Thanks for opening a ticket! Support will be with you shortly.",
};

const BUTTON_STYLES: { value: string; label: string; className: string }[] = [
  { value: "primary", label: "Blurple", className: "bg-[#5865F2] hover:bg-[#4752c4] text-white" },
  { value: "secondary", label: "Grey", className: "bg-[#4e5058] hover:bg-[#6d6f78] text-white" },
  { value: "success", label: "Green", className: "bg-[#248046] hover:bg-[#1a6334] text-white" },
  { value: "danger", label: "Red", className: "bg-[#da373c] hover:bg-[#a12828] text-white" },
];

function TicketsPage() {
  const { guildId } = Route.useParams();
  const router = useRouter();
  const { data } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });

  const p = data.panel;
  const [form, setForm] = useState({
    title: p?.title ?? DEFAULTS.title,
    description: p?.description ?? DEFAULTS.description,
    color: p?.color ?? DEFAULTS.color,
    button_label: p?.button_label ?? DEFAULTS.button_label,
    button_emoji: p?.button_emoji ?? DEFAULTS.button_emoji,
    button_style: p?.button_style ?? DEFAULTS.button_style,
    welcome_message: p?.welcome_message ?? DEFAULTS.welcome_message,
    channel_id: p?.channel_id ?? "",
    category_id: p?.category_id ?? "",
    support_role_ids: (p?.support_role_ids as string[] | null) ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
    setPublishResult(null);
  };

  async function onSave() {
    setSaving(true);
    try {
      await saveTicketPanel({
        data: {
          guildId,
          ...form,
          channel_id: form.channel_id || null,
          category_id: form.category_id || null,
        },
      });
      setSaved(true);
      router.invalidate();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    if (!form.channel_id) {
      alert("Choose a channel first, then save.");
      return;
    }
    setPublishing(true);
    setPublishResult(null);
    try {
      await saveTicketPanel({
        data: {
          guildId,
          ...form,
          channel_id: form.channel_id || null,
          category_id: form.category_id || null,
        },
      });
      const res = await publishTicketPanel({ data: { guildId } });
      setPublishResult(`Panel posted to Discord (message ${res.messageId}).`);
      router.invalidate();
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  const btnStyle = BUTTON_STYLES.find((b) => b.value === form.button_style) ?? BUTTON_STYLES[0];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Starfield />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {/* Guild header */}
        <div className="mb-8 flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Servers
          </Link>
          <span className="text-muted-foreground">/</span>
          <div className="flex items-center gap-3">
            {data.guild.iconUrl ? (
              <img src={data.guild.iconUrl} alt="" className="h-8 w-8 rounded-full" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10" />
            )}
            <span className="font-semibold">{data.guild.name}</span>
          </div>
        </div>

        {!data.botInGuild && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            The Ware bot isn't in this server yet, so channels and roles can't be listed.{" "}
            <a
              href={`https://discord.com/oauth2/authorize?client_id=1519976058923778058&permissions=8&scope=bot+applications.commands&guild_id=${guildId}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Invite Ware to this server
            </a>{" "}
            and refresh.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
          {/* Left: form */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Ticket Panel</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Customize the panel embed, the button, and where tickets get created.
              </p>
            </div>

            <Section title="Where">
              <Field label="Panel channel" hint="The channel where the panel embed is posted.">
                <select
                  value={form.channel_id}
                  onChange={(e) => set("channel_id", e.target.value)}
                  className="input"
                  disabled={!data.botInGuild}
                >
                  <option value="">— Select a channel —</option>
                  {data.textChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field

                label="Support roles"
                hint="Members with these roles can see and reply in every ticket."
              >
                <div className="flex flex-wrap gap-2">
                  {data.roles.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      {data.botInGuild ? "No roles found." : "Invite the bot to load roles."}
                    </span>
                  )}
                  {data.roles.map((r) => {
                    const active = form.support_role_ids.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() =>
                          set(
                            "support_role_ids",
                            active
                              ? form.support_role_ids.filter((x) => x !== r.id)
                              : [...form.support_role_ids, r.id],
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs ring-1 transition-colors ${
                          active
                            ? "bg-white/15 ring-white/40"
                            : "bg-white/[0.03] ring-white/10 hover:bg-white/10"
                        }`}
                        style={
                          r.color
                            ? { color: `#${r.color.toString(16).padStart(6, "0")}` }
                            : undefined
                        }
                      >
                        @{r.name}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </Section>

            <Section title="Embed">
              <Field label="Title" hint="Shown as the embed heading (max 256 characters).">
                <input
                  type="text"
                  value={form.title}
                  maxLength={256}
                  onChange={(e) => set("title", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Description" hint="Supports basic Discord markdown.">
                <textarea
                  value={form.description}
                  maxLength={4000}
                  rows={5}
                  onChange={(e) => set("description", e.target.value)}
                  className="input resize-none"
                />
              </Field>
              <Field label="Accent color">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-md border border-white/10 bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => set("color", e.target.value)}
                    className="input w-32 font-mono"
                  />
                </div>
              </Field>
            </Section>

            <Section title="Button">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Label">
                  <input
                    type="text"
                    value={form.button_label}
                    maxLength={80}
                    onChange={(e) => set("button_label", e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Emoji">
                  <input
                    type="text"
                    value={form.button_emoji}
                    onChange={(e) => set("button_emoji", e.target.value)}
                    className="input"
                    placeholder="🎫"
                  />
                </Field>
              </div>
              <Field label="Style">
                <div className="grid grid-cols-4 gap-2">
                  {BUTTON_STYLES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set("button_style", s.value)}
                      className={`rounded-md px-3 py-2 text-xs font-medium ring-1 transition-colors ${
                        form.button_style === s.value
                          ? "ring-white/40 bg-white/10"
                          : "ring-white/10 hover:bg-white/5"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>

            <Section title="After ticket opens">
              <Field label="Opening message" hint="First message sent inside a new ticket.">
                <textarea
                  value={form.welcome_message}
                  maxLength={2000}
                  rows={4}
                  onChange={(e) => set("welcome_message", e.target.value)}
                  className="input resize-none"
                />
              </Field>
            </Section>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onSave}
                disabled={saving || publishing}
                className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/15 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={onPublish}
                disabled={saving || publishing || !form.channel_id || !data.botInGuild}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                title={
                  !data.botInGuild
                    ? "Invite the bot first"
                    : !form.channel_id
                      ? "Pick a channel"
                      : "Post/update the panel in Discord"
                }
              >
                {publishing ? "Publishing…" : "Publish to Discord"}
              </button>
              {saved && <span className="text-sm text-emerald-400">Saved ✓</span>}
              {publishResult && (
                <span className="text-sm text-emerald-400">{publishResult}</span>
              )}
            </div>
          </div>

          {/* Right: preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
              Live preview
            </div>
            <div className="rounded-lg bg-[#313338] p-4 text-[#dbdee1] shadow-2xl">
              <div className="flex gap-3">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#5865F2]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-white">Ware</span>
                    <span className="rounded bg-[#5865F2] px-1 py-[1px] text-[10px] font-semibold text-white">
                      APP
                    </span>
                    <span className="text-xs text-[#949ba4]">Today at 12:00 PM</span>
                  </div>

                  <div
                    className="mt-1 max-w-[440px] rounded border-l-4 bg-[#2b2d31] p-3"
                    style={{ borderColor: form.color }}
                  >
                    <div className="font-semibold text-white">{form.title || " "}</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm text-[#dbdee1]">
                      {form.description}
                    </div>
                  </div>

                  <div className="mt-2">
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium ${btnStyle.className}`}
                    >
                      <span>{form.button_emoji}</span>
                      <span>{form.button_label}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-[#313338] p-4 text-[#dbdee1] shadow-2xl">
              <div className="text-xs uppercase tracking-widest text-[#949ba4]">
                #ticket-0001 (opening message)
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm">{form.welcome_message}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pill-surface space-y-4 rounded-2xl p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <div className="text-sm font-medium">{label}</div>
      {children}
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </label>
  );
}
