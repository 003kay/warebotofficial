import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  Eye,
  Hash,
  Layers3,
  MessageSquareText,
  Palette,
  Plus,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Trash2,
  UsersRound,
} from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  getTicketPanel,
  publishTicketPanel,
  saveTicketPanel,
} from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/$guildId/tickets")({
  head: () => ({ meta: [{ title: "Tickets — Ware Dashboard" }] }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["ticketPanel", params.guildId],
      queryFn: () => getTicketPanel({ data: { guildId: params.guildId } }),
    });
    return null;
  },
  component: TicketsPage,
});

const DEFAULTS = {
  title: "Support Tickets",
  description: "Choose an option below to open a private ticket with staff.",
  color: "#111217",
  panel_type: "button",
  dropdown_placeholder: "Select a ticket category…",
  button_label: "Open Ticket",
  button_emoji: "🎫",
  button_style: "secondary",
  close_button_label: "Close",
  close_button_emoji: "🔒",
  close_button_style: "secondary",
  claim_button_label: "Claim",
  claim_button_emoji: "📌",
  claim_button_style: "secondary",
  command_prefix: ",",
  close_command: "close",
  reopen_command: "reopen",
  delete_command: "delete",
  welcome_message: "Thanks for opening a ticket! Support will be with you shortly.",
};

type PanelOptionForm = {
  label: string;
  description: string;
  emoji: string;
  category_id: string | null;
  support_role_ids: string[];
  welcome_message: string;
  ticket_name_format: string;
};

const DEFAULT_OPTION: PanelOptionForm = {
  label: "Support",
  description: "General support",
  emoji: "🎫",
  category_id: null,
  support_role_ids: [],
  welcome_message: "Thanks for opening a ticket! Support will be with you shortly.",
  ticket_name_format: "ticket-{number}",
};

const BUTTON_STYLES = [
  { value: "primary", label: "Blurple", className: "bg-[#5865F2] text-white" },
  { value: "secondary", label: "Grey", className: "bg-[#4e5058] text-white" },
  { value: "success", label: "Green", className: "bg-[#248046] text-white" },
  { value: "danger", label: "Red", className: "bg-[#da373c] text-white" },
] as const;

const TABS = [
  { id: "behavior", label: "Behavior", icon: Settings2 },
  { id: "categories", label: "Categories", icon: Hash },
  { id: "display", label: "Display", icon: Palette },
  { id: "messages", label: "Messages", icon: MessageSquareText },
  { id: "options", label: "Options", icon: Layers3 },
  { id: "permissions", label: "Permissions", icon: UsersRound },
] as const;

type TabId = (typeof TABS)[number]["id"];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[11px] font-medium text-white/45">{children}</div>;
}

const inputClass =
  "w-full rounded-xl border border-white/[0.07] bg-[#0d0f10] px-3.5 py-3 text-sm text-white outline-none transition focus:border-white/[0.16] focus:bg-[#101213]";

const cardClass = "rounded-2xl border border-white/[0.06] bg-[#101212]";

function TicketsPage() {
  const { guildId } = Route.useParams();
  const router = useRouter();
  const { data } = useSuspenseQuery({
    queryKey: ["ticketPanel", guildId],
    queryFn: () => getTicketPanel({ data: { guildId } }),
  });

  const p = data.panel as Record<string, unknown> | null;
  const s = (key: string, fallback: string) =>
    p && typeof p[key] === "string" ? (p[key] as string) : fallback;

  const [tab, setTab] = useState<TabId>("behavior");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishResult, setPublishResult] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: s("title", DEFAULTS.title),
    description: s("description", DEFAULTS.description),
    color: s("color", DEFAULTS.color),
    panel_type: s("panel_type", DEFAULTS.panel_type),
    dropdown_placeholder: s("dropdown_placeholder", DEFAULTS.dropdown_placeholder),
    button_label: s("button_label", DEFAULTS.button_label),
    button_emoji: s("button_emoji", DEFAULTS.button_emoji),
    button_style: s("button_style", DEFAULTS.button_style),
    close_button_label: s("close_button_label", DEFAULTS.close_button_label),
    close_button_emoji: s("close_button_emoji", DEFAULTS.close_button_emoji),
    close_button_style: s("close_button_style", DEFAULTS.close_button_style),
    claim_button_label: s("claim_button_label", DEFAULTS.claim_button_label),
    claim_button_emoji: s("claim_button_emoji", DEFAULTS.claim_button_emoji),
    claim_button_style: s("claim_button_style", DEFAULTS.claim_button_style),
    command_prefix: s("command_prefix", DEFAULTS.command_prefix),
    close_command: s("close_command", DEFAULTS.close_command),
    reopen_command: s("reopen_command", DEFAULTS.reopen_command),
    delete_command: s("delete_command", DEFAULTS.delete_command),
    welcome_message: s("welcome_message", DEFAULTS.welcome_message),
    channel_id: s("channel_id", ""),
    category_id: s("category_id", ""),
    log_channel_id: s("log_channel_id", ""),
    support_role_ids: (p?.support_role_ids as string[] | undefined) ?? [],
  });

  const [options, setOptions] = useState<PanelOptionForm[]>(() => {
    const loaded = (data.options ?? []) as PanelOptionForm[];
    if (!loaded.length) return [{ ...DEFAULT_OPTION }];
    return loaded.map((option) => ({
      label: option.label,
      description: option.description ?? "",
      emoji: option.emoji ?? "🎫",
      category_id: option.category_id ?? null,
      support_role_ids: option.support_role_ids ?? [],
      welcome_message: option.welcome_message ?? DEFAULT_OPTION.welcome_message,
      ticket_name_format: option.ticket_name_format ?? DEFAULT_OPTION.ticket_name_format,
    }));
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setPublishResult(null);
  };

  const updateOption = (index: number, patch: Partial<PanelOptionForm>) => {
    setOptions((current) =>
      current.map((option, i) => (i === index ? { ...option, ...patch } : option)),
    );
    setSaved(false);
    setPublishResult(null);
  };

  const selectedChannel = useMemo(
    () => data.textChannels.find((channel) => channel.id === form.channel_id),
    [data.textChannels, form.channel_id],
  );

  const payload = () => ({
    guildId,
    ...form,
    channel_id: form.channel_id || null,
    category_id: form.category_id || null,
    log_channel_id: form.log_channel_id || null,
    options: options.slice(0, 10).map((option, index) => ({
      position: index,
      ...option,
    })),
  });

  async function onSave() {
    setSaving(true);
    try {
      await saveTicketPanel({ data: payload() });
      setSaved(true);
      await router.invalidate();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onPublish() {
    if (!form.channel_id) {
      alert("Choose a server channel first.");
      return;
    }
    setPublishing(true);
    setPublishResult(null);
    try {
      await saveTicketPanel({ data: payload() });
      const result = await publishTicketPanel({ data: { guildId } });
      setSaved(true);
      setPublishResult(
        `Sent to #${selectedChannel?.name ?? "channel"} · message ${result.messageId}`,
      );
      await router.invalidate();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  const buttonStyle =
    BUTTON_STYLES.find((style) => style.value === form.button_style) ?? BUTTON_STYLES[1];

  return (
    <DashboardShell guild={data.guild} guildId={guildId} active="designer">
      <div className="mx-auto max-w-[1500px] pb-20">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/25">Tickets</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
              Ticket Manager
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/35">
              Configure your panel, ticket categories, messages, options and staff access, then send it directly into a channel in {data.guild.name}.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || publishing}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-sm text-white/75 hover:bg-white/[0.06] disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : saved ? "Saved" : "Save"}
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={publishing || saving || !form.channel_id || !data.botInGuild}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Send className="h-4 w-4" />
              {publishing ? "Sending…" : "Send Panel"}
            </button>
          </div>
        </div>

        {!data.botInGuild ? (
          <div className="mt-5 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-3 text-sm text-amber-100/70">
            Ware is not in this server yet, so server channels and roles cannot be used.
          </div>
        ) : null}

        {publishResult ? (
          <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3 text-sm text-emerald-200/80">
            {publishResult}
          </div>
        ) : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_420px]">
          <div className="space-y-5">
            <section className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-white/[0.055] px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/85">Publish destination</div>
                    <div className="mt-1 text-[11px] text-white/28">
                      Only text channels from the server you are managing are shown.
                    </div>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-emerald-300/60" />
                </div>
              </div>
              <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-end">
                <label>
                  <FieldLabel>Send ticket panel to</FieldLabel>
                  <select
                    value={form.channel_id}
                    onChange={(e) => set("channel_id", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Choose a channel…</option>
                    {data.textChannels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        # {channel.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={onPublish}
                  disabled={publishing || !form.channel_id || !data.botInGuild}
                  className="inline-flex h-[46px] items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 text-sm font-semibold text-white hover:bg-[#6673f5] disabled:opacity-35"
                >
                  <Send className="h-4 w-4" />
                  {publishing ? "Sending…" : "Send to Discord"}
                </button>
              </div>
            </section>

            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex gap-1 overflow-x-auto border-b border-white/[0.055] p-2">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                      tab === id
                        ? "bg-white/[0.075] text-white"
                        : "text-white/35 hover:bg-white/[0.035] hover:text-white/65"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-5 md:p-6">
                {tab === "behavior" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <label>
                      <FieldLabel>Panel type</FieldLabel>
                      <select
                        className={inputClass}
                        value={form.panel_type}
                        onChange={(e) => set("panel_type", e.target.value)}
                      >
                        <option value="button">Button panel</option>
                        <option value="dropdown">Dropdown panel</option>
                      </select>
                    </label>
                    <label>
                      <FieldLabel>Command prefix</FieldLabel>
                      <input
                        className={inputClass}
                        value={form.command_prefix}
                        onChange={(e) => set("command_prefix", e.target.value)}
                        maxLength={5}
                      />
                    </label>
                    {form.panel_type === "button" ? (
                      <>
                        <label>
                          <FieldLabel>Open button label</FieldLabel>
                          <input className={inputClass} value={form.button_label} onChange={(e) => set("button_label", e.target.value)} />
                        </label>
                        <label>
                          <FieldLabel>Open button emoji</FieldLabel>
                          <input className={inputClass} value={form.button_emoji} onChange={(e) => set("button_emoji", e.target.value)} />
                        </label>
                        <label>
                          <FieldLabel>Open button style</FieldLabel>
                          <select className={inputClass} value={form.button_style} onChange={(e) => set("button_style", e.target.value)}>
                            {BUTTON_STYLES.map((style) => <option key={style.value} value={style.value}>{style.label}</option>)}
                          </select>
                        </label>
                      </>
                    ) : (
                      <label className="md:col-span-2">
                        <FieldLabel>Dropdown placeholder</FieldLabel>
                        <input className={inputClass} value={form.dropdown_placeholder} onChange={(e) => set("dropdown_placeholder", e.target.value)} />
                      </label>
                    )}
                  </div>
                )}

                {tab === "categories" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <label>
                      <FieldLabel>Default ticket category</FieldLabel>
                      <select className={inputClass} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
                        <option value="">Automatic / none</option>
                        {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                      </select>
                    </label>
                    <label>
                      <FieldLabel>Ticket log channel</FieldLabel>
                      <select className={inputClass} value={form.log_channel_id} onChange={(e) => set("log_channel_id", e.target.value)}>
                        <option value="">No log channel</option>
                        {data.textChannels.map((channel) => <option key={channel.id} value={channel.id}># {channel.name}</option>)}
                      </select>
                    </label>
                    <div className="md:col-span-2 rounded-xl border border-white/[0.055] bg-white/[0.018] p-4 text-xs leading-5 text-white/35">
                      Each ticket option can override the default category from the Options tab.
                    </div>
                  </div>
                )}

                {tab === "display" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="md:col-span-2">
                      <FieldLabel>Panel title</FieldLabel>
                      <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} />
                    </label>
                    <label className="md:col-span-2">
                      <FieldLabel>Panel description</FieldLabel>
                      <textarea className={`${inputClass} min-h-32 resize-y`} value={form.description} onChange={(e) => set("description", e.target.value)} />
                    </label>
                    <label>
                      <FieldLabel>Embed color</FieldLabel>
                      <div className="flex gap-2">
                        <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="h-[46px] w-14 rounded-xl border border-white/[0.07] bg-[#0d0f10] p-1" />
                        <input className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)} />
                      </div>
                    </label>
                  </div>
                )}

                {tab === "messages" && (
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="md:col-span-2">
                      <FieldLabel>Default greeting message</FieldLabel>
                      <textarea className={`${inputClass} min-h-28 resize-y`} value={form.welcome_message} onChange={(e) => set("welcome_message", e.target.value)} />
                    </label>
                    <label>
                      <FieldLabel>Close command</FieldLabel>
                      <input className={inputClass} value={form.close_command} onChange={(e) => set("close_command", e.target.value)} />
                    </label>
                    <label>
                      <FieldLabel>Reopen command</FieldLabel>
                      <input className={inputClass} value={form.reopen_command} onChange={(e) => set("reopen_command", e.target.value)} />
                    </label>
                    <label>
                      <FieldLabel>Delete command</FieldLabel>
                      <input className={inputClass} value={form.delete_command} onChange={(e) => set("delete_command", e.target.value)} />
                    </label>
                    <label>
                      <FieldLabel>Close button</FieldLabel>
                      <div className="grid grid-cols-[1fr_80px] gap-2">
                        <input className={inputClass} value={form.close_button_label} onChange={(e) => set("close_button_label", e.target.value)} />
                        <input className={inputClass} value={form.close_button_emoji} onChange={(e) => set("close_button_emoji", e.target.value)} />
                      </div>
                    </label>
                    <label>
                      <FieldLabel>Claim button</FieldLabel>
                      <div className="grid grid-cols-[1fr_80px] gap-2">
                        <input className={inputClass} value={form.claim_button_label} onChange={(e) => set("claim_button_label", e.target.value)} />
                        <input className={inputClass} value={form.claim_button_emoji} onChange={(e) => set("claim_button_emoji", e.target.value)} />
                      </div>
                    </label>
                  </div>
                )}

                {tab === "options" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white/80">Ticket options</div>
                        <div className="mt-1 text-[11px] text-white/28">Up to 10 options on the panel.</div>
                      </div>
                      <button
                        type="button"
                        disabled={options.length >= 10}
                        onClick={() => setOptions((current) => [...current, { ...DEFAULT_OPTION, label: `Option ${current.length + 1}` }])}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-white/65 disabled:opacity-30"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add option
                      </button>
                    </div>

                    {options.map((option, index) => (
                      <div key={index} className="rounded-xl border border-white/[0.06] bg-[#0c0e0f] p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-xs font-semibold text-white/60">Option {index + 1}</div>
                          <button
                            type="button"
                            disabled={options.length <= 1}
                            onClick={() => setOptions((current) => current.filter((_, i) => i !== index))}
                            className="grid h-8 w-8 place-items-center rounded-lg text-white/25 hover:bg-red-500/[0.08] hover:text-red-300 disabled:opacity-20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <label>
                            <FieldLabel>Label</FieldLabel>
                            <input className={inputClass} value={option.label} onChange={(e) => updateOption(index, { label: e.target.value })} />
                          </label>
                          <label>
                            <FieldLabel>Emoji</FieldLabel>
                            <input className={inputClass} value={option.emoji} onChange={(e) => updateOption(index, { emoji: e.target.value })} />
                          </label>
                          <label className="md:col-span-2">
                            <FieldLabel>Description</FieldLabel>
                            <input className={inputClass} value={option.description} onChange={(e) => updateOption(index, { description: e.target.value })} />
                          </label>
                          <label>
                            <FieldLabel>Ticket category</FieldLabel>
                            <select className={inputClass} value={option.category_id ?? ""} onChange={(e) => updateOption(index, { category_id: e.target.value || null })}>
                              <option value="">Use panel default</option>
                              {data.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                          </label>
                          <label>
                            <FieldLabel>Channel name format</FieldLabel>
                            <input className={inputClass} value={option.ticket_name_format} onChange={(e) => updateOption(index, { ticket_name_format: e.target.value })} />
                          </label>
                          <label className="md:col-span-2">
                            <FieldLabel>Greeting message</FieldLabel>
                            <textarea className={`${inputClass} min-h-24 resize-y`} value={option.welcome_message} onChange={(e) => updateOption(index, { welcome_message: e.target.value })} />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "permissions" && (
                  <div className="space-y-5">
                    <div>
                      <FieldLabel>Global ticket staff roles</FieldLabel>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {data.roles.map((role) => {
                          const active = form.support_role_ids.includes(role.id);
                          return (
                            <button
                              type="button"
                              key={role.id}
                              onClick={() =>
                                set(
                                  "support_role_ids",
                                  active
                                    ? form.support_role_ids.filter((id) => id !== role.id)
                                    : [...form.support_role_ids, role.id],
                                )
                              }
                              className={`rounded-xl border px-3 py-3 text-left text-xs transition ${
                                active
                                  ? "border-[#5865F2]/35 bg-[#5865F2]/10 text-white"
                                  : "border-white/[0.06] bg-[#0d0f10] text-white/45 hover:border-white/[0.11]"
                              }`}
                            >
                              @{role.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-sm font-semibold text-white/75">Per-option support roles</div>
                      {options.map((option, index) => (
                        <div key={index} className="rounded-xl border border-white/[0.06] bg-[#0d0f10] p-4">
                          <div className="mb-3 text-xs font-medium text-white/55">{option.emoji} {option.label}</div>
                          <div className="flex flex-wrap gap-2">
                            {data.roles.map((role) => {
                              const active = option.support_role_ids.includes(role.id);
                              return (
                                <button
                                  key={role.id}
                                  type="button"
                                  onClick={() =>
                                    updateOption(index, {
                                      support_role_ids: active
                                        ? option.support_role_ids.filter((id) => id !== role.id)
                                        : [...option.support_role_ids, role.id],
                                    })
                                  }
                                  className={`rounded-lg border px-2.5 py-2 text-[11px] ${
                                    active
                                      ? "border-white/[0.15] bg-white/[0.07] text-white"
                                      : "border-white/[0.05] text-white/35"
                                  }`}
                                >
                                  @{role.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="xl:sticky xl:top-5 xl:self-start">
            <section className={`${cardClass} overflow-hidden`}>
              <div className="flex items-center justify-between border-b border-white/[0.055] px-5 py-4">
                <div>
                  <div className="text-sm font-semibold text-white/82">Discord preview</div>
                  <div className="mt-1 text-[10px] text-white/25">Updates as you edit</div>
                </div>
                <Eye className="h-4 w-4 text-white/28" />
              </div>
              <div className="bg-[#0b0c0e] p-4">
                <div className="rounded-xl bg-[#313338] p-4">
                  <div className="flex gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-[11px] font-bold text-white">W</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-white">ware</span>
                        <span className="rounded bg-[#5865F2] px-1 py-0.5 text-[9px] font-bold text-white">APP</span>
                      </div>
                      <div className="mt-2 overflow-hidden rounded-md bg-[#2b2d31]">
                        <div className="flex">
                          <div className="w-1 shrink-0" style={{ backgroundColor: form.color }} />
                          <div className="min-w-0 p-3.5">
                            <div className="font-semibold text-white">{form.title || "Support Tickets"}</div>
                            <div className="mt-1 whitespace-pre-wrap text-sm leading-5 text-[#dbdee1]">{form.description || " "}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2">
                        {form.panel_type === "dropdown" ? (
                          <div className="flex items-center justify-between rounded-md border border-[#1e1f22] bg-[#1e1f22] px-3 py-2 text-sm text-[#b5bac1]">
                            <span className="truncate">{form.dropdown_placeholder}</span>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        ) : (
                          <button type="button" className={`rounded-md px-3 py-1.5 text-sm font-medium ${buttonStyle.className}`}>
                            {form.button_emoji} {form.button_label}
                          </button>
                        )}
                      </div>

                      {form.panel_type === "dropdown" && options.length > 0 ? (
                        <div className="mt-2 overflow-hidden rounded-md border border-white/[0.05] bg-[#1e1f22]">
                          {options.slice(0, 5).map((option, index) => (
                            <div key={index} className="border-b border-white/[0.04] px-3 py-2.5 last:border-b-0">
                              <div className="text-sm text-white/90">{option.emoji} {option.label}</div>
                              {option.description ? <div className="mt-0.5 text-[11px] text-white/40">{option.description}</div> : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-white/[0.055] p-4">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.055] bg-white/[0.018] px-3.5 py-3">
                  <div className="min-w-0">
                    <div className="text-[10px] text-white/25">Destination</div>
                    <div className="mt-1 truncate text-xs font-medium text-white/65">
                      {selectedChannel ? `# ${selectedChannel.name}` : "No channel selected"}
                    </div>
                  </div>
                  <Hash className="h-4 w-4 shrink-0 text-white/25" />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardShell>
  );
}
